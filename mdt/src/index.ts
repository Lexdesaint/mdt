import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { prisma } from "./config/database/prisma"; 
import { SERVER_PORT } from "./config/env";
import { setupSwagger } from "./config/swagger";


import routeConfig from "./routes/routeConfig";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));


// Swagger Documentation
setupSwagger(app);

// Routes
routeConfig(app);

// Database + Server boot
(async () => {
  try {
    await prisma.$connect(); 
    console.log("Database connected successfully");

    const server = createServer(app);

    server.listen(SERVER_PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${SERVER_PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1); // Exit process if DB never connects
  }
})();


// app.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on port 3000');
// });