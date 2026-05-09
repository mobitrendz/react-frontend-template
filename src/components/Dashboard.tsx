import { useState, useEffect } from "react";
import { useAuth, Role } from "../contexts/AuthContext";
import DashboardLayout from "./layout/DashboardLayout";
import AdminDashboardView from "./admin/AdminDashboardView";
import UserTaskView from "./tasks/UserTaskView";

interface DashboardProps {
  defaultView?: "admin" | "user";
  onLogout?: () => void;
}

const Dashboard = ({ defaultView, onLogout }: DashboardProps) => {
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
        <AdminDashboardView currentUser={user} />
      ) : (
        <UserTaskView />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
