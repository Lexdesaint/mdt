"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRoutes = exports.routes = void 0;
const route_1 = __importDefault(require("../api/auth/route"));
const authMiddleware_1 = require("../middleware/auth/authMiddleware");
const route_2 = __importDefault(require("../api/apiRoute/route"));
const isAdmin_1 = require("../middleware/auth/isAdmin");
const route_3 = __importDefault(require("../api/logger/route"));
exports.routes = [
    { path: "/api/v1/auth", handler: route_1.default, middlewares: [] },
    { path: "/api/v1/logs", handler: route_3.default, middlewares: [authMiddleware_1.authMiddleware, isAdmin_1.isAdmin] },
    // { path: "/api/v1/users", handler: userRouter, middlewares: [authMiddleware] },
    // { path: "/api/v1/wallets", handler: walletRouter, middlewares: [authMiddleware] },
    { path: "/api/v1/apiroute", handler: route_2.default, middlewares: [authMiddleware_1.authMiddleware, isAdmin_1.isAdmin] },
    // { path: "/api/v1/notifications", handler: notificationRouter, middlewares: [authMiddleware] },
    // { path: "/api/v1/groups", handler: createPlanRouter, middlewares: [authMiddleware] },
    // { path: "/api/v1/invite", handler: createPlanRouter, middlewares: [authMiddleware] },
    //  { path: "/api/v1/upload", handler: uploadRouter, middlewares: [authMiddleware] },
    //   { path: "/api/v1/kyc", handler: kycRouter, middlewares: [authMiddleware] },
    // // { path: "/api/v1/admin", handler: adminRouter, middlewares: [authMiddleware] },
    // { path: "/api/v1/transaction", handler: transactionRouter },
];
// /api/v1/esusu
const applyRoutes = async (app) => {
    // await syncRoutesWithDb();
    exports.routes.forEach((route) => {
        if (route.middlewares?.length) {
            app.use(route.path, ...route.middlewares, route.handler);
        }
        else {
            app.use(route.path, route.handler); ///, routeGuard
        }
    });
};
exports.applyRoutes = applyRoutes;
