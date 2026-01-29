import { Response } from "express";
import { AuthenticatedRequest } from "../../type/request";
import { createComment, getCommentsByTask } from "./service";
import { ResponseFormatter } from "../../type/response";

export const CommentController = {
  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const { content } = req.body;
      if (!content) return ResponseFormatter.error(res, "Content required", 400);
      if (!req.user || !req.user.user_id) return ResponseFormatter.error(res, "Unauthorized", 401);

      const result = await createComment(taskId, { content, userId: req.user.user_id });
      return result.success
        ? ResponseFormatter.success(res, result.message, result.data, 201)
        : ResponseFormatter.error(res, result.message, 400);
    } catch (err: any) {
      return ResponseFormatter.error(res, err.message || "Internal Server Error", 500);
    }
  },

  list: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const result = await getCommentsByTask(taskId);
      return result.success
        ? ResponseFormatter.success(res, result.message, result.data, 200)
        : ResponseFormatter.error(res, result.message, 400);
    } catch (err: any) {
      return ResponseFormatter.error(res, err.message || "Internal Server Error", 500);
    }
  },
};
