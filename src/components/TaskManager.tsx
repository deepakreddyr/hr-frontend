import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
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
  assignee?: string;
  assignor?: string;
}

interface TaskManagerProps {
  mode: "manager" | "assignee";
  onCreateNewTask?: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ mode, onCreateNewTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "In Progress" | "Completed">("All");

  const taskListRef = useRef<HTMLDivElement | null>(null);
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isManager = mode === "manager";
  const apiEndpoint = isManager ? "/api/tasks/history" : "/api/tasks/inbox";
  const pageTitle = isManager ? " " : "My Assigned Tasks";

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}${apiEndpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(data,"DATA");
      if (!response.ok) {
        toast.error(data.error || "Failed to load tasks");
        return;
      }

      if (data.success) {
        // Map assignor → assignedBy and assignee → assignedTo
        const mappedTasks: Task[] = data.tasks.map((task: any) => ({
          ...task,
          assignor: task.assignor || null,
          assignee: task.assignee || null,
        }));

        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [apiEndpoint]);

  // GSAP initialization
  useEffect(() => {
    Object.values(contentRefs.current).forEach((el) => {
      if (el) gsap.set(el, { height: 0, opacity: 0 });
    });
  }, [tasks]);

  useEffect(() => {
    if (taskListRef.current) {
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
  }, [tasks]);

  const toggleExpand = (taskId: number) => {
    const el = contentRefs.current[taskId];
    if (!el) return;

    if (expandedTask === taskId) {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut" });
      setExpandedTask(null);
    } else {
      if (expandedTask && contentRefs.current[expandedTask]) {
        gsap.to(contentRefs.current[expandedTask], { height: 0, opacity: 0, duration: 0.3, ease: "power2.inOut" });
      }

      gsap.to(el, { height: "auto", opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.6)" });
      setExpandedTask(taskId);

      gsap.fromTo(
        el.querySelectorAll(".detail-item"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.04, delay: 0.1, duration: 0.4, ease: "power2.out" }
      );
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: "In Progress" | "Completed") => {
    try {
      const token = localStorage.getItem("access_token");
      const endpoint = isManager ? `/api/tasks/${taskId}/complete` : `/api/tasks/${taskId}/status`;

      const body = isManager ? {} : { status: newStatus };

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const statusEmoji = newStatus === "Completed" ? "🎉" : "⚡";
        toast.success(`Task marked as ${newStatus}! ${statusEmoji}`);

        setTasks(prev => prev.map(task => (task.id === taskId ? { ...task, status: newStatus } : task)));
      } else toast.error("Failed to update task status");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Something went wrong");
    }
  };

  const formatDate = (dateString: string, showUrgency: boolean = false) => {
    try {
      const date = new Date(dateString);
      if (!showUrgency) return date.toLocaleDateString();

      const today = new Date();
      const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return `${date.toLocaleDateString()} (Overdue)`;
      if (diffDays === 0) return `${date.toLocaleDateString()} (Today)`;
      if (diffDays === 1) return `${date.toLocaleDateString()} (Tomorrow)`;
      return `${date.toLocaleDateString()} (${diffDays} days)`;
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string = "Pending", enhanced: boolean = false) => {
    const colors = {
      "Completed": enhanced ? "text-green-600 bg-green-50" : "text-green-600",
      "In Progress": enhanced ? "text-yellow-600 bg-yellow-50" : "text-yellow-600",
      "Pending": enhanced ? "text-red-600 bg-red-50" : "text-red-600",
    };
    return colors[status as keyof typeof colors] || colors["Pending"];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-600";
      case "Medium": return "bg-yellow-100 text-yellow-600";
      case "Low": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getTaskUrgency = (deadline: string, priority: string) => {
    if (isManager) return "normal";
    try {
      const diffDays = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000*60*60*24));
      if (diffDays < 0) return "overdue";
      if (diffDays <= 1 && priority === "High") return "urgent";
      if (diffDays <= 3 && priority === "High") return "soon";
      return "normal";
    } catch { return "normal"; }
  };

  const getTaskBorderClass = (deadline: string, priority: string) => {
    if (isManager) return "";
    const urgency = getTaskUrgency(deadline, priority);
    switch (urgency) {
      case "overdue": return "border-l-4 border-red-500";
      case "urgent": return "border-l-4 border-orange-500";
      case "soon": return "border-l-4 border-yellow-500";
      default: return "";
    }
  };

  const filteredTasks = !isManager && statusFilter !== "All" 
    ? tasks.filter(task => task.status === statusFilter)
    : tasks;

  const groupedTasks = !isManager ? filteredTasks.reduce((acc, task) => {
    const urgency = getTaskUrgency(task.deadline, task.priority);
    if (!acc[urgency]) acc[urgency] = [];
    acc[urgency].push(task);
    return acc;
  }, {} as Record<string, Task[]>) : {};

  // Render functions
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">{pageTitle}</h2>
      {isManager && onCreateNewTask && (
        <button onClick={onCreateNewTask} className="btn-primary">+ Create New Task</button>
      )}
      {!isManager && (
        <div className="flex gap-2">
          {["All", "Pending", "In Progress", "Completed"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                statusFilter === status ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status} ({tasks.filter(t => status === "All" || t.status === status).length})
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderAssignmentInfo = (task: Task) => (
    <p className="mt-3 text-sm detail-item">
      {isManager ? `👤 Assigned To: ${task.assignee || "-"}` : `👤 Assigned By: ${task.assignor || "-"}`}
    </p>
  );

  const renderTaskActions = (task: Task) => (
    <div className="flex justify-end mt-4 gap-3 detail-item">
      <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }}>Close</button>
      {!isManager && task.status === "Pending" && (
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
          onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, "In Progress"); }}
        >Start Working ⚡</button>
      )}
      {/* {task.status !== "Completed" && (
        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, "Completed"); }}>
          Mark Completed ✅
        </button>
      )} */}
    </div>
  );

  if (loading) {
    return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2 text-gray-600">Loading tasks...</p></div>;
  }

  if (filteredTasks.length === 0) {
    return (
      <div>
        {renderHeader()}
        <div className="text-center py-8 text-gray-600">
          {isManager ? "No tasks found." : `No ${statusFilter.toLowerCase()} tasks.`}
          {isManager && onCreateNewTask && (
            <button onClick={onCreateNewTask} className="btn-primary mt-4">Create Your First Task</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderHeader()}
      {!isManager && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-red-700 font-medium">Overdue</h3>
            <p className="text-2xl font-bold text-red-600">{(groupedTasks.overdue || []).length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-orange-700 font-medium">Urgent</h3>
            <p className="text-2xl font-bold text-orange-600">{(groupedTasks.urgent || []).length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-yellow-700 font-medium">Due Soon</h3>
            <p className="text-2xl font-bold text-yellow-600">{(groupedTasks.soon || []).length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-700 font-medium">Completed</h3>
            <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === "Completed").length}</p>
          </div>
        </div>
      )}

      <div ref={taskListRef} className="space-y-4">
        {filteredTasks.map(task => (
          <div key={task.id} className={`bg-white dark:bg-gray-900 rounded-2xl shadow transition overflow-hidden ${getTaskBorderClass(task.deadline, task.priority)}`}>
            <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => toggleExpand(task.id)}>
              <div>
                <h2 className="text-lg font-semibold">
                  {task.job_role} {isManager ? `(Assigned to: ${task.assignee || "-"})` : `(Assigned by: ${task.assignor || "-"})`}
                </h2>
                <p className="text-sm text-gray-600">{task.company_name} • Deadline: {formatDate(task.deadline, !isManager)}</p>
                {!isManager && <p className="text-xs text-gray-500 mt-1">Task: {task.title}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                <span className={`text-xs font-medium ${getStatusColor(task.status, !isManager)}`}>{task.status || "Pending"}</span>
              </div>
            </div>

            <div ref={el => (contentRefs.current[task.id] = el)} className="px-5 overflow-hidden">
              <div className="py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p className="detail-item"><strong>📍 Location:</strong> {task.job_location}</p>
                  <p className="detail-item"><strong>💰 CTC:</strong> {task.ctc_range}</p>
                  <p className="detail-item"><strong>⏰ Time to Hire:</strong> {task.time_to_hire || "Not specified"}</p>
                  <p className="detail-item"><strong>📅 Deadline:</strong> {formatDate(task.deadline, !isManager)}</p>
                  <p className="detail-item"><strong>🎯 Openings:</strong> {task.openings}</p>
                  <p className="detail-item"><strong>📋 Title:</strong> {task.title}</p>
                </div>

                {renderAssignmentInfo(task)}

                {task.notes && <p className="mt-3 text-sm detail-item"><strong>📝 Notes{!isManager ? ' from Manager' : ''}:</strong> {task.notes}</p>}
                {task.jd_link && (
                  <a href={task.jd_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline mt-2 block text-sm detail-item" onClick={e => e.stopPropagation()}>
                    📎 View Job Description
                  </a>
                )}

                {renderTaskActions(task)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
