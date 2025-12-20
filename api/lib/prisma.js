const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient({
    log: ["query", "error"], // optional but useful
});

module.exports = prisma;