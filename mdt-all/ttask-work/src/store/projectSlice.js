import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  currentProject: null,
  tasks: [],
  loading: false,
  error: null,
  projectsRefetchTrigger: 0,
};

export const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    // Projects
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    updateProjectMembers: (state, action) => {
      if (state.currentProject) {
        state.currentProject.members = action.payload;
      }
    },
    // Tasks
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    // UI
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    triggerProjectsRefetch: (state) => {
      state.projectsRefetchTrigger += 1;   // or state.projectsRefetchTrigger = Date.now()
    },
  },
});

export const {
  setProjects,
  addProject,
  setCurrentProject,
  updateProjectMembers,
  setTasks,
  addTask,
  updateTask,
  setLoading,
  setError,
  clearError,
  triggerProjectsRefetch,
} = projectSlice.actions;

export default projectSlice.reducer;
