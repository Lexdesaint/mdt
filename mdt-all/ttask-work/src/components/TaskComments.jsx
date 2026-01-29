import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setError, clearError } from "../store/projectSlice";
import { apiGet, apiPost } from "../utils/apiClient";
import { MdSend, MdDelete } from "react-icons/md";

const TaskComments = ({ taskId }) => {
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.auth);
  console.log("TaskComments - taskId:", taskId);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    setLoading(true);
    try {

      const response = await apiGet(`/projects/tasks/${taskId}/comments`);
      const data = await response.json();
      setComments(data.body || data.data || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

const handleAddComment = async (e) => {
  e.preventDefault();
  if (!newComment.trim()) return;

  setSubmitting(true);

  try {
    const response = await apiPost(`/projects/tasks/${taskId}/comments`, {
      taskId, 
      content: newComment,
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error("Response is not valid JSON:", jsonErr);
      data = { error: "Invalid server response (not JSON)" };
    }

    // ── Much better error logging ─────────────────────────────────
    if (!response.ok) {
      console.group("ADD COMMENT FAILED");
      console.log("Status code:", response.status);
      console.log("Status text:", response.statusText);
      console.log("Response body:", data);
      console.log("Request payload was:", { taskId, content: newComment });
      console.groupEnd();

      // Try to extract the most useful message
      const serverMsg =
        data?.error ||
        data?.message ||
        data?.detail ||
        data?.errors?.[0]?.msg ||           // common in Joi/Express-validator
        data?.non_field_errors?.[0] ||      // Django style
        `Server returned ${response.status} ${response.statusText}`;

      dispatch(setError(serverMsg || "Failed to add comment"));
      return;
    }

    // Success
    setComments([...comments, data.body || data]); // ← safer
    setNewComment("");
    dispatch(clearError());

  } catch (err) {
    // Network error, CORS, timeout, aborted, etc.
    console.error("handleAddComment → exception:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    });

    let userMessage = "Could not add comment";

    if (err.name === "TypeError" && err.message.includes("fetch")) {
      userMessage = "Network error – cannot reach server";
    } else if (err.message?.includes("CORS")) {
      userMessage = "CORS policy blocked the request";
    } else if (err.message?.includes("JSON")) {
      userMessage = "Server sent invalid response";
    }

    dispatch(setError(`${userMessage} (${err.message})`));
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="mt-6 border-t pt-6">
      <h5 className="text-lg font-semibold text-gray-800 mb-4">Comments</h5>

      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 p-3 rounded-lg text-sm"
            >
              <p className="font-medium text-gray-800">{comment.user?.name}</p>
              <p className="text-gray-600 mt-1">{comment.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No comments yet</p>
        )}
      </div>

      {/* Add Comment */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
        >
          <MdSend size={16} />
        </button>
      </form>
    </div>
  );
};

export default TaskComments;
