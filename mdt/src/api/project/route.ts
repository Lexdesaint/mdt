import { Router } from 'express';
import { ProjectController } from './controller';

export const projectRoutes = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the project
 *         name:
 *           type: string
 *           description: Name of the project
 *         description:
 *           type: string
 *           description: Description of the project
 *         ownerId:
 *           type: string
 *           format: uuid
 *           description: Identifier of the project owner
 *         owner:
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
 *         members:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the project was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the project was last updated
 *     ProjectMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: Identifier of the member
 *         role:
 *           type: string
 *           description: Role of the member in the project
 *         joinedAt:
 *           type: string
 *           format: date-time
 * paths:
 *   /api/v1/projects:
 *     post:
 *       summary: Create a new project
 *       tags: [Projects]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 ownerId:
 *                   type: string
 *                   format: uuid
 *       responses:
 *         201:
 *           description: Project created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Project'
 *         400:
 *           description: Invalid input
 *     get:
 *       summary: Get all projects
 *       tags: [Projects]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Projects retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Project'
 *   /api/v1/projects/{projectId}/members:
 *     post:
 *       summary: Add a member to a project
 *       tags: [Projects]
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
 *                 email:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *       responses:
 *         201:
 *           description: Member added successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ProjectMember'
 *         400:
 *           description: Invalid input
 */

projectRoutes.post("/projects", ProjectController.createProject);
projectRoutes.get("/projects", ProjectController.getProjects);
projectRoutes.post("/projects/:projectId/members", ProjectController.addMember);

export default projectRoutes;




