"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/database/prisma"));
const prisma_2 = require("../generated/prisma");
async function main() {
    // ---------- API ROUTES ----------
    const apiRoutes = [
        {
            path: "/api/v1/users",
            enabled: true,
            status: prisma_2.ApiRouteStatus.active, // 👈 use enum, not string
            message: "User routes are available",
        },
        {
            path: "/api/v1/apiroute",
            enabled: true,
            status: prisma_2.ApiRouteStatus.active,
            message: "API route is available",
        },
        {
            path: "/api/v1/auth",
            enabled: true,
            status: prisma_2.ApiRouteStatus.active,
            message: "Auth route is available",
        },
        {
            path: "/api/v1/logs",
            enabled: true,
            status: prisma_2.ApiRouteStatus.active,
            message: "Logs route is available",
        },
    ];
    for (const route of apiRoutes) {
        await prisma_1.default.apiRoute.upsert({
            where: { path: route.path },
            update: {
                enabled: route.enabled,
                status: route.status,
                message: route.message,
            },
            create: route,
        });
    }
    console.log("API Routes seeded/updated");
}
main()
    .then(async () => {
    await prisma_1.default.$disconnect();
})
    .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma_1.default.$disconnect();
    process.exit(1);
});
