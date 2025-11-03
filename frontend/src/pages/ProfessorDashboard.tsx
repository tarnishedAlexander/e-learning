import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Users,
  BookOpen,
  Video,
  TrendingUp,
  Loader2,
  Edit,
} from "lucide-react";
import { courseApi } from "@/lib/api";
import { toast } from "sonner";

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  // Get professor ID from localStorage (you'll need to implement proper auth)
  const professorId = parseInt(localStorage.getItem("professorId") || "1");

  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["professor-courses", professorId],
    queryFn: () => courseApi.getByProfessor(professorId),
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("professorId");
    navigate("/");
  };

  const totalLessons = courses.reduce((acc: number, course: any) => {
    return acc + (course.lessons_count || 0);
  }, 0);

  const stats = [
    {
      icon: BookOpen,
      label: "Active Courses",
      value: courses.length.toString(),
    },
    { icon: Users, label: "Total Students", value: "0" },
    { icon: Video, label: "Video Lessons", value: totalLessons.toString() },
    { icon: TrendingUp, label: "Avg. Rating", value: "N/A" },
  ];

  return (
    <DashboardLayout role="professor" onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Professor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your courses and students
            </p>
          </div>
          <Button onClick={() => navigate("/professor/create")} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New Course
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Courses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">My Courses</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-destructive">
                  Failed to load courses. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  You haven't created any courses yet.
                </p>
                <Button onClick={() => navigate("/professor/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {courses.map((course: any) => (
                <Card
                  key={course.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course.lessons_count || 0} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            {course.modules_count || 0} modules
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              course.status === "published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : course.status === "draft"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {course.status || "draft"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(`/professor/courses/${course.id}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
