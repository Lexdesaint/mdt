import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  setProjects,
  setLoading,
  setError,
  clearError,
} from "../store/projectSlice";
import { logout } from "../store/authSlice";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
import { apiGet, apiPost } from "../utils/apiClient";
import {
  MdAdd,
  MdRefresh,
  MdVisibility,
  MdLogout,
  MdHome,
} from "react-icons/md";

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading, error } = useSelector((state) => state.projects);
  // const { user } = useSelector((state) => state.auth);
  const user = JSON.parse(localStorage.getItem("user"));
  // Use inactivity logout hook
  useInactivityLogout();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  
  const fetchProjects = async () => {
    dispatch(setLoading(true));
    try {
      const response = await apiGet("/projects");
      const data = await response.json();
      if (response.ok) {
        console.log("Fetched projects data:", data);
        dispatch(setProjects(data.body || data.data || []));
        dispatch(clearError());
      } else {
        console.error("Failed to fetch projects:", data.error);
        dispatch(setError(data.error || "Failed to fetch projects"));
      }
    } catch (err) {
        console.error("Failed to fetch projects:", err);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

const handleCreateProject = async (e) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    dispatch(setError("Project name is required"));
    return;
  }

  setCreating(true);

  try {
    const response = await apiPost("/projects", {
      name: formData.name,
      description: formData.description,
      ownerId: user?.user_id,
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error("Response is not valid JSON:", jsonErr);
      data = { error: "Server returned invalid format" };
    }

    if (!response.ok) {
      // ── DETAILED ERROR LOGGING ────────────────────────────────
      console.groupCollapsed("CREATE PROJECT FAILED");
      console.log("Status:", response.status, response.statusText);
      console.log("URL:", response.url);
      console.log("Payload sent:", {
        name: formData.name,
        description: formData.description,
        ownerId: user?.id,
      });
      console.log("Response body:", data);
      console.log("Headers:", [...response.headers.entries()]);
      console.groupEnd();

      // Extract best possible message
      const serverMsg =
        data?.error ||
        data?.message ||
        data?.detail ||
        (Array.isArray(data?.errors) && data.errors[0]?.message) ||
        data?.non_field_errors?.[0] ||
        `Server returned ${response.status} ${response.statusText}`;

      dispatch(setError(serverMsg || "Failed to create project"));
      return;
    }

    // Success
    dispatch(clearError());
    setShowCreateModal(false);
    setFormData({ name: "", description: "" });
    fetchProjects();

  } catch (err) {
    // Network / CORS / timeout / aborted / etc.
    console.error("Create project exception:", {
      name: err.name,
      message: err.message,
      stack: err.stack?.substring(0, 300),
    });

    let friendlyMsg = "Could not create project";

    if (err.message?.includes("fetch")) {
      friendlyMsg = "Network error – server unreachable or CORS issue";
    } else if (err.message?.includes("JSON")) {
      friendlyMsg = "Server sent invalid response";
    }

    dispatch(setError(`${friendlyMsg} (${err.message})`));
  } finally {
    setCreating(false);
  }
};

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and tasks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdHome /> Dashboard
          </button>
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <MdRefresh /> Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdAdd /> New Project
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdLogout /> Logout
          </button>
        </div>
      </div>

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

      {/* Loading State */}
      {loading && !projects.length && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || "No description"}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{project.members?.length || 0} members</span>
                  <span>{project.tasks?.length || 0} tasks</span>
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  state={{ project }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <MdVisibility /> View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-6">No projects yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Create your first project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter project name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter project description"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
