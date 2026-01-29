import dotenv from 'dotenv';
import { DatabaseConfig } from '../type/database';

// Load environment variables from .env file
dotenv.config();

interface Config extends DatabaseConfig {
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  FRONTEND_URL: string;
}

// Parse DATABASE_URL if provided, otherwise use individual DB config
const parseDatabaseUrl = (url: string) => {
  const match = url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (match) {
    return {
      USER: match[1],
      PASSWORD: match[2],
      HOST: match[3],
      PORT: parseInt(match[4]),
      NAME: match[5]
    };
  }
  throw new Error('Invalid DATABASE_URL format');
};

const databaseConfig = process.env.DATABASE_URL 
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : {
      HOST: process.env.DB_HOST || 'localhost',
      PORT: parseInt(process.env.DB_PORT || '5432'),
      USER: process.env.DB_USER || 'postgres',
      PASSWORD: process.env.DB_PASSWORD || '',
      NAME: process.env.DB_NAME || 'task_management_application'
    };

export const config: Config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  HOST: databaseConfig.HOST,
  PORT: databaseConfig.PORT,
  USER: databaseConfig.USER,
  PASSWORD: databaseConfig.PASSWORD,
  NAME: databaseConfig.NAME,
  SSL: process.env.NODE_ENV === 'production',
  MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',

  // Other configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Export server port separately to avoid conflicts
export const SERVER_PORT = parseInt(process.env.PORT || '3000');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`); 
  }
}