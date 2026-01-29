import { Express } from "express";
import authRoutes from "../api/auth/route";
import { authMiddleware } from "../middleware/auth/authMiddleware";
import projectRoutes from "../api/project/route";
import taskRoutes from "../api/task/route";
import commentRoutes from "../api/comment/route";
// import userRouter from "../api/user/route";
// import walletRouter from "../api/wallet/route";
// import notificationRouter from "../api/notification/route";
// import createPlanRouter from "../api/group/route";
import { routeGuard } from "../middleware/routeGuard";
import apiRouteRouter from "../api/apiRoute/route";
import { isAdmin } from "../middleware/auth/isAdmin";
import logRoutes from "../api/logger/route";
// import uploadRouter from "../api/upload/route";
// import kycRouter from "../api/kyc/route";
// // import adminRouter from "../api/admin/route";
// import transactionRouter from "../api/transaction/route";

export interface RouteConfig {
  path: string;
  handler: any;
  middlewares?: any[];
}

export const routes: RouteConfig[] = [
  { path: "/api/v1/auth", handler: authRoutes, middlewares: [] },
  { path: "/api/v1", handler: projectRoutes, middlewares: [authMiddleware] },
  { path: "/api/v1", handler: taskRoutes, middlewares: [authMiddleware] },
  { path: "/api/v1", handler: commentRoutes, middlewares: [authMiddleware] },
  { path: "/api/v1/logs", handler: logRoutes, middlewares: [authMiddleware, isAdmin] },
  // { path: "/api/v1/users", handler: userRouter, middlewares: [authMiddleware] },
  // { path: "/api/v1/wallets", handler: walletRouter, middlewares: [authMiddleware] },
  { path: "/api/v1/apiroute", handler: apiRouteRouter, middlewares: [authMiddleware, isAdmin] },
  // { path: "/api/v1/notifications", handler: notificationRouter, middlewares: [authMiddleware] },
  // { path: "/api/v1/groups", handler: createPlanRouter, middlewares: [authMiddleware] },
  // { path: "/api/v1/invite", handler: createPlanRouter, middlewares: [authMiddleware] },
  //  { path: "/api/v1/upload", handler: uploadRouter, middlewares: [authMiddleware] },
  //   { path: "/api/v1/kyc", handler: kycRouter, middlewares: [authMiddleware] },
  // // { path: "/api/v1/admin", handler: adminRouter, middlewares: [authMiddleware] },
  // { path: "/api/v1/transaction", handler: transactionRouter },
];

// /api/v1/esusu
export const applyRoutes = async (app: Express) => {
  // await syncRoutesWithDb();

  routes.forEach((route) => {
    if (route.middlewares?.length) {
      app.use(route.path, routeGuard, ...route.middlewares, route.handler);
    } else {
      app.use(route.path, routeGuard, route.handler);
    }
  });
};
