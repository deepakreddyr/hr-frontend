"use client";
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

interface Task {
  id: number;
  title: string;
  companyName: string;
  jobRole: string;
  openings: number;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
  ctcRange: string;
  timeToHire: string;
  jdLink: string;
  notes: string;
  location: string;
  assignedTo: { id: string; name: string; email: string; role: string } | null; // ✅ added assignee
}

const InboxPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tasks/inbox`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(data.tasks);
      } else {
        console.error("Error loading tasks:", data.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Collapse sections on mount
  useEffect(() => {
    Object.values(contentRefs.current).forEach((el) => {
      if (el) gsap.set(el, { height: 0, opacity: 0 });
    });
  }, [tasks]);

  const toggleExpand = (taskId: number) => {
    const el = contentRefs.current[taskId];
    if (!el) return;

    if (expandedTask === taskId) {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut" });
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
        { y: 0, opacity: 1, stagger: 0.04, delay: 0.1, duration: 0.4, ease: "power2.out" }
      );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📥 Inbox (Assigned Tasks)</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks found.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow transition overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => toggleExpand(task.id)}
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    {task.jobRole} ({task.openings} openings)
                  </h2>
                  <p className="text-sm text-gray-600">
                    {task.companyName} • Deadline: {task.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`font-medium text-sm ${
                      task.status === "Completed"
                        ? "text-green-600"
                        : task.status === "In Progress"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Expandable Section */}
              <div
                ref={(el) => (contentRefs.current[task.id] = el)}
                className="px-5 overflow-hidden"
              >
                <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p className="detail-item"><strong>📍 Location:</strong> {task.location}</p>
                    <p className="detail-item"><strong>💰 CTC:</strong> {task.ctcRange}</p>
                    <p className="detail-item"><strong>⏰ Time to Hire:</strong> {task.timeToHire}</p>
                    <p className="detail-item"><strong>📅 Deadline:</strong> {task.deadline}</p>
                    <p className="detail-item"><strong>🎯 Openings:</strong> {task.openings}</p>
                  </div>

                  {/* Assignee Info */}
                  {task.assignedTo && (
                    <p className="mt-3 text-sm detail-item">
                      <strong>👤 Assigned To:</strong> {task.assignedTo.name} ({task.assignedTo.role}) - {task.assignedTo.email}
                    </p>
                  )}

                  {task.notes && (
                    <p className="mt-3 text-sm detail-item">
                      <strong>📝 Notes:</strong> {task.notes}
                    </p>
                  )}

                  {task.jdLink && (
                    <a
                      href={task.jdLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-2 block text-sm detail-item"
                    >
                      📎 View JD
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
                        // API call to mark as completed
                        console.log("Marking as completed", task.id);
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
  );
};

export default InboxPage;
