import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { MdLogout, MdFolderOpen } from 'react-icons/md';
import { useEffect } from 'react';
import {
  setProjects,
  setLoading,          // ← import this
  setError,
  clearError,
} from "../store/projectSlice";
import { apiGet, apiPost, apiPatch } from "../utils/apiClient";

const Card = ({ label, count, bg }) => {
    return (
        <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between cursor-pointer hover:shadow-lg transition">
            <div className="h-full flex flex-1 flex-col justify-between">
                <p className="text-base text-gray-600">{label}</p>
                <span className="text-2xl font-semibold">{count}</span>
                <span className="text-sm text-gray-400">{"110 last month"}</span>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${bg}`}>
                {label.charAt(0)}
            </div>
        </div>
    );
};

Card.propTypes = {
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    bg: PropTypes.string.isRequired,
};

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

      const { projects, loading, error } = useSelector((state) => state.projects);
    // const { user } = useSelector((state) => state.auth);

     const { currentProject, tasks, loading:loading_, error:error_ } = useSelector(
          (state) => state.projects
        );
        console.log("Current Project in Dashboard:", tasks);


    const user = JSON.parse(localStorage.getItem("user"));

    // Use inactivity logout hook
    useInactivityLogout();

     useEffect(() => {
        fetchProjects();
      }, []);
    

    
      
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
    
    const stats = [
        {
            label: "TOTAL Project(s)",
            total: projects.length || 0,
            bg: "bg-[#1d4ed8]",
        },
        {
            label: "COMPLETED TASK",
            total: 0,
            bg: "bg-[#0f766e]",
        },
        {
            label: "TASK IN PROGRESS",
            total: 0,
            bg: "bg-[#f59e0b]",
        },
        {
            label: "PENDING",
            total: 0,
            bg: "bg-[#be185d]",
        },
        
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'User'}</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Link
                        to="/projects"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <MdFolderOpen /> View Projects
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <MdLogout /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto w-full max-w-6xl p-8">
                <div className="flex flex-col w-full justify-between">
                    <h2 className="sm:text-2xl text-3xl font-bold my-8 text-gray-800">Task Overview</h2>
                    <div className="h-full w-full py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {stats.map(({ label, total, bg }, index) => (
                                <Card key={index} bg={bg} label={label} count={total} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
