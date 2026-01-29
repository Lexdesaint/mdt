import { Router } from 'express';
import { TaskController } from './controller';


const taskRoutes = Router();


// swagger

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the task
 *           example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
 *         projectId:
 *           type: string
 *           format: uuid
 *           description: Identifier of the project this task belongs to
 *           example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4'
 *         title:
 *           type: string
 *           description: Title of the task
 *           example: 'Task 1'
 *         description:
 *           type: string
 *           description: Description of the task
 *           example: 'Description of task 1'
 *         status:
 *           type: string
 *           description: Status of the task (TODO | IN_PROGRESS | DONE)
 *           example: 'TODO'
 *         assignedToId:
 *           type: string
 *           format: uuid
 *           description: Identifier of the user assigned to the task
 *           example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4'
 *         createdById:
 *           type: string
 *           format: uuid
 *           description: Identifier of the user who created the task
 *           example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4'
 *         createdBy:
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
 *           description: Timestamp when the task was created
 *           example: '2023-08-15T10:20:30Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the task was last updated
 *           example: '2023-08-15T10:20:30Z'
 * paths:
 *   /api/v1/projects/{projectId}/tasks:
 *     post:
 *       summary: Create a new task
 *       tags: [Tasks]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: projectId
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
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdById:
 *                   type: string
 *                   format: uuid
 *                 assignedToId:
 *                   type: string
 *                   format: uuid
 *       responses:
 *         201:
 *           description: Task created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Task'
 *         400:
 *           description: Invalid input
 *     get:
 *       summary: Get all tasks for a project
 *       tags: [Tasks]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: projectId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *             enum: [TODO, IN_PROGRESS, DONE]
 *           description: Filter tasks by status
 *         - in: query
 *           name: sort
 *           schema:
 *             type: string
 *             enum: [asc, desc]
 *           description: Sort order by creation date
 *       responses:
 *         200:
 *           description: Tasks retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Task'
 *   /api/v1/tasks/{taskId}:
 *     patch:
 *       summary: Update a task
 *       tags: [Tasks]
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
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [TODO, IN_PROGRESS, DONE]
 *                 assignedToId:
 *                   type: string
 *                   format: uuid
 *       responses:
 *         200:
 *           description: Task updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Task'
 *         400:
 *           description: Invalid input
 */
taskRoutes.post("/projects/:projectId/tasks", TaskController.createTask);

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLite:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         projectId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *         assignedToId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         assignedTo:
 *           $ref: '#/components/schemas/UserLite'
 *         createdById:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 42
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *     PaginatedTasks:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 * paths:
 *   /api/v1/projects/{projectId}/tasks:
 *     get:
 *       summary: Get all tasks for a project
 *       tags: [Tasks]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: projectId
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *             enum: [TODO, IN_PROGRESS, DONE]
 *           description: Filter tasks by status
 *         - in: query
 *           name: sort
 *           schema:
 *             type: string
 *             enum: [asc, desc]
 *           description: Sort tasks by creation date
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *           description: Page number
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 10
 *           description: Number of tasks per page
 *       responses:
 *         200:
 *           description: Tasks retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/PaginatedTasks'
 *         401:
 *           description: Unauthorized
 */

taskRoutes.get("/projects/:projectId/tasks", TaskController.getTasks);
taskRoutes.patch("/tasks/:taskId", TaskController.updateTask);

export default taskRoutes;




