import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Video, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VideoRecorder } from "@/components/VideoRecorder";
import { courseApi, moduleApi, lessonApi, videoApi } from "@/lib/api";

interface Lesson {
  title: string;
  video: Blob | null;
  videoFileName: string;
  description?: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

export default function ProfessorCreate() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [modules, setModules] = useState<Module[]>([
    { title: "", lessons: [{ title: "", video: null, videoFileName: "" }] },
  ]);
  const [recordingLesson, setRecordingLesson] = useState<{
    moduleIndex: number;
    lessonIndex: number;
  } | null>(null);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get professor ID from localStorage (you'll need to implement proper auth)
  const professorId = parseInt(localStorage.getItem("professorId") || "1");

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("professorId");
    navigate("/");
  };

  const addModule = () => {
    setModules([
      ...modules,
      { title: "", lessons: [{ title: "", video: null, videoFileName: "" }] },
    ]);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      title: "",
      video: null,
      videoFileName: "",
    });
    setModules(newModules);
  };

  const removeModule = (moduleIndex: number) => {
    setModules(modules.filter((_, i) => i !== moduleIndex));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setModules(newModules);
  };

  const handleVideoRecorded = (videoBlob: Blob, fileName: string) => {
    if (recordingLesson) {
      const newModules = [...modules];
      newModules[recordingLesson.moduleIndex].lessons[
        recordingLesson.lessonIndex
      ].video = videoBlob;
      newModules[recordingLesson.moduleIndex].lessons[
        recordingLesson.lessonIndex
      ].videoFileName = fileName;
      setModules(newModules);
      setIsRecordingDialogOpen(false);
      setRecordingLesson(null);
      toast.success("Video recorded and saved locally!");
    }
  };

  const handleRecordVideo = (moduleIndex: number, lessonIndex: number) => {
    setRecordingLesson({ moduleIndex, lessonIndex });
    setIsRecordingDialogOpen(true);
  };

  const handleUploadVideo = async (
    moduleIndex: number,
    lessonIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      // 500MB limit
      toast.error("Video file is too large. Maximum size is 500MB");
      return;
    }

    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex].video = file;
    newModules[moduleIndex].lessons[lessonIndex].videoFileName = file.name;
    setModules(newModules);
    toast.success("Video file selected!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create course
      const course = await courseApi.create({
        professor_id: professorId,
        title: courseTitle,
        description: courseDescription,
      });

      toast.success("Course created! Adding modules and lessons...");

      // 2. Create modules and lessons
      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
        const module = modules[moduleIndex];
        let moduleId: number | undefined;

        if (module.title) {
          // Create module if it has a title
          const createdModule = await moduleApi.create(course.id!, {
            title: module.title,
            order_index: moduleIndex + 1,
          });
          moduleId = createdModule.id;
        }

        // 3. Create lessons and upload videos
        for (
          let lessonIndex = 0;
          lessonIndex < module.lessons.length;
          lessonIndex++
        ) {
          const lesson = module.lessons[lessonIndex];

          if (!lesson.title) continue;

          let s3Key: string | undefined;

          // Upload video if exists
          if (lesson.video) {
            try {
              const file =
                lesson.video instanceof File
                  ? lesson.video
                  : new File([lesson.video], lesson.videoFileName, {
                      type: "video/webm",
                    });

              toast.loading(`Uploading video for lesson "${lesson.title}"...`);
              const uploadResult = await videoApi.uploadToS3(file);
              s3Key = uploadResult.s3_key;
              toast.dismiss();
              toast.success(`Video uploaded for "${lesson.title}"`);
            } catch (error) {
              console.error("Error uploading video:", error);
              toast.error(`Failed to upload video for "${lesson.title}"`);
              // Continue without video, lesson will be created without video
            }
          }

          // Create lesson
          await lessonApi.create({
            course_id: course.id!,
            module_id: moduleId,
            title: lesson.title,
            description: lesson.description,
            order_index: lessonIndex + 1,
            duration_minutes: 5,
            s3_key: s3Key,
            status: s3Key ? "ready" : "draft",
          });
        }
      }

      toast.success("Course created successfully with all lessons!");
      navigate("/professor");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="professor" onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-muted-foreground">
            Build your course structure and upload content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Web Development"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Modules and Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Course Modules</h2>
              <Button type="button" onClick={addModule} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </div>

            {modules.map((module, moduleIndex) => (
              <Card key={moduleIndex}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">
                    Module {moduleIndex + 1}
                  </CardTitle>
                  {modules.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Module Title (optional)</Label>
                    <Input
                      placeholder="e.g., Getting Started"
                      value={module.title}
                      onChange={(e) => {
                        const newModules = [...modules];
                        newModules[moduleIndex].title = e.target.value;
                        setModules(newModules);
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Lessons</Label>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="flex gap-3 items-start p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder="Lesson title"
                            value={lesson.title}
                            onChange={(e) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].title = e.target.value;
                              setModules(newModules);
                            }}
                            required
                          />
                          {lesson.video && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              {lesson.videoFileName}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <label className="flex-1">
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleUploadVideo(moduleIndex, lessonIndex, e)
                                }
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                asChild
                              >
                                <span>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Video
                                </span>
                              </Button>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleRecordVideo(moduleIndex, lessonIndex)
                              }
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Record Video
                            </Button>
                          </div>
                        </div>
                        {module.lessons.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeLesson(moduleIndex, lessonIndex)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addLesson(moduleIndex)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lesson
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/professor")}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </div>
        </form>

        {/* Video Recording Dialog */}
        <Dialog
          open={isRecordingDialogOpen}
          onOpenChange={setIsRecordingDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Video Lesson</DialogTitle>
            </DialogHeader>
            <VideoRecorder
              onVideoRecorded={handleVideoRecorded}
              maxDuration={300}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
