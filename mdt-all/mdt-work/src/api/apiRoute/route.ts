import { Router } from "express";
import { ApiRouteController } from "./controller";
import { updateRouteValidator } from "./validator";
import { authMiddleware } from "../../middleware/auth/authMiddleware";
import { isAdmin } from "../../middleware/auth/isAdmin";
import { validate } from "../../middleware/validate";

const router = Router();

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
router.get("/", authMiddleware, isAdmin, ApiRouteController.getRoutes);

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
router.put(
  "/:path",
  authMiddleware,
  isAdmin,
  updateRouteValidator,
  validate,
  ApiRouteController.updateRoute
);

export default router;
