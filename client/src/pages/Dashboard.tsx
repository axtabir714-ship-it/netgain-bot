import { useStats, useLogs } from "@/hooks/use-dashboard";
import { StatsCard } from "@/components/StatsCard";
import { MessageItem } from "@/components/MessageItem";
import { Users, MessageSquare, Activity, Zap } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: logs, isLoading: logsLoading } = useLogs();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Real-time overview of your bot activity
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
          Last updated: {format(new Date(), "h:mm:ss a")}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          loading={statsLoading}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Total Messages"
          value={stats?.totalMessages ?? 0}
          icon={<MessageSquare className="w-5 h-5 text-violet-600" />}
          loading={statsLoading}
          trend="+5%"
          trendUp={true}
        />
        <StatsCard
          title="Active (24h)"
          value={stats?.activeUsers24h ?? 0}
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          loading={statsLoading}
          trend="Stable"
          trendUp={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Logs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-xl font-bold text-foreground">Live Logs</h3>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/30 flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</span>
              {logsLoading && <span className="text-xs text-primary animate-pulse">Syncing...</span>}
            </div>
            
            <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
              {logsLoading && !logs ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-muted rounded" />
                      <div className="h-4 w-3/4 bg-muted rounded" />
                    </div>
                  </div>
                ))
              ) : logs?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No messages yet</p>
                </div>
              ) : (
                logs?.map((msg) => (
                  <MessageItem key={msg.id} message={msg} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Side Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-6 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Bot Status</h3>
              <p className="text-primary-foreground/80 text-sm mb-6">
                System is running smoothly. Webhooks are active and processing messages.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>
            
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-black/10 rounded-full blur-xl" />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Server Load</span>
                  <span className="font-medium">24%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[24%] rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
