"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
function isAdmin(req, res, next) {
    const user = req.user;
    if (!user || user.role.toLowerCase() !== "admin") {
        return res.status(403).json({ message: "Admins only" });
    }
    next();
}
