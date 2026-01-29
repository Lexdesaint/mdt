import { Sequelize, Options } from 'sequelize';
import { DatabaseConfig } from '../../type/database';
import { config } from '../../config/env';

class SequelizeDatabase {
  private static instance: SequelizeDatabase;
  private sequelize: Sequelize;
  private config: DatabaseConfig;
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 5000;

  private constructor() {
    this.config = config;
    this.sequelize = this.createConnection();
  }

  static getInstance(): SequelizeDatabase {
    if (!SequelizeDatabase.instance) {
      SequelizeDatabase.instance = new SequelizeDatabase();
    }
    return SequelizeDatabase.instance;
  }

  private createConnection(): Sequelize {
    const sequelizeOptions: Options = {
      host: this.config.HOST,
      port: this.config.PORT,
      username: this.config.USER,
      password: this.config.PASSWORD,
      database: this.config.NAME,
      dialect: 'postgres',
      dialectOptions: {
        ssl: this.config.SSL
      },
      pool: {
        max: this.config.MAX_CONNECTIONS,
        min: 0,
      },
      logging: config.NODE_ENV === 'development' ? 
        (sql: string) => {
          console.log('🗃️  SQL:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
        } : false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      timezone: '+00:00',
      benchmark: true,
      logQueryParameters: config.NODE_ENV === 'development'
    };

    return new Sequelize(sequelizeOptions);
  }


  async connect(): Promise<void> {
    try {

      await this.sequelize.authenticate();

    } catch (error) {
      this.isConnected = false;
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying connection in ${this.retryDelay / 1000} seconds... (${this.retryCount}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.connect();
        }, this.retryDelay);
      } else {
        throw new Error(`Sequelize connection failed after ${this.maxRetries} attempts: ${error}`);
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        this.isConnected = false;
       
      }
    } catch (error) {
      throw error;
    }
  }

  getSequelize(): Sequelize {
    return this.sequelize;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

export const database = SequelizeDatabase.getInstance();
