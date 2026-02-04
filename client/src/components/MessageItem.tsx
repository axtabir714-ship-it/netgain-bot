import { formatDistanceToNow } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type BotMessageWithUser } from "@shared/schema";

interface MessageItemProps {
  message: BotMessageWithUser;
}

export function MessageItem({ message }: MessageItemProps) {
  const isInbound = message.direction === "inbound";
  
  return (
    <div className="group flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border",
        isInbound 
          ? "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900" 
          : "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900"
      )}>
        {isInbound ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              {isInbound 
                ? (message.user?.firstName || message.user?.username || "Unknown User")
                : "Bot System"
              }
            </span>
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted border border-border">
              {isInbound ? "User → Bot" : "Bot → User"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {message.sentAt ? formatDistanceToNow(new Date(message.sentAt), { addSuffix: true }) : "Just now"}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed break-words">
          {message.messageText}
        </p>

        {/* Optional: Show user handle for context if inbound */}
        {isInbound && message.user?.username && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <UserIcon className="w-3 h-3" />
            <span>@{message.user.username}</span>
          </div>
        )}
      </div>
    </div>
  );
}
