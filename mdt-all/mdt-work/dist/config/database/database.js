"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("../../config/env");
class SequelizeDatabase {
    constructor() {
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.retryDelay = 5000;
        this.config = env_1.config;
        this.sequelize = this.createConnection();
    }
    static getInstance() {
        if (!SequelizeDatabase.instance) {
            SequelizeDatabase.instance = new SequelizeDatabase();
        }
        return SequelizeDatabase.instance;
    }
    createConnection() {
        const sequelizeOptions = {
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
            logging: env_1.config.NODE_ENV === 'development' ?
                (sql) => {
                    console.log('🗃️  SQL:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
                } : false,
            define: {
                timestamps: true,
                underscored: true,
                freezeTableName: true
            },
            timezone: '+00:00',
            benchmark: true,
            logQueryParameters: env_1.config.NODE_ENV === 'development'
        };
        return new sequelize_1.Sequelize(sequelizeOptions);
    }
    async connect() {
        try {
            await this.sequelize.authenticate();
        }
        catch (error) {
            this.isConnected = false;
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Retrying connection in ${this.retryDelay / 1000} seconds... (${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => {
                    this.connect();
                }, this.retryDelay);
            }
            else {
                throw new Error(`Sequelize connection failed after ${this.maxRetries} attempts: ${error}`);
            }
        }
    }
    async disconnect() {
        try {
            if (this.sequelize) {
                await this.sequelize.close();
                this.isConnected = false;
            }
        }
        catch (error) {
            throw error;
        }
    }
    getSequelize() {
        return this.sequelize;
    }
    isHealthy() {
        return this.isConnected;
    }
}
exports.database = SequelizeDatabase.getInstance();
