import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Auto-redirect to dashboard based on user role after 2 seconds
    const timer = setTimeout(() => {
      const userRole = localStorage.getItem("userRole");
      if (userRole) {
        navigate(`/${userRole}`);
      } else {
        navigate("/");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  const handleGoToDashboard = () => {
    const userRole = localStorage.getItem("userRole");
    if (userRole) {
      navigate(`/${userRole}`);
    } else {
      navigate("/");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-primary">404</h1>
              <h2 className="text-2xl font-semibold">Page Not Found</h2>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {localStorage.getItem("userRole") ? (
                <Button onClick={handleGoToDashboard} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Button>
              ) : (
                <Button onClick={handleGoHome} className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              )}
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Redirecting automatically in 2 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
