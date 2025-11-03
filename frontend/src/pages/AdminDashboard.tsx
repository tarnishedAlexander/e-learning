import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Eye,
  Ban,
  Trash2,
  Search,
  Loader2,
  GraduationCap,
  UserX,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showProfessorDialog, setShowProfessorDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banAction, setBanAction] = useState<"ban" | "unban">("ban");
  const [itemToBan, setItemToBan] = useState<{
    type: "student" | "professor";
    id: number;
  } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "student" | "professor";
    id: number;
  } | null>(null);

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: () => adminApi.getStudents(),
  });

  const { data: professors = [], isLoading: professorsLoading } = useQuery({
    queryKey: ["admin-professors"],
    queryFn: () => adminApi.getProfessors(),
  });

  const { data: studentDetails, isLoading: studentDetailsLoading } = useQuery({
    queryKey: ["admin-student-details", selectedStudent?.id],
    queryFn: () => adminApi.getStudentDetails(selectedStudent.id),
    enabled: !!selectedStudent,
  });

  const { data: professorDetails, isLoading: professorDetailsLoading } =
    useQuery({
      queryKey: ["admin-professor-details", selectedProfessor?.id],
      queryFn: () => adminApi.getProfessorDetails(selectedProfessor.id),
      enabled: !!selectedProfessor,
    });

  const banMutation = useMutation({
    mutationFn: ({
      type,
      id,
      banned,
      reason,
    }: {
      type: "student" | "professor";
      id: number;
      banned: boolean;
      reason?: string;
    }) => {
      if (type === "student") {
        return adminApi.banStudent(id, banned, reason);
      } else {
        return adminApi.banProfessor(id, banned, reason);
      }
    },
    onSuccess: () => {
      toast.success(
        `User ${banAction === "ban" ? "banned" : "unbanned"} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      setShowBanDialog(false);
      setBanReason("");
      setItemToBan(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ban status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      type,
      id,
    }: {
      type: "student" | "professor";
      id: number;
    }) => {
      if (type === "student") {
        return adminApi.deleteStudent(id);
      } else {
        return adminApi.deleteProfessor(id);
      }
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      setShowDeleteDialog(false);
      setItemToDelete(null);
      if (itemToDelete?.type === "student") {
        setSelectedStudent(null);
        setShowStudentDialog(false);
      } else {
        setSelectedProfessor(null);
        setShowProfessorDialog(false);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleViewStudent = async (student: any) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };

  const handleViewProfessor = async (professor: any) => {
    setSelectedProfessor(professor);
    setShowProfessorDialog(true);
  };

  const handleBanClick = (
    type: "student" | "professor",
    id: number,
    isBanned: boolean
  ) => {
    setItemToBan({ type, id });
    setBanAction(isBanned ? "unban" : "ban");
    setBanReason("");
    setShowBanDialog(true);
  };

  const handleDeleteClick = (type: "student" | "professor", id: number) => {
    setItemToDelete({ type, id });
    setShowDeleteDialog(true);
  };

  const handleBan = () => {
    if (!itemToBan) return;
    banMutation.mutate({
      type: itemToBan.type,
      id: itemToBan.id,
      banned: banAction === "ban",
      reason: banReason || undefined,
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteMutation.mutate({
      type: itemToDelete.type,
      id: itemToDelete.id,
    });
  };

  const filteredStudents = students.filter(
    (student: any) =>
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProfessors = professors.filter(
    (professor: any) =>
      professor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professor.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = students.length;
  const totalProfessors = professors.length;
  const bannedUsers = [...students, ...professors].filter(
    (u: any) => u.banned
  ).length;
  const totalCourses = professors.reduce(
    (acc: number, p: any) => acc + (p.total_courses || 0),
    0
  );

  const stats = [
    { icon: Users, label: "Total Students", value: totalStudents.toString() },
    {
      icon: GraduationCap,
      label: "Total Professors",
      value: totalProfessors.toString(),
    },
    { icon: BookOpen, label: "Total Courses", value: totalCourses.toString() },
    { icon: UserX, label: "Banned Users", value: bannedUsers.toString() },
  ];

  return (
    <DashboardLayout role="admin" onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage students, professors, and platform content
          </p>
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

        {/* Tabs for Students and Professors */}
        <Tabs defaultValue="students" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="professors">Professors</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Completed Lessons</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No students found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((student: any) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.first_name} {student.last_name}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              {student.total_enrollments || 0}
                            </TableCell>
                            <TableCell>
                              {student.completed_lessons || 0}
                            </TableCell>
                            <TableCell>
                              {student.banned ? (
                                <Badge variant="destructive">Banned</Badge>
                              ) : (
                                <Badge variant="default">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewStudent(student)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleBanClick(
                                      "student",
                                      student.id,
                                      student.banned
                                    )
                                  }
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick("student", student.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professors Tab */}
          <TabsContent value="professors" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {professorsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Lessons</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfessors.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No professors found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProfessors.map((professor: any) => (
                          <TableRow key={professor.id}>
                            <TableCell className="font-medium">
                              {professor.first_name} {professor.last_name}
                            </TableCell>
                            <TableCell>{professor.email}</TableCell>
                            <TableCell>
                              {professor.total_courses || 0}
                            </TableCell>
                            <TableCell>
                              {professor.total_lessons || 0}
                            </TableCell>
                            <TableCell>
                              {professor.total_enrollments || 0}
                            </TableCell>
                            <TableCell>
                              {professor.banned ? (
                                <Badge variant="destructive">Banned</Badge>
                              ) : (
                                <Badge variant="default">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewProfessor(professor)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleBanClick(
                                      "professor",
                                      professor.id,
                                      professor.banned
                                    )
                                  }
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteClick("professor", professor.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Student Details Dialog */}
        <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Student Details - {selectedStudent?.first_name}{" "}
                {selectedStudent?.last_name}
              </DialogTitle>
              <DialogDescription>{selectedStudent?.email}</DialogDescription>
            </DialogHeader>
            {studentDetailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : studentDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div>
                      {studentDetails.student.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Joined</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        studentDetails.student.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {studentDetails.student.banned && (
                  <div>
                    <Label>Ban Reason</Label>
                    <p className="text-sm text-muted-foreground">
                      {studentDetails.student.banned_reason ||
                        "No reason provided"}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-lg font-semibold mb-2">
                    Enrolled Courses
                  </Label>
                  <div className="space-y-2">
                    {studentDetails.enrollments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No enrollments
                      </p>
                    ) : (
                      studentDetails.enrollments.map((enrollment: any) => (
                        <Card key={enrollment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {enrollment.course_title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  by {enrollment.professor_name}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-muted-foreground">
                                    Progress:{" "}
                                    {enrollment.progress_percentage || 0}%
                                  </span>
                                  <span className="text-muted-foreground">
                                    {enrollment.completed_lessons || 0} /{" "}
                                    {enrollment.total_lessons || 0} lessons
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowStudentDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Professor Details Dialog */}
        <Dialog
          open={showProfessorDialog}
          onOpenChange={setShowProfessorDialog}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Professor Details - {selectedProfessor?.first_name}{" "}
                {selectedProfessor?.last_name}
              </DialogTitle>
              <DialogDescription>{selectedProfessor?.email}</DialogDescription>
            </DialogHeader>
            {professorDetailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : professorDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div>
                      {professorDetails.professor.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <p className="text-sm text-muted-foreground">
                      {professorDetails.professor.specialization || "N/A"}
                    </p>
                  </div>
                </div>

                {professorDetails.professor.bio && (
                  <div>
                    <Label>Bio</Label>
                    <p className="text-sm text-muted-foreground">
                      {professorDetails.professor.bio}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-lg font-semibold mb-2">Courses</Label>
                  <div className="space-y-2">
                    {professorDetails.courses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No courses created
                      </p>
                    ) : (
                      professorDetails.courses.map((course: any) => (
                        <Card key={course.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {course.title}
                                </h4>
                                {course.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {course.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="text-muted-foreground">
                                    {course.lessons_count || 0} lessons
                                  </span>
                                  <span className="text-muted-foreground">
                                    {course.enrollments_count || 0} enrollments
                                  </span>
                                  <Badge
                                    variant={
                                      course.status === "published"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {course.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowProfessorDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ban Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {banAction === "ban" ? "Ban User" : "Unban User"}
              </DialogTitle>
              <DialogDescription>
                {banAction === "ban"
                  ? "Are you sure you want to ban this user? They will not be able to access the platform."
                  : "Are you sure you want to unban this user? They will regain access to the platform."}
              </DialogDescription>
            </DialogHeader>
            {banAction === "ban" && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for banning..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={banAction === "ban" ? "destructive" : "default"}
                onClick={handleBan}
                disabled={banMutation.isPending}
              >
                {banMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : banAction === "ban" ? (
                  "Ban User"
                ) : (
                  "Unban User"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user and all associated data (courses, enrollments, etc.).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
