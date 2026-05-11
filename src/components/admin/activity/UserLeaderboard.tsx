import React from "react";
import { TopUser } from "../../../types/dashboard";
import { Trophy, User } from "lucide-react";

interface UserLeaderboardProps {
  users: TopUser[];
  loading?: boolean;
}

const UserLeaderboard: React.FC<UserLeaderboardProps> = ({
  users,
  loading,
}) => {
  if (loading) {
    return <div className="h-80 bg-muted animate-pulse rounded-3xl" />;
  }

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden h-full flex flex-col">
      <div className="p-8 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            User Power Rankings
          </h2>
          <p className="text-sm text-muted-foreground">
            Top contributors based on platform interaction
          </p>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-xl">
          <Trophy className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Rank
              </th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                User
              </th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {users.map((u, idx) => (
              <tr
                key={u.email}
                className="group hover:bg-[var(--accent-bg)] transition-colors"
              >
                <td className="px-8 py-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                      idx === 0
                        ? "bg-amber-500 text-white"
                        : idx === 1
                          ? "bg-slate-400 text-white"
                          : idx === 2
                            ? "bg-orange-400 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {u.full_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <span className="text-lg font-black text-primary tabular-nums">
                    {u.count?.toLocaleString() ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(UserLeaderboard);
