"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routeConfig;
const route_1 = require("./route");
const middleware_1 = require("../middleware");
const errorHandler_1 = require("../middleware/errorHandler");
const controller_1 = require("../api/logger/controller");
function routeConfig(app) {
    const logger = controller_1.Logger.getInstance();
    // Apply logging middleware first
    app.use(logger.requestMiddleware);
    app.use(logger.responseMiddleware);
    app.use(middleware_1.rateLimiter.middleware);
    app.use(middleware_1.contentTypeValidation);
    app.use(middleware_1.bodySizeLimit);
    app.use(middleware_1.urlencodedParser);
    app.use(middleware_1.bodyParsingErrorHandler);
    app.use(middleware_1.bodyValidationMiddleware);
    app.use(middleware_1.enhancedSqlInjectionDetector);
    (0, route_1.applyRoutes)(app);
    app.use(errorHandler_1.globalErrorHandler);
}
