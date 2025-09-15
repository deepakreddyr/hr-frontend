import React from "react";

const SkeletonBox = ({ className }: { className: string }) => (
  <div className={`bg-muted animate-pulse rounded ${className}`} />
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBox className="h-6 w-40 mb-2" />
          <SkeletonBox className="h-4 w-64" />
        </div>
        <div className="text-right">
          <SkeletonBox className="h-4 w-24 mb-2 ml-auto" />
          <SkeletonBox className="h-6 w-16 ml-auto" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-4 space-y-4 animate-pulse"
          >
            <SkeletonBox className="h-6 w-10" />
            <SkeletonBox className="h-8 w-24" />
            <SkeletonBox className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <SkeletonBox className="h-6 w-48 mb-6" />
          <SkeletonBox className="h-64 w-full" />
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <SkeletonBox className="h-6 w-40 mb-6" />
          <SkeletonBox className="h-64 w-full" />
        </div>
      </div>

      {/* Chatbot Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <SkeletonBox className="h-6 w-40 mb-6" />
        <div className="bg-secondary/30 border border-dashed border-border rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
          <SkeletonBox className="h-5 w-40 mx-auto mb-2" />
          <SkeletonBox className="h-4 w-64 mx-auto mb-4" />
          <SkeletonBox className="h-10 w-40 mx-auto rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
