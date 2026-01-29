import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure, clearError } from "../store/authSlice";
const API_BASE = import.meta.env.VITE_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setLocalError("Email and password are required");
      return;
    }

    dispatch(loginStart());

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch(loginFailure(data.error || "Login failed"));
        setLocalError(data.error || "Login failed");
        return;
      }

      // Extract tokens from response
      const mainBody = data;//.accessToken;
      // console.log("Access token:", accessToken);
      // console.log("Access token 33 44 :", accessToken.body.tokens.accessToken);
      // console.log("Response data body:", data.body);
      // console.log("Response data body 33:", data.body.token);
      // const refreshToken = data.body.refreshToken;
      // 2. Immediately get refresh token using the fresh accessToken
    const refreshToken = await fetch(`${API_BASE}/auth/refresh-token`, {  // or whatever your "get refresh token" endpoint is
      method: "GET", // or GET — depends on your backend
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mainBody.body.tokens.accessToken}`,
      },
    });

    const refreshTokenData = await refreshToken.json();
    // console.log("Refresh token response:", refreshTokenData);
    // console.log("Refresh token response 222:", refreshTokenData.body.refreshToken);
// const refreshData = await refreshRes.json();
// const refreshToken = refreshData.body.refreshToken;

      dispatch(
        loginSuccess({
          user: mainBody.body.user,
          token: mainBody.body.tokens.accessToken,
          refreshToken: refreshTokenData.body.refreshToken,
        })
      );
      

      navigate("/dashboard");
    } catch (err) {
      dispatch(loginFailure(err.message));
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          MDT
        </h1>
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Login
        </h2>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
