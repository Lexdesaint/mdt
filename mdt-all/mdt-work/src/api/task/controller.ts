import { Response } from "express";
import { createTaskSchema, updateTaskSchema } from "./validator";
import { AuthenticatedRequest } from "../../type/request";
import {  taskServiceCreate, taskServiceGetByProject, taskServiceUpdate } from "./service";
import { ResponseFormatter } from "../../type/response";
import { TaskStatus } from "../../generated/prisma";


export const TaskController = {
createTask: async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return ResponseFormatter.error(
        res,
        error.details[0].message,
        400
      );
    }
if (!req.user || !req.user.user_id) return ResponseFormatter.error(res, "Unauthorized", 401);
    const result = await taskServiceCreate(projectId, {
      ...value,
      createdById: req.user.user_id, // ✅ FROM TOKEN
    });

    return result.success
      ? ResponseFormatter.success(res, result.message, result.data, 201)
      : ResponseFormatter.error(res, result.message, 400);

  } catch (err: any) {
    return ResponseFormatter.error(
      res,
      err.message || "Internal Server Error",
      500
    );
  }
},


getTasks: async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.user_id) {
      return ResponseFormatter.error(res, "Unauthorized", 401);
    }

    const { projectId } = req.params;
    const { status, sort, page, limit } = req.query as {
      status?: string;
      sort?: "asc" | "desc";
      page?: string;
      limit?: string;
    };

    const allowedStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

    const safeStatus: TaskStatus | undefined =
      status && allowedStatuses.includes(status as TaskStatus)
        ? (status as TaskStatus)
        : undefined;

    const safePage = page ? Math.max(parseInt(page, 10), 1) : 1;
    const safeLimit = limit ? Math.min(parseInt(limit, 10), 100) : 10;

    const result = await taskServiceGetByProject(
      projectId,
      safeStatus,
      sort ?? "asc",
      safePage,
      safeLimit
    );

    return result.success
      ? ResponseFormatter.success(res, result.message, result.data, 200)
      : ResponseFormatter.error(res, result.message, 400);
  } catch (err: any) {
    return ResponseFormatter.error(
      res,
      err.message || "Internal Server Error",
      500
    );
  }
},


  updateTask: async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user || !req.user.user_id) return ResponseFormatter.error(res, "Unauthorized", 401);
      const { taskId } = req.params;
      const { error, value } = updateTaskSchema.validate(req.body);
      if (error) return ResponseFormatter.error(res, error.details[0].message, 400);

      const result = await taskServiceUpdate(taskId, value);
      return result.success
        ? ResponseFormatter.success(res, result.message, result.data, 200)
        : ResponseFormatter.error(res, result.message, 400);
    } catch (err: any) {
      return ResponseFormatter.error(res, err.message || "Internal Server Error", 500);
    }
  },
}
;