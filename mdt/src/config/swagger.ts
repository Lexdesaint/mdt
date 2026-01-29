import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import { SERVER_PORT } from './env';

const isProduction = process.env.NODE_ENV === "production";
const basePath = path.resolve(__dirname, "..");
const fileExtension = isProduction ? "js" : "ts";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'mdt API',
      version: '1.0.0',
      description: 'API documentation for mdt backend services',
      contact: {
        name: 'mdt Team',
        email: 'support@hillcrosspay.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${SERVER_PORT}`,
        description: 'Development server'
      },
      {
        // url: 'https://api.dev.hillcrossfinance.com',
        url: 'https://mdt.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number'
            },
            role: {
              type: 'string',
              enum: ['user', 'agent', 'admin'],
              description: 'User role'
            },
            adminType: {
              type: 'string',
              enum: ['super_admin', 'staff'],
              description: 'Admin type (if role is admin)'
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            isPhoneVerified: {
              type: 'boolean',
              description: 'Phone verification status'
            },
            biometric_enabled: {
              type: 'boolean',
              description: 'Biometric login status'
            },
            account_status: {
              type: 'string',
              enum: ['ACTIVE', 'FROZEN', 'CLOSED'],
              description: 'Account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
         ApiRoute: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'The unique path identifier of the API route' },
            enabled: { type: 'boolean', description: 'Whether the route is enabled or disabled' },
            status: { type: 'string', enum: ['active', 'maintenance', 'deprecated'], description: 'Status of the route' },
            message: { type: 'string', nullable: true, description: 'Optional message or reason' }
          }
        },
        Notification: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Notification UUID' },
        user_id: { type: 'string', format: 'uuid', nullable: true, description: 'Target user ID (null = general notification)' },
        title: { type: 'string', maxLength: 150, description: 'Notification title' },
        message: { type: 'string', nullable: true, description: 'Optional message content' },
        type: { 
          type: 'string',
          enum: ['INFO', 'WARNING', 'ERROR', 'WITHDRAWAL', 'CONTRIBUTION', 'INVITE', 'CREDITED', 'MESSAGE', 'BANNER', 'ALERT'],
          description: 'Type of notification'
        },
        image_url: { type: 'string', format: 'uri', nullable: true, description: 'Optional image URL (for banners)' },
        is_read: { type: 'boolean', description: 'Read status' },
        is_enabled: { type: 'boolean', description: 'Whether notification is enabled (for BANNER toggle)' },
        created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        updated_at: { type: 'string', format: 'date-time', description: 'Last updated timestamp' }
      }
    },

    NotificationUpdateInput: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 150 },
        message: { type: 'string', nullable: true },
        type: {
          type: 'string',
          enum: ['INFO', 'WARNING', 'ERROR', 'WITHDRAWAL', 'CONTRIBUTION', 'INVITE', 'CREDITED', 'MESSAGE', 'BANNER', 'ALERT']
        },
        image_url: { type: 'string', format: 'uri', nullable: true },
        is_read: { type: 'boolean' },
        is_enabled: { type: 'boolean' }
      },
      description: 'Fields available for updating a notification. All are optional.'
    },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        }
      }
    }
  },
  apis: [
    path.join(basePath, `api/*/route.${fileExtension}`),
    path.join(basePath, `api/*/routes.${fileExtension}`),
    path.join(basePath, `routes/*.${fileExtension}`)
  ] // Path to the API files - dynamically uses .js in production, .ts in development
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'mdt API Documentation'
  }));
  
  // Serve swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  
  console.log('📚 Swagger documentation available at /api-docs');
};

export { specs };