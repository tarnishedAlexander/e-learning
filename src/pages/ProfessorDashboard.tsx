import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, BookOpen, Video, TrendingUp } from "lucide-react";

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const stats = [
    { icon: BookOpen, label: "Active Courses", value: "8" },
    { icon: Users, label: "Total Students", value: "1,234" },
    { icon: Video, label: "Video Lessons", value: "156" },
    { icon: TrendingUp, label: "Avg. Rating", value: "4.8" },
  ];

  const courses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      students: 456,
      lessons: 24,
      rating: 4.9,
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      students: 234,
      lessons: 18,
      rating: 4.7,
    },
    {
      id: 3,
      title: "TypeScript Fundamentals",
      students: 544,
      lessons: 20,
      rating: 4.8,
    },
  ];

  return (
    <DashboardLayout role="professor" onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Professor Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and students</p>
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
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
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
          <div className="grid gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students} students
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          ⭐ {course.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">View Analytics</Button>
                      <Button>Edit Course</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">New student enrolled</p>
                    <p className="text-sm text-muted-foreground">Introduction to Web Development</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Course review received</p>
                    <p className="text-sm text-muted-foreground">Advanced React Patterns - 5 stars</p>
                  </div>
                  <span className="text-sm text-muted-foreground">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Lesson completed</p>
                    <p className="text-sm text-muted-foreground">TypeScript Fundamentals - Lesson 15</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
