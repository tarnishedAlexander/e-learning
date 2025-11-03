import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Play,
  Loader2,
  Eye,
} from "lucide-react";
import { enrollmentApi } from "@/lib/api";
import { toast } from "sonner";

export default function CoursesAvailable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const studentId = parseInt(localStorage.getItem("userId") || "4");

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["available-courses"],
    queryFn: () => enrollmentApi.getAvailableCourses(),
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: number) =>
      enrollmentApi.enrollInCourse(studentId, courseId),
    onSuccess: () => {
      toast.success("Successfully enrolled in course!");
      queryClient.invalidateQueries({ queryKey: ["available-courses"] });
      queryClient.invalidateQueries({
        queryKey: ["student-enrollments", studentId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enroll in course");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handlePreview = (courseId: number) => {
    navigate(`/student/courses/${courseId}/preview`);
  };

  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  const filteredCourses = courses.filter(
    (course: any) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <DashboardLayout role="student" onLogout={handleLogout}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Available Courses</h1>
          <p className="text-muted-foreground">Browse and enroll in courses</p>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for courses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid */}
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
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No courses found matching your search."
                  : "No courses available."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow"
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
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrolled_students_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {course.lessons_count || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.total_duration_minutes)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">Instructor:</p>
                    <p className="font-medium">
                      {course.professor_name || "Unknown"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handlePreview(course.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Enroll
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
