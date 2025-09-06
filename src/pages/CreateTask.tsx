import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import gsap from "gsap";

interface Task {
  id: number;
  title: string;
  job_role: string;
  company_name: string;
  job_location: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status?: "Pending" | "In Progress" | "Completed";
  ctc_range: string;
  time_to_hire: string;
  jd_link: string;
  notes: string;
  openings: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const CreateTaskPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    priority: "Medium",
    deadline: "",
    companyName: "",
    jobLocation: "",
    managerEmail: "",
    jobRole: "",
    openings: 1,
    ctcRange: "",
    timeToHire: "",
    skills: [] as string[],
    jdLink: "",
    assignedTo: "",
    notes: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [showForm, setShowForm] = useState(false); // 👈 Default to history view
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const taskListRef = useRef<HTMLDivElement | null>(null);
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Fetch tasks from inbox
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || "Failed to load tasks");
        return;
      }

      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch organization users (lazy loading)
  const fetchUsers = async () => {
    if (usersFetched) return;
    
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/get-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || "Failed to load users");
        return;
      }

      if (data.success) {
        setUsers(data.users);
        setUsersFetched(true);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load organization users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Initialize content refs for GSAP animations
  useEffect(() => {
    Object.values(contentRefs.current).forEach((el) => {
      if (el) gsap.set(el, { height: 0, opacity: 0 });
    });
  }, [tasks]);

  // Fetch tasks on mount (since history is default)
  useEffect(() => {
    fetchTasks();
  }, []);

  // Animate tasks when they change
  useEffect(() => {
    if (taskListRef.current && !showForm) {
      gsap.fromTo(
        taskListRef.current.children,
        { y: 50, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          stagger: 0.1,
        }
      );
    }
  }, [tasks, showForm]);

  const toggleExpand = (taskId: number) => {
    const el = contentRefs.current[taskId];
    if (!el) return;

    if (expandedTask === taskId) {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
      setExpandedTask(null);
    } else {
      if (expandedTask && contentRefs.current[expandedTask]) {
        gsap.to(contentRefs.current[expandedTask], {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }

      gsap.to(el, {
        height: "auto",
        opacity: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.6)",
      });
      setExpandedTask(taskId);

      gsap.fromTo(
        el.querySelectorAll(".detail-item"),
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          delay: 0.1,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    }
  };

  const updateField = (field: keyof typeof formData, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const requiredFields: (keyof typeof formData)[] = [
      "title",
      "deadline",
      "companyName",
      "jobLocation",
      "jobRole",
      "openings",
      "ctcRange",
      "jdLink",
      "assignedTo",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === "string" && !formData[field].trim())) {
        toast.error(`Please fill in the required field: ${field}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/create-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create task");
        return;
      }

      toast.success("Task assigned successfully 🎉");

      setFormData({
        title: "",
        priority: "Medium",
        deadline: "",
        companyName: "",
        jobLocation: "",
        managerEmail: "",
        jobRole: "",
        openings: 1,
        ctcRange: "",
        timeToHire: "",
        skills: [],
        jdLink: "",
        assignedTo: "",
        notes: "",
      });

      // Redirect to history
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string = "Pending") => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "In Progress":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-600";
      case "Low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Hiring Tasks</h1>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Details */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">Task Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Task Title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="input"
                required
              />
              <select
                value={formData.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                className="input"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => updateField("deadline", e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                className="input"
                required
              />
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Job Location"
                value={formData.jobLocation}
                onChange={(e) => updateField("jobLocation", e.target.value)}
                className="input"
                required
              />
              <input
                type="email"
                placeholder="Hiring Manager Email (optional)"
                value={formData.managerEmail}
                onChange={(e) => updateField("managerEmail", e.target.value)}
                className="input md:col-span-2"
              />
            </div>
          </div>

          {/* Job Requirement */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">Job Requirement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Job Role / Position"
                value={formData.jobRole}
                onChange={(e) => updateField("jobRole", e.target.value)}
                className="input"
                required
              />
              <input
                type="number"
                placeholder="Openings"
                value={formData.openings}
                onChange={(e) => updateField("openings", Number(e.target.value))}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="CTC Range (e.g. 8–12 LPA)"
                value={formData.ctcRange}
                onChange={(e) => updateField("ctcRange", e.target.value)}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Time to Hire (e.g. 30 days)"
                value={formData.timeToHire}
                onChange={(e) => updateField("timeToHire", e.target.value)}
                className="input"
              />
            </div>

            {/* JD Link */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                JD Link (Google Drive / Dropbox)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.jdLink}
                onChange={(e) => updateField("jdLink", e.target.value)}
                className="input w-full"
                required
              />
            </div>
          </div>

          {/* Assign Recruiter */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">Assign To Recruiter</h2>
            <select
              value={formData.assignedTo}
              onChange={(e) => updateField("assignedTo", e.target.value)}
              onFocus={fetchUsers} // Fetch users when dropdown is clicked/focused
              className="input w-full"
              required
              disabled={loadingUsers}
            >
              <option value="">
                {loadingUsers ? "Loading users..." : "-- Select Employee --"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role}) - {user.email}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Notes for Recruiter..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="input w-full mt-4"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Assign Task
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">📥 Task History (Assigned Tasks)</h2>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              + Create New Task
            </button>
          </div>

          {loadingTasks ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No tasks found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary mt-4"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <div ref={taskListRef} className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow transition overflow-hidden"
                >
                  <div
                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => toggleExpand(task.id)}
                  >
                    <div>
                      <h2 className="text-lg font-semibold">
                        {task.job_role} ({task.openings} openings)
                      </h2>
                      <p className="text-sm text-gray-600">
                        {task.company_name} • Deadline: {formatDate(task.deadline)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`font-medium text-sm ${getStatusColor(task.status)}`}
                      >
                        {task.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div
                    ref={(el) => (contentRefs.current[task.id] = el)}
                    className="px-5 overflow-hidden"
                  >
                    <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p className="detail-item"><strong>📍 Location:</strong> {task.job_location}</p>
                        <p className="detail-item"><strong>💰 CTC:</strong> {task.ctc_range}</p>
                        <p className="detail-item"><strong>⏰ Time to Hire:</strong> {task.time_to_hire || "Not specified"}</p>
                        <p className="detail-item"><strong>📅 Deadline:</strong> {formatDate(task.deadline)}</p>
                        <p className="detail-item"><strong>🎯 Openings:</strong> {task.openings}</p>
                        <p className="detail-item"><strong>📋 Title:</strong> {task.title}</p>
                      </div>

                      {task.notes && (
                        <p className="mt-3 text-sm detail-item">
                          <strong>📝 Notes:</strong> {task.notes}
                        </p>
                      )}
                      
                      {task.jd_link && (
                        <a
                          href={task.jd_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline mt-2 block text-sm detail-item"
                        >
                          📎 View Job Description
                        </a>
                      )}

                      <div className="flex justify-end mt-4 gap-3 detail-item">
                        <button 
                          className="btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(task.id);
                          }}
                        >
                          Close
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success("Task marked as completed! 🎉");
                          }}
                        >
                          Mark as Completed ✅
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateTaskPage;


