"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const validator_1 = require("./validator");
const service_1 = require("./service");
const response_1 = require("../../type/response");
exports.ProjectController = {
    createProject: async (req, res) => {
        try {
            const { error, value } = validator_1.createProjectSchema.validate(req.body);
            if (error)
                return response_1.ResponseFormatter.error(res, error.details[0].message, 400);
            const result = await (0, service_1.projectServiceCreate)(value);
            return result.success
                ? response_1.ResponseFormatter.success(res, result.message, result.data, 201)
                : response_1.ResponseFormatter.error(res, result.message, 400);
        }
        catch (error) {
            return response_1.ResponseFormatter.error(res, error.message || "Internal Server Error", 500);
        }
    },
    getProjects: async (req, res) => {
        try {
            const result = await (0, service_1.projectServiceGetAll)();
            return result.success
                ? response_1.ResponseFormatter.success(res, result.message, result.data, 200)
                : response_1.ResponseFormatter.error(res, result.message, 400);
        }
        catch (error) {
            return response_1.ResponseFormatter.error(res, error.message || "Internal Server Error", 500);
        }
    },
    addMember: async (req, res) => {
        try {
            const { projectId } = req.params;
            const { error, value } = validator_1.addProjectMemberSchema.validate(req.body);
            if (error)
                return response_1.ResponseFormatter.error(res, error.details[0].message, 400);
            const result = await (0, service_1.projectServiceAddMember)(projectId, value);
            return result.success
                ? response_1.ResponseFormatter.success(res, result.message, result.data, 201)
                : response_1.ResponseFormatter.error(res, result.message, 400);
        }
        catch (error) {
            return response_1.ResponseFormatter.error(res, error.message || "Internal Server Error", 500);
        }
    },
};
