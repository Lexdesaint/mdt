"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRouteValidator = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../../generated/prisma");
exports.updateRouteValidator = [
    (0, express_validator_1.body)("enabled")
        .optional()
        .isBoolean()
        .withMessage("enabled must be a boolean"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(Object.values(prisma_1.ApiRouteStatus)) // 👈 dynamic enum validation
        .withMessage(`status must be one of: ${Object.values(prisma_1.ApiRouteStatus).join(", ")}`),
    (0, express_validator_1.body)("message")
        .optional()
        .isString()
        .withMessage("message must be a string"),
];
