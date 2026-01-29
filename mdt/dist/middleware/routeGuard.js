"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeGuard = routeGuard;
async function routeGuard(req, res, next) {
    try {
        // Route guard disabled until apiRoute model is added to schema
        // TODO: Add apiRoute model to prisma/schema.prisma to enable route guarding
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
