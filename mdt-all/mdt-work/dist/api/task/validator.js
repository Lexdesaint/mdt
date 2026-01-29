"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validate creating a task
exports.createTaskSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).required(),
    description: joi_1.default.string().optional(),
    createdById: joi_1.default.string().guid({ version: ["uuidv4", "uuidv5"] }).required(),
    assignedToId: joi_1.default.string().guid({ version: ["uuidv4", "uuidv5"] }).optional(),
});
// Validate updating a task
exports.updateTaskSchema = joi_1.default.object({
    status: joi_1.default.string().valid("TODO", "IN_PROGRESS", "DONE").optional(),
    title: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    assignedToId: joi_1.default.string().guid({ version: ["uuidv4", "uuidv5"] }).optional(),
});
