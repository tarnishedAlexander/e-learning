import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "professor" | "admin">("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    // Mock login - redirect based on role
    localStorage.setItem("userRole", selectedRole);
    toast.success("Welcome to EduVerse!");
    
    switch (selectedRole) {
      case "student":
        navigate("/student");
        break;
      case "professor":
        navigate("/professor");
        break;
      case "admin":
        navigate("/admin");
        break;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">EduVerse</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to your learning platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Select Role</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === "student" ? "default" : "outline"}
                  onClick={() => setSelectedRole("student")}
                  className="h-auto py-4 flex flex-col gap-1"
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-xs">Student</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "professor" ? "default" : "outline"}
                  onClick={() => setSelectedRole("professor")}
                  className="h-auto py-4 flex flex-col gap-1"
                >
                  <span className="text-lg">👨‍🏫</span>
                  <span className="text-xs">Professor</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "admin" ? "default" : "outline"}
                  onClick={() => setSelectedRole("admin")}
                  className="h-auto py-4 flex flex-col gap-1"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="text-xs">Admin</span>
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
