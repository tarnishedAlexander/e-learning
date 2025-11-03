import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { toast } from "sonner";

export default function CoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const course = {
    title: "Introduction to Web Development",
    instructor: "Dr. Sarah Johnson",
    progress: 65,
    modules: [
      {
        title: "Getting Started",
        lessons: [
          { id: 0, title: "Welcome to the Course", duration: "3:24" },
          { id: 1, title: "Setting Up Your Environment", duration: "4:56" },
          { id: 2, title: "Your First HTML Page", duration: "5:12" },
        ],
      },
      {
        title: "HTML Fundamentals",
        lessons: [
          { id: 3, title: "HTML Elements and Tags", duration: "4:38" },
          { id: 4, title: "Working with Forms", duration: "5:45" },
          { id: 5, title: "Semantic HTML", duration: "4:20" },
        ],
      },
      {
        title: "CSS Styling",
        lessons: [
          { id: 6, title: "CSS Basics", duration: "5:10" },
          { id: 7, title: "Flexbox Layout", duration: "6:30" },
          { id: 8, title: "Responsive Design", duration: "5:55" },
        ],
      },
    ],
  };

  const handleCompleteLesson = () => {
    if (!completedLessons.includes(selectedLesson)) {
      setCompletedLessons([...completedLessons, selectedLesson]);
      toast.success("Lesson marked as complete!");
    }
  };

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const progressPercentage = (completedLessons.length / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">by {course.instructor}</p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <span className="text-sm text-muted-foreground">
                {completedLessons.length} of {totalLessons} lessons completed
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
            <VideoPlayer
              title={
                course.modules
                  .flatMap((m) => m.lessons)
                  .find((l) => l.id === selectedLesson)?.title || ""
              }
              onComplete={handleCompleteLesson}
            />
          </div>

          {/* Lesson List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Course Content</h2>
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <Card key={moduleIndex}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">{module.title}</h3>
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isActive = selectedLesson === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                            ) : isActive ? (
                              <PlayCircle className="h-5 w-5 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isActive ? "text-primary-foreground" : ""
                              }`}>
                                {lesson.title}
                              </p>
                              <p className={`text-xs ${
                                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                              }`}>
                                {lesson.duration}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
