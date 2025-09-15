import React from "react";

const SkeletonRow = () => (
  <tr className="border-b border-border animate-pulse">
    <td className="p-4">
      <div className="h-4 w-32 bg-muted rounded"></div>
    </td>
    <td className="p-4">
      <div className="h-4 w-24 bg-muted rounded"></div>
    </td>
    <td className="p-4">
      <div className="h-4 w-28 bg-muted rounded"></div>
    </td>
    <td className="p-4">
      <div className="h-4 w-40 bg-muted rounded"></div>
    </td>
    <td className="p-4">
      <div className="h-4 w-20 bg-muted rounded"></div>
    </td>
    <td className="p-4">
      <div className="h-6 w-10 bg-muted rounded-full"></div>
    </td>
    <td className="p-4">
      <div className="h-4 w-6 bg-muted rounded"></div>
    </td>
  </tr>
);

const HistorySkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </tbody>
  );
};

export default HistorySkeleton;
