import { useUsers } from "@/hooks/use-dashboard";
import { format } from "date-fns";
import { Search, User as UserIcon, Calendar, Clock } from "lucide-react";
import { useState } from "react";

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(user => 
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    user.telegramId.toString().includes(search)
  ) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground mt-1">
            List of all users interacting with the bot
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="p-4 font-semibold text-sm text-muted-foreground w-[50px]">#</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">User</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground">Telegram ID</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground hidden md:table-cell">First Seen</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground hidden md:table-cell">Last Active</th>
                <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-4 bg-muted rounded" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="space-y-1">
                          <div className="h-3 w-24 bg-muted rounded" />
                          <div className="h-2 w-16 bg-muted rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-3 w-20 bg-muted rounded" /></td>
                    <td className="p-4 hidden md:table-cell"><div className="h-3 w-24 bg-muted rounded" /></td>
                    <td className="p-4 hidden md:table-cell"><div className="h-3 w-24 bg-muted rounded" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-16 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    No users found matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-muted-foreground font-mono">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.firstName || "Unknown"} {user.lastName || ""}
                          </div>
                          <div className="text-xs text-muted-foreground">@{user.username || "no_username"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-mono text-muted-foreground">
                      {user.telegramId}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {user.lastSeen ? format(new Date(user.lastSeen), "MMM d, HH:mm") : "-"}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.isBlocked
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                          : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                      }`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
