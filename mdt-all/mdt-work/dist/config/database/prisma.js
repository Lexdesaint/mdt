"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../../generated/prisma");
// Create a single instance of PrismaClient
const prisma = new prisma_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
exports.prisma = prisma;
// Handle graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
exports.default = prisma;
