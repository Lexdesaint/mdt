"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProjectMemberSchema = exports.createProjectSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Validate creating a project
exports.createProjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(255).required().messages({
        "string.empty": "Project name cannot be empty",
        "string.max": "Project name must be less than 255 characters",
    }),
    description: joi_1.default.string().max(1000).optional(),
    ownerId: joi_1.default.string()
        .guid({ version: ["uuidv4", "uuidv5"] })
        .required()
        .messages({
        "string.guid": "Invalid owner ID format",
    }),
});
// Validate adding a project member
exports.addProjectMemberSchema = joi_1.default.object({
    user_id: joi_1.default.string()
        .guid({ version: ["uuidv4", "uuidv5"] })
        .required()
        .messages({
        "string.guid": "Invalid user ID format",
    }),
    role: joi_1.default.string().max(50).optional(),
});
