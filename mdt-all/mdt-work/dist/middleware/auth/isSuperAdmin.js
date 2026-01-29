"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = isSuperAdmin;
function isSuperAdmin(req, res, next) {
    const user = req.user;
    if (!user || !user.is_super_admin) {
        return res.status(403).json({ message: "Super Admins only" });
    }
    next();
}
