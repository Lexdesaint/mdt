import { prisma } from "../../config/database/prisma";

interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface CreateCommentData {
  content: string;
  userId: string;
}

export const createComment = async (
  taskId: string,
  data: CreateCommentData
): Promise<ServiceResponse> => {
  try {
    // 1️⃣ Check if the task exists
    const taskExists = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!taskExists) {
      return {
        success: false,
        message: `Task with id ${taskId} does not exist`,
      };
    }

    // 2️⃣ Optional: Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { user_id: data.userId },
    });

    if (!userExists) {
      return {
        success: false,
        message: `User with id ${data.userId} does not exist`,
      };
    }

    // 3️⃣ Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        taskId,
        userId: data.userId,
      },
      include: {
        user: {
          select: { user_id: true, name: true, email: true },
        },
      },
    });

    return { success: true, message: "Comment created", data: comment };
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return { success: false, message: error.message || "Failed to create comment" };
  }
};

export const getCommentsByTask = async (taskId: string): Promise<ServiceResponse> => {
  try {
    // 1️⃣ Check if the task exists
    const taskExists = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!taskExists) {
      return {
        success: false,
        message: `Task with id ${taskId} does not exist`,
      };
    }

    // 2️⃣ Fetch comments
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { user_id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, message: "Comments retrieved", data: comments };
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return { success: false, message: error.message || "Failed to fetch comments" };
  }
};

