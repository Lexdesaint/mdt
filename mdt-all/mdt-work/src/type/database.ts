
export interface DatabaseConfig {
  NODE_ENV: string;
  HOST: string;
  PORT: number;
  NAME: string;
  USER: string;
  SSL?: boolean;
  PASSWORD: string;
  MAX_CONNECTIONS:number
}

// Re-export AuthenticatedRequest for backward compatibility
export { AuthenticatedRequest } from './request';
