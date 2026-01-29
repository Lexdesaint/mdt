import { Router } from 'express';
import { CommentController } from './controller';

const commentRoutes = Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the comment
 *         content:
 *           type: string
 *           description: Comment content
 *         taskId:
 *           type: string
 *           format: uuid
 *           description: Identifier of the task this comment belongs to
 *         user:
 *           type: object
 *           properties:
 *             user_id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the comment was created
 * paths:
 *   /api/v1/projects/tasks/{taskId}/comments:
 *     post:
 *       summary: Create a comment on a task
 *       tags: [Comments]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: taskId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *       responses:
 *         201:
 *           description: Comment created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Comment'
 *         400:
 *           description: Invalid input
 *         401:
 *           description: Unauthorized
 *     get:
 *       summary: Get all comments for a task
 *       tags: [Comments]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: taskId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         200:
 *           description: Comments retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Comment'
 */

// create a comment on a task
commentRoutes.post('/projects/tasks/:taskId/comments', CommentController.create);
// list comments for a task
commentRoutes.get('/projects/tasks/:taskId/comments', CommentController.list);

export default commentRoutes;





