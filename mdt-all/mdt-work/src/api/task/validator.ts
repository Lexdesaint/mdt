// src/validators/task.validator.ts
import Joi from "joi";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


// Validate creating a task
export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(null, "").optional(),
  createdById: Joi.string().pattern(uuidPattern).required(),
  assignedToId: Joi.string().pattern(uuidPattern).optional(),
});

// Validate updating a task
export const updateTaskSchema = Joi.object({
  status: Joi.string().valid("TODO", "IN_PROGRESS", "DONE").optional(),
  title: Joi.string().min(1).optional(),
  description: Joi.string().allow(null, "").optional(),
  assignedToId: Joi.string().pattern(uuidPattern).optional(),
});
