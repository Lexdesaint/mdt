"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const prisma_1 = require("./config/database/prisma");
const env_1 = require("./config/env");
const swagger_1 = require("./config/swagger");
const routeConfig_1 = __importDefault(require("./routes/routeConfig"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// Swagger Documentation
(0, swagger_1.setupSwagger)(app);
// Routes
(0, routeConfig_1.default)(app);
// Database + Server boot
(async () => {
    try {
        await prisma_1.prisma.$connect();
        console.log("Database connected successfully");
        const server = (0, http_1.createServer)(app);
        server.listen(env_1.SERVER_PORT, '0.0.0.0', () => {
            console.log(`Server running on http://localhost:${env_1.SERVER_PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to connect to DB:", error);
        process.exit(1); // Exit process if DB never connects
    }
})();
// app.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on port 3000');
// });
