import { Router } from 'express';
import { register, login, getAccessTokenFromRefresh, getRefreshToken} from './controller';
import { authMiddleware } from '../../middleware/auth/authMiddleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - password
 *         - confirm_password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           pattern: '^[a-zA-Z\s]+$'
 *           description: Name (letters and spaces only)
 *           example: John
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (optional)
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
 *           description: Password (min 8 chars, must contain uppercase, lowercase, number, special char)
 *           example: 'MySecure123!'
 *         confirm_password:
 *           type: string
 *           minLength: 8
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
 *           description: Password (min 8 chars, must contain uppercase, lowercase, number, special char)
 *           example: 'MySecure123!'
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (optional)
 *           example: john.doe@example.com
 
 *         password:
 *           type: string
 *           description: User password
 *           example: 'MySecure123!'
 *     
 *     VerifyEmailRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: Email verification token
 *           example: 'abc123def456'
 *     
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - phone_number
 *       properties:
 *         phone_number:
 *           type: string
 *           pattern: '^[\+]?[\d\s\-\(\)]+$'
 *           description: Phone number for password reset
 *           example: '+27123456789'
     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - phone_number
 *         - otp_code
 *         - new_password
 *         - confirm_password
 *       properties:
 *         phone_number:
 *           type: string
 *           pattern: '^[\+]?[\d\s\-\(\)]+$'
 *           description: Phone number
 *           example: '+27123456789'
 *         otp_code:
 *           type: string
 *           pattern: '^\d{6}$'
 *           minLength: 6
 *           maxLength: 6
 *           description: 6-digit OTP code received via SMS
 *           example: '123456'
 *         new_password:
 *           type: string
 *           minLength: 8
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
 *           description: New password (min 8 chars, must contain uppercase, lowercase, number, and special character)
 *           example: 'NewPassword123!'
 *         confirm_password:
 *           type: string
 *           description: Confirmation of new password (must match new_password)
 *           example: 'NewPassword123!'
     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: 'Registration successful'
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *         statusCode:
 *           type: integer
 *           example: 201
 */

const authRouter = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user with the provided details
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or registration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */







 
authRouter.post('/register', register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/login', login);


/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   get:
 *     summary: Issue a refresh token for the authenticated user
 *     description: Requires a valid access token. Returns a new refresh token and session info.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Refresh token issued
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
authRouter.get('/refresh-token', authMiddleware, getRefreshToken);

/**
 * @swagger
 * /api/v1/auth/access-token:
 *   post:
 *     summary: Generate new access token using a refresh token
 *     description: Exchange a valid refresh token for a new access token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token generated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
authRouter.post('/access-token', getAccessTokenFromRefresh);

export default authRouter;
