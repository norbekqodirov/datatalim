import React from "react";

interface SkeletonProps {
  isDark?: boolean;
}

interface SkeletonTextProps extends SkeletonProps {
  width?: string;
}

const bg = (isDark: boolean) =>
  isDark ? "bg-slate-700/50" : "bg-slate-200";

export function SkeletonText({ isDark = false, width = "w-full" }: SkeletonTextProps) {
  return (
    <div
      className={`animate-pulse rounded-lg h-4 ${width} ${bg(isDark)}`}
    />
  );
}

export function SkeletonCard({ isDark = false }: SkeletonProps) {
  const color = bg(isDark);
  return (
    <div className={`animate-pulse rounded-2xl p-4 space-y-4 ${isDark ? "bg-slate-800/40" : "bg-white/60"} backdrop-blur-sm`}>
      <div className={`rounded-xl h-44 w-full ${color}`} />
      <div className="space-y-2">
        <div className={`rounded-lg h-4 w-3/4 ${color}`} />
        <div className={`rounded-lg h-4 w-full ${color}`} />
        <div className={`rounded-lg h-4 w-1/2 ${color}`} />
      </div>
    </div>
  );
}

export function SkeletonTeamCard({ isDark = false }: SkeletonProps) {
  const color = bg(isDark);
  return (
    <div className={`animate-pulse rounded-3xl p-6 flex flex-col items-center space-y-3 ${isDark ? "bg-slate-800/40" : "bg-white/60"} backdrop-blur-sm`}>
      <div className={`rounded-full h-20 w-20 ${color}`} />
      <div className={`rounded-lg h-4 w-28 ${color}`} />
      <div className={`rounded-lg h-3 w-20 ${color}`} />
    </div>
  );
}

export function SkeletonFAQ({ isDark = false }: SkeletonProps) {
  const color = bg(isDark);
  return (
    <div className={`animate-pulse rounded-2xl p-4 space-y-3 ${isDark ? "bg-slate-800/40" : "bg-white/60"} backdrop-blur-sm`}>
      <div className={`rounded-lg h-5 w-2/3 ${color}`} />
      <div className={`rounded-lg h-3 w-full ${color} opacity-0`} />
    </div>
  );
}
