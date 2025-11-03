import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Play,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { enrollmentApi } from "@/lib/api";
import { toast } from "sonner";

export default function CoursePreview() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const studentId = parseInt(localStorage.getItem("userId") || "4");

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course-preview", courseId],
    queryFn: () => enrollmentApi.getCoursePreview(Number(courseId)),
    enabled: !!courseId,
  });

  const { data: enrollmentCheck } = useQuery({
    queryKey: ["enrollment-check", studentId, courseId],
    queryFn: () => enrollmentApi.checkEnrollment(studentId, Number(courseId)),
    enabled: !!courseId && !!studentId,
  });

  const enrollMutation = useMutation({
    mutationFn: () =>
      enrollmentApi.enrollInCourse(studentId, Number(courseId!)),
    onSuccess: () => {
      toast.success("Successfully enrolled in course!");
      queryClient.invalidateQueries({ queryKey: ["enrollment-check"] });
      navigate(`/course/${courseId}`);
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

  const formatDuration = (minutes: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (isLoading) {
    return (
      <DashboardLayout role="student" onLogout={handleLogout}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout role="student" onLogout={handleLogout}>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              Failed to load course. Please try again.
            </p>
            <Button
              onClick={() => navigate("/student/courses")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const isEnrolled = enrollmentCheck?.enrolled;

  return (
    <DashboardLayout role="student" onLogout={handleLogout}>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate("/student/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="h-24 w-24 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {course.title}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      by {course.professor_name}
                    </p>
                  </div>
                  <Badge
                    variant={
                      course.status === "published" ? "default" : "secondary"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About this course</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {course.description}
                    </p>
                  </div>
                )}

                {course.professor_bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About the instructor</h3>
                    <p className="text-muted-foreground">
                      {course.professor_bio}
                    </p>
                    {course.specialization && (
                      <Badge variant="outline" className="mt-2">
                        {course.specialization}
                      </Badge>
                    )}
                  </div>
                )}

                {course.lessons && course.lessons.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Course Content</h3>
                    <div className="space-y-2">
                      {course.lessons.map((lesson: any, index: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.module_title && (
                              <p className="text-sm text-muted-foreground">
                                {lesson.module_title}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(lesson.duration_minutes)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lessons:</span>
                  <span className="font-medium">
                    {course.lessons_count || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {formatDuration(course.total_duration_minutes)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-medium">
                    {course.enrolled_students_count || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Enrolled</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/course/${courseId}`)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    size="lg"
                  >
                    {enrollMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Enroll in Course
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
