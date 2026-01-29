import { Express } from "express";

import { applyRoutes } from "./route";
import {
  bodyParsingErrorHandler,
  bodySizeLimit,
  bodyValidationMiddleware,
  contentTypeValidation,
  enhancedSqlInjectionDetector,
  rateLimiter,
  urlencodedParser,
} from "../middleware";
import { globalErrorHandler } from "../middleware/errorHandler";
import { Logger } from "../api/logger/controller";

export default function routeConfig(app: Express) {
  const logger = Logger.getInstance();

  // Apply logging middleware first
  app.use(logger.requestMiddleware);
  app.use(logger.responseMiddleware);

  app.use(rateLimiter.middleware);
  app.use(contentTypeValidation);
  app.use(bodySizeLimit);
  app.use(urlencodedParser);

  app.use(bodyParsingErrorHandler);

  app.use(bodyValidationMiddleware);

  app.use(enhancedSqlInjectionDetector);

  applyRoutes(app);

  app.use(globalErrorHandler);
}
