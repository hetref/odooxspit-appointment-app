"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authStorage } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface ConnectRazorpayButtonProps {
  className?: string;
}

export function ConnectRazorpayButton({ className }: ConnectRazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = () => {
    try {
      setLoading(true);
      const token = authStorage.getAccessToken();

      if (!token) {
        setLoading(false);
        router.push("/login?redirect=/dashboard/org/settings");
        return;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      // This endpoint redirects to Razorpay's OAuth screen. Pass token via query string.
      const url = `${apiBaseUrl}/auth/razorpay/connect?token=${encodeURIComponent(token)}`;
      window.location.href = url;
    } finally {
      // Loading state will effectively stop once navigation happens
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <Button onClick={handleConnect} className={className} disabled={loading}>
      {loading ? "Redirecting to Razorpay..." : "Connect Razorpay"}
    </Button>
  );
}
