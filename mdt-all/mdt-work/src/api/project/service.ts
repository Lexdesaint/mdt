import { prisma } from "../../config/database/prisma";

interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface CreateProjectData {
  name: string;
  description?: string;
  ownerId: string;
}

interface AddMemberData {
  email: string;
  role?: string;
}

export const projectServiceCreate = async (data: CreateProjectData): Promise<ServiceResponse> => {
  try {

    let owner = await prisma.user.findFirst({
      where: {
        user_id: data.ownerId,
      }
    });

       if (!owner || !owner.user_id) {
        return {
          success: false,
          message: "Owner not found",
          data: null,
        };
      }
    const project = await prisma.project.create({
      data,
      // include: { owner: true },
    });
    return {
      success: true,
      message: "Project created successfully",
      data: project,
    };
  } catch (error: any) {
    console.error("Error in projectServiceCreate:", error);
    return {
      success: false,
      message: error.message || "Failed to create project",
    };
  }
};

export const projectServiceGetAll = async (userId: string): Promise<ServiceResponse> => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
      include: {
        owner: { select: { user_id: true, name: true, email: true } },
        members: { include: { user: { select: { user_id: true, name: true, email: true } } } },
        tasks: true,
      },
    });
    return {
      success: true,
      message: "Projects retrieved successfully",
      data: projects,
    };
  } catch (error: any) {
    console.error("Error in projectServiceGetAll:", error);
    return {
      success: false,
      message: error.message || "Failed to retrieve projects",
    };
  }
};

export const projectServiceAddMember = async (
  projectId: string,
  memberData: AddMemberData
): Promise<ServiceResponse> => {
  try {

       let owner = await prisma.user.findFirst({
      where: {
        email: memberData.email,
      }
    });
      if (!owner || !owner.email) {
        return {
          success: false,
          message: "User's not found",
          data: null,
        };
      }

      const existingMember = await prisma.projectMember.findUnique({
  where: {
    projectId_user_id: {
      projectId,
      user_id: owner.user_id,
    },
  },
});

if (existingMember) {
  return {
    success: false,
    message: "User is already a member of this project",
    data: null,
  };
}

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        user_id: owner.user_id,
        role: memberData.role || "member",
      },
      include: { user: { select: { user_id: true, name: true, email: true } } },
    });
    return {
      success: true,
      message: "Member added successfully",
      data: member,
    };
  } catch (error: any) {
    console.error("Error in projectServiceAddMember:", error);
    return {
      success: false,
      message: error.message || "Failed to add member",
    };
  }
};

