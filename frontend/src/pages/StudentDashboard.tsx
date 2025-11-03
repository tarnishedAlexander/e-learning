import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Loader2,
  Search,
  Play,
  Users,
} from "lucide-react";
import { enrollmentApi } from "@/lib/api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const studentId = parseInt(localStorage.getItem("userId") || "4");

  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useQuery({
    queryKey: ["student-enrollments", studentId],
    queryFn: () => enrollmentApi.getStudentEnrollments(studentId),
  });

  const { data: availableCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["available-courses"],
    queryFn: () => enrollmentApi.getAvailableCourses(),
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const totalEnrollments = enrollments.length;
  const totalLessons = enrollments.reduce(
    (acc: number, e: any) => acc + (e.total_lessons || 0),
    0
  );
  const completedLessons = enrollments.reduce(
    (acc: number, e: any) => acc + (e.completed_lessons || 0),
    0
  );

  const stats = [
    {
      icon: TrendingUp,
      label: "Courses Enrolled",
      value: totalEnrollments.toString(),
    },
    {
      icon: Clock,
      label: "Lessons Completed",
      value: completedLessons.toString(),
    },
    { icon: Award, label: "Total Lessons", value: totalLessons.toString() },
  ];

  const formatProgress = (progress: number) => {
    return Math.round(progress || 0);
  };

  return (
    <DashboardLayout role="student" onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground">
              Continue your learning journey
            </p>
          </div>
          <Button onClick={() => navigate("/student/courses")} size="lg">
            <Search className="mr-2 h-5 w-5" />
            Browse Courses
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* My Enrolled Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Courses</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/student/courses")}
            >
              View All
            </Button>
          </div>

          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : enrollmentsError ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-destructive">
                  Failed to load courses. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : enrollments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  You haven't enrolled in any courses yet.
                </p>
                <Button onClick={() => navigate("/student/courses")}>
                  <Search className="mr-2 h-4 w-4" />
                  Browse Available Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment: any) => (
                <Card
                  key={enrollment.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/course/${enrollment.course_id}`)}
                >
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      {enrollment.thumbnail_url ? (
                        <img
                          src={enrollment.thumbnail_url}
                          alt={enrollment.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">
                      {enrollment.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {enrollment.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {enrollment.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {formatProgress(enrollment.progress_percentage)}%
                        </span>
                      </div>
                      <Progress
                        value={enrollment.progress_percentage || 0}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {enrollment.completed_lessons || 0} /{" "}
                          {enrollment.total_lessons || 0} lessons
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${enrollment.course_id}`);
                      }}
                    >
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Available Courses</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/student/courses")}
            >
              View All
            </Button>
          </div>

          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableCourses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No courses available at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses
                .filter(
                  (course: any) =>
                    !enrollments.some((e: any) => e.course_id === course.id)
                )
                .slice(0, 6)
                .map((course: any) => (
                  <Card
                    key={course.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() =>
                      navigate(`/student/courses/${course.id}/preview`)
                    }
                  >
                    <CardHeader>
                      <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {course.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {course.lessons_count || 0} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolled_students_count || 0} students
                        </span>
                      </div>

                      <div className="text-sm">
                        <p className="text-muted-foreground">Instructor:</p>
                        <p className="font-medium">
                          {course.professor_name || "Unknown"}
                        </p>
                      </div>

                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/courses/${course.id}/preview`);
                        }}
                      >
                        View Course
                      </Button>
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
