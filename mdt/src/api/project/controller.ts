import { Request, Response } from "express";
import { addProjectMemberSchema, createProjectSchema } from "./validator";
import { AuthenticatedRequest } from "../../type/request";
import { projectServiceAddMember, projectServiceCreate, projectServiceGetAll } from "./service";
import { ResponseFormatter } from "../../type/response";



export const ProjectController = {
  createProject: async (req: AuthenticatedRequest, res: Response) => {
    try {
      
      const { error, value } = createProjectSchema.validate(req.body);
      
      if (error) return ResponseFormatter.error(res, error.details[0].message, 400);
      if (!req.user || !req.user.user_id) return ResponseFormatter.error(res, "Unauthorized", 401);
      const result = await projectServiceCreate(value);
      return result.success
        ? ResponseFormatter.success(res, result.message, result.data, 201)
        : ResponseFormatter.error(res, result.message, 400);
    } catch (error: any) {
      return ResponseFormatter.error(res, error.message || "Internal Server Error", 500);
    }
  },

  getProjects: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || !req.user.user_id) return ResponseFormatter.error(res, "Unauthorized", 401);
      const result = await projectServiceGetAll(req.user.user_id);
      return result.success
        ? ResponseFormatter.success(res, result.message, result.data, 200)
        : ResponseFormatter.error(res, result.message, 400);
    } catch (error: any) {
      return ResponseFormatter.error(res, error.message || "Internal Server Error", 500);
    }
  },

  addMember: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || !req.user.user_id) return ResponseFormatter.error(res, "Unauthorized", 401);
      const { projectId } = req.params;
      const { error, value } = addProjectMemberSchema.validate(req.body);
      if (error) return ResponseFormatter.error(res, error.details[0].message, 400);

      const result = await projectServiceAddMember(projectId, value);
      return result.success
        ? ResponseFormatter.success(res, result.message, result.data, 201)
        : ResponseFormatter.error(res, result.message, 400);
    } catch (error: any) {
      return ResponseFormatter.error(res, error.message || "Internal Server Error", 500);
    }
  },

};