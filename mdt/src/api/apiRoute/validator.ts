import { body } from "express-validator";
import { ApiRouteStatus } from "../../generated/prisma";

export const updateRouteValidator = [
  body("enabled")
    .optional()
    .isBoolean()
    .withMessage("enabled must be a boolean"),

  body("status")
    .optional()
    .isIn(Object.values(ApiRouteStatus)) // 👈 dynamic enum validation
    .withMessage(
      `status must be one of: ${Object.values(ApiRouteStatus).join(", ")}`
    ),

  body("message")
    .optional()
    .isString()
    .withMessage("message must be a string"),
];
