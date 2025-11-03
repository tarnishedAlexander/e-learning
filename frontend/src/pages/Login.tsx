import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "professor" | "admin">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      const user = response.user;

      // Store user info in localStorage
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);
      if (user.firstName) localStorage.setItem("userName", user.firstName);

      toast.success("Welcome to EduVerse!");
      
      // Redirect based on role
      switch (user.role) {
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register(email, password, firstName, lastName, selectedRole);
      toast.success("Registration successful! Please log in.");
      
      // Clear form and switch to login mode
      setIsRegistering(false);
      setPassword("");
      setFirstName("");
      setLastName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
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
              {isRegistering ? "Create your account" : "Sign in to your learning platform"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </>
            )}
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

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Loading..." : isRegistering ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setEmail("");
                setPassword("");
                setFirstName("");
                setLastName("");
              }}
              className="text-primary hover:underline"
            >
              {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
