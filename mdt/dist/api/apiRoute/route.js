"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const validator_1 = require("./validator");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const isAdmin_1 = require("../../middleware/auth/isAdmin");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/apiroute:
 *   get:
 *     summary: Get all API routes
 *     description: Retrieve a list of all registered API routes (admin only).
 *     tags: [ApiRoute]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of API routes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApiRoute'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - user is not an admin
 */
router.get("/", authMiddleware_1.authMiddleware, isAdmin_1.isAdmin, controller_1.ApiRouteController.getRoutes);
/**
 * @swagger
 * /api/v1/apiroute/{path}:
 *   put:
 *     summary: Update an API route
 *     description: Update the configuration of an API route by its `path` (admin only).
 *     tags: [ApiRoute]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique path identifier of the API route to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Whether the route is enabled or disabled
 *               status:
 *                 type: string
 *                 enum: [active, maintenance, deprecated]
 *                 description: Status of the route
 *               message:
 *                 type: string
 *                 nullable: true
 *                 description: Optional message or reason
 *     responses:
 *       200:
 *         description: API route updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiRoute'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - user is not an admin
 *       404:
 *         description: Route not found
 */
router.put("/:path", authMiddleware_1.authMiddleware, isAdmin_1.isAdmin, validator_1.updateRouteValidator, validate_1.validate, controller_1.ApiRouteController.updateRoute);
exports.default = router;
