import { GrTask } from "react-icons/gr";
import { MdDashboard, MdOutlineTaskAlt, MdAddTask, MdPendingActions, MdCloudDone, MdOutlineAccessTimeFilled, MdQueryStats, MdOutlineAddTask, MdLogout, MdFolderOpen } from "react-icons/md";
import { GrInProgress } from "react-icons/gr";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="bg-indigo-500 min-h-[100vh] sm:min-h-screen w-[5rem] sm:w-[19rem] flex flex-col gap-4 roboto-regular justify-between">
            <div>
                <div className="flex items-center gap-2 justify-center h-16 text-white text-2xl font-bold mt-6">
                    <GrTask />
                    <span className='sm:block hidden'>
                        Task Manager
                    </span>
                </div>
                <nav className="flex gap-10 justify-start">
                    <ul className="py-6 flex flex-col justify-start">
                        <Link to='/dashboard' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdDashboard className="text-2xl" />
                            <span className='sm:block hidden'>
                                Dashboard
                            </span>
                        </Link>
                        <Link to='/projects' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdFolderOpen className="text-2xl" />
                            <span className='sm:block hidden'>
                                Projects
                            </span>
                        </Link>
                        <Link to='/addTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdOutlineAddTask className="text-2xl" />
                            <span className='sm:block hidden'>
                                Add New Project
                            </span>
                        </Link>
                        <Link to='/completeTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdOutlineTaskAlt className="text-2xl" />
                            <span className='sm:block hidden'>
                                Completed Tasks
                            </span>
                        </Link>
                        <Link to='/pendingTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdPendingActions className="text-2xl" />
                            <span className='sm:block hidden'>
                                Pending Tasks
                            </span>
                        </Link>
                        <Link to='/inProgressTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <GrInProgress className="text-2xl" />
                            <span className='sm:block hidden'>
                                In Progress Tasks
                            </span>
                        </Link>
                        <Link to='/deployedTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdCloudDone className="text-2xl" />
                            <span className='sm:block hidden'>
                                Deployed Tasks
                            </span>
                        </Link>
                        <Link to='/deferredTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdOutlineAccessTimeFilled className="text-2xl" />
                            <span className='sm:block hidden'>
                                Deferred Tasks
                            </span>
                        </Link>
                        <Link to='/addTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdAddTask className="text-2xl" />
                            <span className='sm:block hidden'>
                                Add New Tasks
                            </span>
                        </Link>
                        <Link to='/statsTask' className="px-6 py-4 font-semibold text-lg text-gray-300 hover:text-gray-700 cursor-pointer flex justify-start items-center gap-2">
                            <MdQueryStats className="text-2xl" />
                            <span className='sm:block hidden'>
                                Task Stats
                            </span>
                        </Link>
                    </ul>
                </nav>
            </div>

            <div className="pb-6">
                <button
                    onClick={handleLogout}
                    className="w-full mx-auto px-6 py-4 font-semibold text-lg text-gray-300 hover:text-red-200 cursor-pointer flex justify-center sm:justify-start items-center gap-2 hover:bg-red-500 hover:bg-opacity-20 rounded transition"
                >
                    <MdLogout className="text-2xl" />
                    <span className='sm:block hidden'>
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;