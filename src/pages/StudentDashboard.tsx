import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const enrolledCourses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      instructor: "Dr. Sarah Johnson",
      duration: "8 weeks",
      students: 1234,
      lessons: 24,
      progress: 65,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      instructor: "Prof. Michael Chen",
      duration: "6 weeks",
      students: 892,
      lessons: 18,
      progress: 30,
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    },
  ];

  const stats = [
    { icon: TrendingUp, label: "Courses Enrolled", value: "5" },
    { icon: Clock, label: "Hours Learned", value: "42" },
    { icon: Award, label: "Certificates", value: "2" },
  ];

  return (
    <DashboardLayout role="student" onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for courses..." className="pl-10" />
          </div>
          <Button>Search</Button>
        </div>

        {/* Continue Learning */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Continue Learning</h2>
            <Button variant="ghost">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                onContinue={() => navigate(`/course/${course.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              title="Python for Data Science"
              instructor="Dr. Emily White"
              duration="10 weeks"
              students={2156}
              lessons={32}
              image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop"
              onEnroll={() => {}}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
