// src/api/task/service.ts
import prisma from "../../config/database/prisma";

interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// CREATE TASK
export const taskServiceCreate = async (
  projectId: string,
  data: {
    title: string;
    description?: string;
    createdById: string;
    assignedToId?: string;
  }
): Promise<ServiceResponse> => {
  try {
    // 1️⃣ Validate that createdBy exists
    const createdBy = await prisma.user.findUnique({
      where: { user_id: data.createdById },
    });
    if (!createdBy) {
      return {
        success: false,
        message: "CreatedBy user not found",
      };
    }

    // 2️⃣ Validate assignedTo (optional)
    let assignedToValidId: string | undefined = undefined;
    if (data.assignedToId) {
      const assignedTo = await prisma.user.findUnique({
        where: { user_id: data.assignedToId },
      });
      if (!assignedTo) {
        return {
          success: false,
          message: "AssignedTo user not found",
        };
      }
      assignedToValidId = data.assignedToId;
    }

    // 3️⃣ Create task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId,
        createdById: data.createdById,
        assignedToId: assignedToValidId, // only set if valid
      },
    });

    return {
      success: true,
      message: "Task created successfully",
      data: task,
    };
  } catch (error: any) {
    console.error("Error in taskServiceCreate:", error);
    return {
      success: false,
      message: error.message || "Internal Server Error",
    };
  }
};



// GET TASKS BY PROJECT
export const taskServiceGetByProject = async (
  projectId: string,
  status?: "TODO" | "IN_PROGRESS" | "DONE",
  sort: "asc" | "desc" = "asc",
  page: number = 1,
  limit: number = 10
): Promise<ServiceResponse> => {
  try {
    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!projectExists) {
      return {
        success: false,
        message: `Project with id ${projectId} does not exist`,
        data: [],
      };
    }

    const whereClause: any = { projectId };

    if (status) {
      whereClause.status = status;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        orderBy: { createdAt: sort },
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: {
              user_id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.task.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: "Tasks retrieved successfully",
      data: {
        items: tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error("Error in taskServiceGetByProject:", error);

    return {
      success: false,
      message: error.message || "Internal Server Error",
    };
  }
};


// UPDATE TASK
export const taskServiceUpdate = async (
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    assignedToId?: string;
  }
): Promise<ServiceResponse> => {
  try {
    // 1️⃣ Check if the task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return {
        success: false,
        message: `Task with id ${taskId} does not exist`,
      };
    }

    // 2️⃣ If assignedToId is provided, validate that the user exists
    if (data.assignedToId) {
      const userExists = await prisma.user.findUnique({
        where: { user_id: data.assignedToId },
      });

      if (!userExists) {
        return {
          success: false,
          message: `User with id ${data.assignedToId} does not exist`,
        };
      }
    }

    // 3️⃣ Perform the update
    const task = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    return {
      success: true,
      message: "Task updated successfully",
      data: task,
    };
  } catch (error: any) {
    console.error("Error in taskServiceUpdate:", error);
    return {
      success: false,
      message: error.message || "Internal Server Error",
    };
  }
};

