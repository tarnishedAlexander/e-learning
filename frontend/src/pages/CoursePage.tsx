import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { enrollmentApi, videoApi } from "@/lib/api";

export default function CoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const studentId = parseInt(localStorage.getItem("userId") || "4");
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  // Get course details
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["enrolled-course", studentId, courseId],
    queryFn: () =>
      enrollmentApi.getEnrolledCourseDetails(studentId, Number(courseId!)),
    enabled: !!courseId && !!studentId,
  });

  // Select first lesson by default
  useEffect(() => {
    if (course?.lessons && course.lessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(course.lessons[0].id);
    }
  }, [course, selectedLessonId]);

  // Load video URL when lesson is selected
  useEffect(() => {
    if (!selectedLessonId || !course?.lessons) return;

    const lesson = course.lessons.find((l: any) => l.id === selectedLessonId);
    if (!lesson) {
      setVideoUrl(null);
      setLoadingVideo(false);
      return;
    }

    if (!lesson.s3_key) {
      console.log("Lesson has no s3_key:", lesson);
      setVideoUrl(null);
      setLoadingVideo(false);
      toast.error("This lesson doesn't have a video yet");
      return;
    }

    console.log(
      "Loading video for lesson:",
      lesson.title,
      "s3_key:",
      lesson.s3_key
    );
    setLoadingVideo(true);
    setVideoUrl(null);

    videoApi
      .getVideoUrl(lesson.s3_key)
      .then((url) => {
        console.log("✅ Video URL obtained successfully:", url);
        setVideoUrl(url);
        setLoadingVideo(false);
      })
      .catch((error) => {
        console.error("❌ Error loading video:", error);
        toast.error(
          `Failed to load video: ${error.message || "Unknown error"}`
        );
        setLoadingVideo(false);
        setVideoUrl(null);
      });
  }, [selectedLessonId, course]);

  const completeLessonMutation = useMutation({
    mutationFn: (lessonId: number) => {
      // Get enrollment ID from course data
      const enrollmentId = course?.enrollment_id;
      if (!enrollmentId) throw new Error("Enrollment ID not found");
      return enrollmentApi.completeLesson(enrollmentId, lessonId);
    },
    onSuccess: () => {
      toast.success("Lesson marked as complete!");
      queryClient.invalidateQueries({
        queryKey: ["enrolled-course", studentId, courseId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark lesson as complete");
    },
  });

  const handleCompleteLesson = () => {
    if (selectedLessonId) {
      completeLessonMutation.mutate(selectedLessonId);
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return "N/A";
    const mins = Math.floor(minutes);
    return `${mins} min`;
  };

  // Group lessons by module
  const groupedLessons = course?.lessons?.reduce((acc: any, lesson: any) => {
    const moduleTitle = lesson.module_title || "Unorganized Lessons";
    if (!acc[moduleTitle]) {
      acc[moduleTitle] = [];
    }
    acc[moduleTitle].push(lesson);
    return acc;
  }, {});

  const selectedLesson = course?.lessons?.find(
    (l: any) => l.id === selectedLessonId
  );
  const totalLessons = course?.lessons?.length || 0;
  const completedLessons =
    course?.lessons?.filter((l: any) => l.is_completed).length || 0;
  const progressPercentage = course?.progress_percentage || 0;

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive mb-4">
                Failed to load course. You may not be enrolled.
              </p>
              <Button onClick={() => navigate("/student")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/student")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">by {course.professor_name}</p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-medium">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <span className="text-sm text-muted-foreground">
                {completedLessons} of {totalLessons} lessons completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {loadingVideo ? (
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : (
              <VideoPlayer
                title={selectedLesson?.title || "Select a lesson"}
                videoUrl={videoUrl || undefined}
                onComplete={handleCompleteLesson}
              />
            )}
          </div>

          {/* Lesson List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Course Content</h2>
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {groupedLessons &&
                Object.entries(groupedLessons).map(
                  ([moduleTitle, lessons]: [string, any]) => (
                    <Card key={moduleTitle}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">{moduleTitle}</h3>
                        <div className="space-y-2">
                          {lessons.map((lesson: any) => {
                            const isCompleted = lesson.is_completed;
                            const isActive = selectedLessonId === lesson.id;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                ) : isActive ? (
                                  <PlayCircle className="h-5 w-5 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-5 w-5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium truncate ${
                                      isActive ? "text-primary-foreground" : ""
                                    }`}
                                  >
                                    {lesson.title}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      isActive
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {formatDuration(lesson.duration_minutes)}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
