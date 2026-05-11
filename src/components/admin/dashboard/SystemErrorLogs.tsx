import React, { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Clock,
  User,
  Globe,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { readSystemLogsApiV1AdminDashboardLogsGet } from "../../../client/sdk.gen";
import { SystemLogPublic } from "../../../client/types.gen";
import { useAuth } from "../../../contexts/AuthContext";

const SystemErrorLogs: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<SystemLogPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await readSystemLogsApiV1AdminDashboardLogsGet();

      if (response.error) {
        throw new Error("Failed to fetch system logs.");
      }

      setLogs(response.data?.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === "ALL" || log.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "CRITICAL":
        return "text-red-600 bg-red-500/10 border-red-500/20";
      case "ERROR":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "WARNING":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs, paths, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-accent/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-accent/30 border border-border rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-transparent text-sm font-bold focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all active:scale-95"
            title="Refresh Logs"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-accent/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-primary">
                  Status & Time
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-primary">
                  Endpoint / Message
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-primary text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && logs.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-6 py-8">
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Terminal className="w-12 h-12 text-muted-foreground opacity-20" />
                      <p className="text-muted-foreground font-medium">
                        No system logs found matching your criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`group hover:bg-accent/30 transition-colors cursor-pointer ${expandedLogId === log.id ? "bg-accent/50" : ""}`}
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td className="px-6 py-5 align-top">
                        <div className="space-y-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getLevelColor(log.level)}`}
                          >
                            {log.level}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {log.method && (
                              <span className="text-[10px] font-black text-foreground/50 bg-foreground/5 px-1.5 rounded">
                                {log.method}
                              </span>
                            )}
                            <span className="text-sm font-mono font-bold text-foreground truncate max-w-md">
                              {log.path || "System Task"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium line-clamp-1 group-hover:line-clamp-none transition-all">
                            {log.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-3">
                            {log.user_id && (
                              <div
                                className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium"
                                title={`User ID: ${log.user_id}`}
                              >
                                <User className="w-3 h-3" />
                                {log.user_id.split("-")[0]}...
                              </div>
                            )}
                            {log.status_code && (
                              <span
                                className={`text-xs font-black ${log.status_code >= 500 ? "text-red-500" : "text-amber-500"}`}
                              >
                                {log.status_code}
                              </span>
                            )}
                          </div>
                          {expandedLogId === log.id ? (
                            <ChevronUp className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedLogId === log.id && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-8 py-6 bg-accent/20 border-t border-border"
                        >
                          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Context Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-card border border-border rounded-2xl">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <Globe className="w-3 h-3" /> Execution
                                  Context
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      Request Method:
                                    </span>
                                    <span className="font-bold">
                                      {log.method || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      Status Code:
                                    </span>
                                    <span className="font-bold text-red-500">
                                      {log.status_code || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      Full Path:
                                    </span>
                                    <span className="font-mono text-[11px]">
                                      {log.path || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 bg-card border border-border rounded-2xl">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <User className="w-3 h-3" /> User Details
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      Actor ID:
                                    </span>
                                    <span className="font-mono text-[11px]">
                                      {log.user_id || "Anonymous"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      Timestamp:
                                    </span>
                                    <span className="font-bold">
                                      {new Date(log.created_at).toISOString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Stack Trace */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Terminal className="w-3 h-3" /> Server Stack
                                Trace
                              </h4>
                              <div className="p-5 bg-black/90 text-red-400 font-mono text-[11px] rounded-2xl overflow-x-auto whitespace-pre leading-relaxed border border-red-500/20 shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
                                {log.stack_trace ||
                                  "No stack trace available for this event."}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-accent/10 border-t border-border flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-2">
        <div>
          Showing {paginatedLogs.length} of {filteredLogs.length} matching
          events
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Monitoring Enabled
        </div>
      </div>
    </div>
  );
};

export default SystemErrorLogs;
