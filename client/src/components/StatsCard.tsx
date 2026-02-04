import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  loading?: boolean;
}

export function StatsCard({ title, value, icon, trend, trendUp, className, loading }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="p-2.5 bg-background rounded-xl border border-border/50 w-fit">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
            ) : (
              <h3 className="text-3xl font-bold font-display tracking-tight text-foreground mt-1">
                {value}
              </h3>
            )}
          </div>
        </div>
        {trend && !loading && (
          <div className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
            trendUp 
              ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" 
              : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
          )}>
            <span>{trendUp ? "↑" : "↓"}</span>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
