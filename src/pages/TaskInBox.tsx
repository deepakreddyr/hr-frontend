// Updated InboxPage.tsx
"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import TaskManager from "../components/TaskManager";

const InboxPage: React.FC = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <TaskManager mode="assignee" />
    </div>
  );
};

export default InboxPage;