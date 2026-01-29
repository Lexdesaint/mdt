"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const validator_1 = require("./validator");
exports.TaskController = {
    createTask: async (req, res) => {
        try {
            const { projectId } = req.params;
            const data = validator_1.createTaskSchema.validate(req.body);
            const task = await TaskService.create(projectId, data);
            res.status(201).json(task);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    getTasks: async (req, res) => {
        const { projectId } = req.params;
        const { status, sort } = req.query;
        const tasks = await TaskService.getByProject(projectId, status, sort || "asc");
        res.json(tasks);
    },
    updateTask: async (req, res) => {
        try {
            const { taskId } = req.params;
            const data = validator_1.updateTaskSchema.validate(req.body);
            const updated = await TaskService.update(taskId, data);
            res.json(updated);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
