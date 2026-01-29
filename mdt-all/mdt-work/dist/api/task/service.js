"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskServiceUpdate = exports.taskServicGetByProject = exports.taskServicCreate = void 0;
const prisma_1 = __importDefault(require("../../config/database/prisma"));
// export const TaskService = {
const taskServicCreate = async (projectId, data) => {
    try {
        const task = await prisma_1.default.task.create({
            data: { ...data, projectId },
        });
        return { success: true, message: "Task created successfully", data: task };
    }
    catch (error) {
        console.error("Error in TaskService.create:", error);
        return { success: false, message: error.message || "Internal Server Error" };
    }
};
exports.taskServicCreate = taskServicCreate;
const taskServicGetByProject = async (projectId, status, sort = "asc") => {
    try {
        const tasks = await prisma_1.default.task.findMany({
            where: { projectId, ...(status && { status }) },
            orderBy: { createdAt: sort },
        });
        return { success: true, message: "Tasks retrieved successfully", data: tasks };
    }
    catch (error) {
        console.error("Error in TaskService.getByProject:", error);
        return { success: false, message: error.message || "Internal Server Error" };
    }
};
exports.taskServicGetByProject = taskServicGetByProject;
const taskServiceUpdate = async (taskId, data) => {
    try {
        const task = await prisma_1.default.task.update({
            where: { id: taskId },
            data,
        });
        return { success: true, message: "Task updated successfully", data: task };
    }
    catch (error) {
        console.error("Error in TaskService.update:", error);
        return { success: false, message: error.message || "Internal Server Error" };
    }
};
exports.taskServiceUpdate = taskServiceUpdate;
