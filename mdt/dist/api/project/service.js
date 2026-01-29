"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectServiceAddMember = exports.projectServiceGetAll = exports.projectServiceCreate = void 0;
const prisma_1 = require("../../config/database/prisma");
const projectServiceCreate = async (data) => {
    try {
        const project = await prisma_1.prisma.project.create({
            data,
            include: { owner: true },
        });
        return {
            success: true,
            message: "Project created successfully",
            data: project,
        };
    }
    catch (error) {
        console.error("Error in projectServiceCreate:", error);
        return {
            success: false,
            message: error.message || "Failed to create project",
        };
    }
};
exports.projectServiceCreate = projectServiceCreate;
const projectServiceGetAll = async () => {
    try {
        const projects = await prisma_1.prisma.project.findMany({
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
    }
    catch (error) {
        console.error("Error in projectServiceGetAll:", error);
        return {
            success: false,
            message: error.message || "Failed to retrieve projects",
        };
    }
};
exports.projectServiceGetAll = projectServiceGetAll;
const projectServiceAddMember = async (projectId, memberData) => {
    try {
        const member = await prisma_1.prisma.projectMember.create({
            data: {
                projectId,
                user_id: memberData.user_id,
                role: memberData.role || "member",
            },
            include: { user: { select: { user_id: true, name: true, email: true } } },
        });
        return {
            success: true,
            message: "Member added successfully",
            data: member,
        };
    }
    catch (error) {
        console.error("Error in projectServiceAddMember:", error);
        return {
            success: false,
            message: error.message || "Failed to add member",
        };
    }
};
exports.projectServiceAddMember = projectServiceAddMember;
