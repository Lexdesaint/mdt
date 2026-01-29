import prisma from "../config/database/prisma";
import bcrypt from "bcryptjs";
import { config } from "../config/env";
import { ApiRouteStatus } from "../generated/prisma";

async function main() {
  // ---------- API ROUTES ----------
  const apiRoutes = [
    {
      path: "/api/v1/users",
      enabled: true,
      status: ApiRouteStatus.active, // 👈 use enum, not string
      message: "User routes are available",
    },

    {
      path: "/api/v1/apiroute",
      enabled: true,
      status: ApiRouteStatus.active,
      message: "API route is available",
    },
    {
      path: "/api/v1/auth",
      enabled: true,
      status: ApiRouteStatus.active,
      message: "Auth route is available",
    },
    {
      path: "/api/v1/logs",
      enabled: true,
      status: ApiRouteStatus.active,
      message: "Logs route is available",
    },
       {
      path: "/api/v1",
      enabled: true,
      status: ApiRouteStatus.active,
      message: "Projects route is available",
    },
    //    {
    //   path: "/api/v1/tasks",
    //   enabled: true,
    //   status: ApiRouteStatus.active,
    //   message: "Logs route is available",
    // },
    
    
  ];

  for (const route of apiRoutes) {
    await prisma.apiRoute.upsert({
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
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
