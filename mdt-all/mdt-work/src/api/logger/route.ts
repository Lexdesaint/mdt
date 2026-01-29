import { Router } from 'express';
import { getLogs } from './controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLogEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the log entry
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the log entry was created
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: Log level
 *         message:
 *           type: string
 *           description: Log message
 *         method:
 *           type: string
 *           description: HTTP method
 *         url:
 *           type: string
 *           description: Request URL
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *         responseTime:
 *           type: number
 *           description: Response time in milliseconds
 *         clientIp:
 *           type: string
 *           description: Client IP address
 *         userAgent:
 *           type: string
 *           description: User agent string
 *         userId:
 *           type: string
 *           description: User ID if authenticated
 *         metadata:
 *           type: object
 *           description: Additional metadata
 *     LogsResponse:
 *       type: object
 *       properties:
 *         logs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AuditLogEntry'
 *         total:
 *           type: integer
 *           description: Total number of logs
 *         limit:
 *           type: integer
 *           description: Number of logs per page
 *         offset:
 *           type: integer
 *           description: Number of logs skipped
 *     LogStats:
 *       type: object
 *       properties:
 *         totalLogs:
 *           type: integer
 *           description: Total number of logs
 *         logsByLevel:
 *           type: object
 *           properties:
 *             info:
 *               type: integer
 *             warn:
 *               type: integer
 *             error:
 *               type: integer
 *             debug:
 *               type: integer
 *         recentActivity:
 *           type: object
 *           properties:
 *             last24Hours:
 *               type: integer
 *             lastWeek:
 *               type: integer
 *             lastMonth:
 *               type: integer
 */

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieve audit logs with optional filtering
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering logs
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug]
 *         description: Log level to filter by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logs retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/LogsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve logs"
 *                 data:
 *                   type: string
 *                   example: "Error details"
 */
router.get('/', getLogs);


export default router;