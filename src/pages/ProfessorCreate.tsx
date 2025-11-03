import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Video, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function ProfessorCreate() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [modules, setModules] = useState([{ title: "", lessons: [{ title: "", video: null }] }]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const addModule = () => {
    setModules([...modules, { title: "", lessons: [{ title: "", video: null }] }]);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({ title: "", video: null });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Course created successfully!");
    navigate("/professor");
  };

  return (
    <DashboardLayout role="professor" onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-muted-foreground">Build your course structure and upload content</p>
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
                  <CardTitle className="text-lg">Module {moduleIndex + 1}</CardTitle>
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
                    <Label>Module Title</Label>
                    <Input
                      placeholder="e.g., Getting Started"
                      value={module.title}
                      onChange={(e) => {
                        const newModules = [...modules];
                        newModules[moduleIndex].title = e.target.value;
                        setModules(newModules);
                      }}
                      required
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
                              newModules[moduleIndex].lessons[lessonIndex].title =
                                e.target.value;
                              setModules(newModules);
                            }}
                            required
                          />
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" className="flex-1">
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Video
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="flex-1">
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
                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
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
            <Button type="button" variant="outline" onClick={() => navigate("/professor")}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
