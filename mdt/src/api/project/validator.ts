import Joi from "joi";
import { email } from "zod";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Validate creating a project
export const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Project name cannot be empty",
    "string.max": "Project name must be less than 255 characters",
  }),
  description: Joi.string().max(1000).optional(),
  ownerId: Joi.string().pattern(uuidPattern).required()
    .messages({
      "string.pattern.base": "Invalid owner ID format",
    }),
});

// Validate adding a project member
export const addProjectMemberSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      "string.email": "Invalid email format",
    }),
  role: Joi.string().max(50).optional(),
});