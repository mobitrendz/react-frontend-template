import { useState, useEffect } from "react";
import { useAuth, Role } from "../contexts/AuthContext";
import DashboardLayout from "./layout/DashboardLayout";
import AdminDashboardView from "./admin/AdminDashboardView";
import UserTaskView from "./tasks/UserTaskView";

interface DashboardProps {
  defaultView?: "admin" | "user";
  initialTab?: "intelligence" | "activity" | "users";
  onLogout?: () => void;
}

const Dashboard = ({ defaultView, initialTab, onLogout }: DashboardProps) => {
  const { user, role, logout, hasPermission } = useAuth();
  const [activeView, setActiveView] = useState<"admin" | "user">(
    defaultView || "user",
  );

  // Sync activeView with permissions once loaded
  useEffect(() => {
    if (role && !defaultView) {
      if (hasPermission(Role.ADMIN)) {
        setActiveView("admin");
      } else {
        setActiveView("user");
      }
    }
  }, [role, defaultView, hasPermission]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const isSuper = role === Role.SUPER;

  return (
    <DashboardLayout
      currentUser={user}
      onLogout={handleLogout}
      activeView={activeView}
      onViewChange={setActiveView}
    >
      {activeView === "admin" && hasPermission(Role.ADMIN) ? (
        <AdminDashboardView currentUser={user} initialTab={initialTab} />
      ) : (
        <UserTaskView />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
