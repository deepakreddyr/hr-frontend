import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import TaskManager from "../components/TaskManager";

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

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);
  const [showForm, setShowForm] = useState(false); // Default to history view

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

      // Reset form
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
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleCreateNewTask = () => {
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    // Reset form data
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
                min="1"
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
                JD Link (Google Drive / Dropbox) <span className="text-red-500">*</span>
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
              onClick={handleCancelForm}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Assign Task
            </button>
          </div>
        </form>
      ) : (
          <TaskManager mode="manager" onCreateNewTask={handleCreateNewTask} />
      )}
    </div>
  );
};

export default CreateTaskPage;