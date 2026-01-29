import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useInactivityLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer = null;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(() => {
        dispatch(logout());
        navigate("/login");
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer start
    resetTimer();

    // Cleanup on unmount
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, dispatch, navigate]);
};
