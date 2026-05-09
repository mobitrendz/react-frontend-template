import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { UserPublic } from "../../client/types.gen";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  currentUser: UserPublic | null;
  onLogout: () => void;
  activeView: "admin" | "user";
  onViewChange: (view: "admin" | "user") => void;
}

const DashboardLayout = ({
  children,
  currentUser,
  onLogout,
  activeView,
  onViewChange,
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg)] overflow-hidden">
      <Sidebar
        userRole={currentUser?.role as any}
        userName={currentUser?.full_name || currentUser?.email}
        onLogout={onLogout}
        activeView={activeView}
        onViewChange={onViewChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-[var(--header-height)] flex items-center px-4 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-[var(--text-dim)] hover:text-[var(--accent)] transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4 font-bold text-lg text-[var(--text-h)]">
            TaskForce<span className="text-[var(--accent)]">.</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
