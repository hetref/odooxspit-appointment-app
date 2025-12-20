const prisma = require("../lib/prisma");
const {
    getValidAccessTokenForOrganization,
    createOrderForBooking,
    verifyWebhookSignature,
} = require("../lib/razorpay");

// POST /payments/create-order
// Body: { bookingId }
// Requires authenticated user who owns the booking
async function createOrder(req, res) {
    try {
        const userId = req.user.id;
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "bookingId is required",
            });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                appointment: true,
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only pay for your own bookings",
            });
        }

        const appointment = booking.appointment;

        if (!appointment.isPaid || !booking.totalAmount || booking.totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "This booking does not require payment",
            });
        }

        // Ensure organization has a Razorpay connection
        const connection = await getValidAccessTokenForOrganization(appointment.organizationId);

        // Create Razorpay order for this booking
        let order;
        try {
            order = await createOrderForBooking(connection, booking, appointment);
        } catch (err) {
            console.error("Error creating Razorpay order:", err.response?.data || err.message || err);
            return res.status(502).json({
                success: false,
                message: "Failed to create Razorpay order",
            });
        }

        return res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                bookingId: booking.id,
                merchantKeyId: connection.merchantKeyId || null,
            },
        });
    } catch (error) {
        console.error("Create payment order error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
}

// POST /webhooks/razorpay
// Razorpay will send events for connected merchants here
async function handleWebhook(req, res) {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const rawBody = req.rawBody || JSON.stringify(req.body || {});

        if (!signature) {
            return res.status(400).json({ success: false, message: "Missing Razorpay signature" });
        }

        const isValid = verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid Razorpay signature" });
        }

        const payload = req.body;
        const eventType = payload.event;
        const accountId = payload.account_id; // Connected merchant identifier

        if (!accountId) {
            console.error("Razorpay webhook missing account_id", payload);
            return res.status(400).json({ success: false, message: "Missing account_id in webhook" });
        }

        // Find organization connection by Razorpay merchant id
        const connection = await prisma.organizationRazorpayConnection.findFirst({
            where: { razorpayMerchantId: accountId },
        });

        if (!connection) {
            console.error("No organization mapping for Razorpay account", accountId);
            return res.status(404).json({ success: false, message: "Unknown merchant" });
        }

        // Extract booking id from payment notes
        const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
        const notes = paymentEntity?.notes || {};
        const bookingId = notes.bookingId || notes.booking_id;

        if (!bookingId) {
            console.error("No bookingId in Razorpay webhook notes", payload);
            return res.status(400).json({ success: false, message: "Missing booking reference" });
        }

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
            console.error("Booking not found for webhook", bookingId);
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        let paymentStatusUpdate = null;
        let bookingStatusUpdate = null;
        let notificationType = null;
        let notificationMessage = "";

        switch (eventType) {
            case "payment.captured": {
                if (booking.paymentStatus !== "PAID") {
                    paymentStatusUpdate = "PAID";
                }
                if (booking.bookingStatus === "PENDING") {
                    bookingStatusUpdate = "CONFIRMED";
                }
                notificationType = "PAYMENT_RECEIVED";
                notificationMessage = "Your payment has been received and booking is confirmed.";
                break;
            }
            case "payment.failed": {
                if (booking.paymentStatus !== "FAILED") {
                    paymentStatusUpdate = "FAILED";
                }
                if (booking.bookingStatus !== "CANCELLED") {
                    bookingStatusUpdate = "CANCELLED";
                }
                notificationType = "PAYMENT_FAILED";
                notificationMessage = "Your payment failed. Please try again.";
                break;
            }
            case "refund.processed": {
                if (booking.paymentStatus !== "REFUNDED") {
                    paymentStatusUpdate = "REFUNDED";
                }
                // Do not force bookingStatus; organization might decide via dashboard
                notificationType = "PAYMENT_RECEIVED";
                notificationMessage = "Your refund has been processed.";
                break;
            }
            default:
                // Ignore other events gracefully
                return res.json({ success: true, message: "Event ignored" });
        }

        if (paymentStatusUpdate || bookingStatusUpdate) {
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    ...(paymentStatusUpdate && { paymentStatus: paymentStatusUpdate }),
                    ...(bookingStatusUpdate && { bookingStatus: bookingStatusUpdate }),
                },
            });
        }

        if (notificationType) {
            try {
                await prisma.notification.create({
                    data: {
                        userId: booking.userId,
                        type: notificationType,
                        title:
                            notificationType === "PAYMENT_RECEIVED"
                                ? "Payment update"
                                : "Payment failed",
                        message: notificationMessage,
                        relatedId: booking.id,
                        relatedType: "BOOKING",
                    },
                });
            } catch (err) {
                console.error("Failed to create payment notification:", err);
            }
        }

        return res.json({ success: true });
    } catch (error) {
        console.error("Razorpay webhook error:", error);
        return res.status(500).json({ success: false, message: "Webhook processing failed" });
    }
}

module.exports = {
    createOrder,
    handleWebhook,
};
