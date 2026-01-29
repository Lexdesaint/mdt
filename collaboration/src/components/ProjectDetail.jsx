import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentProject,
  setTasks,
  updateTask,
  setLoading,
  setError,
  clearError,
  updateProjectMembers,
} from "../store/projectSlice";
import { logout } from "../store/authSlice";
import TaskComments from "./TaskComments";
import { apiGet, apiPost, apiPatch } from "../utils/apiClient";
import {
  MdArrowBack,
  MdAdd,
  MdEdit,
  MdDelete,
  MdPeople,
  MdCheckCircle,
  MdSchedule,
  MdPlayArrow,
  MdLogout,
  MdHome,
} from "react-icons/md";
import { useInactivityLogout } from "../hooks/useInactivityLogout";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const passedProject = location.state?.project;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProject, tasks, loading, error } = useSelector(
    (state) => state.projects
  );
  // const { user } = useSelector((state) => state.auth);
  const user = JSON.parse(localStorage.getItem("user"));
  // console.log("Logged in user:", user);
  // Use inactivity logout hook
  useInactivityLogout();

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedToId: "",
  });
  const [addingMember, setAddingMember] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 1; // change if you want more per page

  useEffect(() => {
    if (passedProject && passedProject.id === projectId) {
    dispatch(setCurrentProject(passedProject));
    
  }
    fetchProjectDetail(currentPage);
  }, [projectId, currentPage, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

const fetchProjectDetail = async (page = 1) => {
  dispatch(setLoading(true));
  try {
    const tasksResponse = await apiGet(`/projects/${projectId}/tasks?page=${page}&limit=${limit}`);
    const tasksData = await tasksResponse.json();
    
   
    
    let taskList = [];

    let pagination = {};

      if (tasksData?.body?.items && Array.isArray(tasksData.body.items)) {
        taskList = tasksData.body.items;
        pagination = tasksData.body.pagination || {};
      } else if (tasksData?.items && Array.isArray(tasksData.items)) {
        taskList = tasksData.items;
        pagination = tasksData.pagination || {};
      } else if (Array.isArray(tasksData)) {
        taskList = tasksData;
      }

    // else → remains []

    console.log("Processed tasks:", taskList);
    console.log("Number of tasks processed:", taskList.length);
    
    dispatch(setTasks(taskList));
    setTotalPages(pagination.totalPages || 1);
    dispatch(clearError());
    
  } catch (err) {
    console.error("Fetch tasks error:", err);
    dispatch(setError(err.message || "Could not load tasks"));
  } finally {
    dispatch(setLoading(false));
  }
};

const handleAddMember = async (e) => {
  e.preventDefault();
  if (!memberEmail.trim()) {
    dispatch(setError("Email is required"));
    return;
  }

  setAddingMember(true);

  try {
    const response = await apiPost(`/projects/${projectId}/members`, {
      email: memberEmail,
      role: "member",
    });

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("Response is not valid JSON", parseErr);
      data = { error: "Invalid server response format" };
    }

    if (!response.ok) {
      console.groupCollapsed("ADD MEMBER FAILED");
      console.log("Status:", response.status, response.statusText);
      console.log("URL:", response.url);
      console.log("Payload sent:", { email: memberEmail, role: "member" });
      console.log("Response body:", data);
      console.groupEnd();

      // Try to extract the most useful message
      const serverMessage =
        data?.error ||
        data?.message ||
        data?.detail ||
        (Array.isArray(data?.errors) && data.errors[0]?.message) ||
        data?.non_field_errors?.[0] ||
        `Server error (${response.status})`;

      dispatch(setError(serverMessage || "Failed to add member"));
      return;
    }

    // Success path
    dispatch(clearError());
     setSuccessMessage("Member added successfully!");
      setTimeout(() => setSuccessMessage(""), 4000); // auto-hide


    setMemberEmail("");
    setShowAddMemberModal(false);

       dispatch(triggerProjectsRefetch());
    // if (currentProject) {
    //   dispatch(
    //     updateProjectMembers([
    //       ...(currentProject.members || []),
    //       data.body,
    //     ])
    //   );
    // }

  } catch (err) {
    console.error("Add member exception:", {
      name: err.name,
      message: err.message,
      stack: err.stack?.substring(0, 300),
    });

    let friendlyMsg = "Could not add member";

    if (err.message?.includes("fetch")) {
      friendlyMsg = "Network error – server unreachable";
    } else if (err.message?.includes("CORS")) {
      friendlyMsg = "CORS restriction blocked the request";
    }

    dispatch(setError(`${friendlyMsg} (${err.message})`));
  } finally {
    setAddingMember(false);
  }
};



const handleCreateTask = async (e) => {
  e.preventDefault();
  if (!taskForm.title.trim()) {
    dispatch(setError("Task title is required"));
    return;
  }

  setCreatingTask(true);

  try {
    const response = await apiPost(`/projects/${projectId}/tasks`, {
      title: taskForm.title,
      description: taskForm.description,
      createdById: user.id,
      assignedToId: taskForm.assignedToId || undefined,
    });

    const data = await response.json();

    // ── IMPROVED ERROR HANDLING ────────────────────────────────
    if (!response.ok) {
      console.error("Create task failed — status:", response.status);
      console.error("Response body:", data);
      console.error("Full headers:", [...response.headers.entries()]);

      const serverMessage =
        data?.error ||
        data?.message ||
        data?.detail ||
        data?.errors?.[0]?.msg ||   // common in validation errors
        `Server error (${response.status})`;

      dispatch(setError(serverMessage));
      return;
    }

    // Success path
    dispatch(clearError());
    setTaskForm({ title: "", description: "", assignedToId: "" });
    setShowCreateTaskModal(false);
    fetchProjectDetail();

  } catch (err) {
    // Network / parsing / CORS / abort errors land here
    console.error("Create task exception:", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);

    let friendlyMessage = "Could not create task";

    if (err.name === "TypeError" && err.message.includes("fetch")) {
      friendlyMessage = "Network error – server unreachable or CORS issue";
    } else if (err.message.includes("JSON")) {
      friendlyMessage = "Invalid response from server";
    }

    dispatch(setError(friendlyMessage + `: ${err.message}`));
  } finally {
    setCreatingTask(false);
  }
};

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await apiPatch(`/tasks/${taskId}`, {
        status: newStatus,
      });

      const data = await response.json();
      if (response.ok) {
        dispatch(updateTask(data.body));
        dispatch(clearError());
      } else {
        dispatch(setError(data.error || "Failed to update task"));
      }
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];

const filteredTasks =
  filterStatus === "ALL"
    ? safeTasks
    : safeTasks.filter((task) => task.status === filterStatus);
  // const filteredTasks =
  //   filterStatus === "ALL"
  //     ? tasks
  //     : tasks.filter((task) => task.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "TODO":
        return <MdSchedule className="text-gray-600" />;
      case "IN_PROGRESS":
        return <MdPlayArrow className="text-yellow-600" />;
      case "DONE":
        return <MdCheckCircle className="text-green-600" />;
      default:
        return null;
    }
  };

  if (loading && !currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="text-gray-600 hover:text-gray-800"
          >
            <MdArrowBack size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Projects</h1>
            <p className="text-gray-600 mt-2">Manage your project tasks</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdHome /> Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdLogout /> Logout
          </button>
        </div>
      </div>

   {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="text-green-700 hover:text-green-900">✕</button>
        </div>
      )}
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Task Project
            </h2>
            <p className="text-gray-600">Manage and track your project tasks</p>
          </div>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdPeople /> Add Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 font-semibold">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-600">{safeTasks.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-700 font-semibold">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">
              {safeTasks.filter((t) => t.status === "IN_PROGRESS").length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-700 font-semibold">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {safeTasks.filter((t) => t.status === "DONE")?.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Tasks</h3>
          <button
            onClick={
              () => {
                
                setShowCreateTaskModal(true);
                
                
                

              }
            
            }
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdAdd /> New Task
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Tasks List */}


        
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {task.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {task.description}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatusIcon(task.status)}
                      {task.status}
                      
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Created by: {task.createdBy?.name || "Unknown"}</span>
                    <span>
                      Assigned to:{" "}
                      {task.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {task.status !== "TODO" && (
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "TODO")}
                        className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition"
                      >
                        Move to TODO
                      </button>
                    )}
                    {task.status !== "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          handleUpdateTaskStatus(task.id, "IN_PROGRESS")
                        }
                        className="px-3 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-700 rounded transition"
                      >
                        Move to In Progress
                      </button>
                    )}
                    {task.status !== "DONE" && (
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "DONE")}
                        className="px-3 py-1 text-xs bg-green-200 hover:bg-green-300 text-green-700 rounded transition"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>

                  {/* Expand Comments Button */}
                  <button
                    onClick={() =>
                      setExpandedTaskId(
                        expandedTaskId === task.id ? null : task.id
                      )
                    }
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    {expandedTaskId === task.id
                      ? "Hide Comments"
                      : "View Comments"}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedTaskId === task.id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <TaskComments taskId={task.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {filterStatus === "ALL"
                ? "No tasks yet"
                : `No ${filterStatus.toLowerCase()} tasks`}
            </p>
          </div>
        )}

       {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page <strong>{currentPage}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add Project Member
            </h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Member Email *
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={addingMember}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={addingMember}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
                >
                  {addingMember ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creatingTask}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creatingTask}
                ></textarea>
              </div>
<div>
  <label className="block text-gray-700 font-medium mb-2">
    Assign To
  </label>
  <select
    value={taskForm.assignedToId}
    onChange={(e) => {
      
      setTaskForm({ ...taskForm, assignedToId: e.target.value });
      // console.log("Selected assignee ID:", e.target.value);
    
    }
    }
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    disabled={creatingTask}
  >
    <option value="">Unassigned</option>
    {currentProject?.members?.length > 0 ? (
      currentProject.members.map((member) => {
        const display = member.user.name+"("+member.user.email+")" || "Unnamed member";
        const id = member.user.user_id || member.id || member._id;
        return (
          <option key={id} value={id}>
            {display}
          </option>
        );
      })
    ) : (
      <option value="" disabled>(No project members available)</option>
    )}
  </select>
</div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creatingTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {creatingTask ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
