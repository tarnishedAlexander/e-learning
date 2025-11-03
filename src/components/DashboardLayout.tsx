import { ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Video,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "professor" | "admin";
  onLogout: () => void;
}

export const DashboardLayout = ({ children, role, onLogout }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/student" },
          { icon: BookOpen, label: "My Courses", path: "/student/courses" },
          { icon: Settings, label: "Settings", path: "/student/settings" },
        ];
      case "professor":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/professor" },
          { icon: BookOpen, label: "My Courses", path: "/professor/courses" },
          { icon: Video, label: "Create Course", path: "/professor/create" },
          { icon: Settings, label: "Settings", path: "/professor/settings" },
        ];
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
          { icon: Users, label: "Users", path: "/admin/users" },
          { icon: BookOpen, label: "Courses", path: "/admin/courses" },
          { icon: Settings, label: "Settings", path: "/admin/settings" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 border-r bg-sidebar flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">EduVerse</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start gap-3"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
              <p className="text-xs text-muted-foreground">user@eduverse.com</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {role.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};
