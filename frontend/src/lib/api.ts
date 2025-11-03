const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface User {
  id: number;
  email: string;
  role: "student" | "professor" | "admin";
  firstName?: string;
  lastName?: string;
}

// Auth API
export const authApi = {
  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "student" | "professor" | "admin"
  ) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to register");
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to login");
    }
    return response.json();
  },
};

interface Course {
  id?: number;
  professor_id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  status?: "draft" | "published" | "archived";
}

interface Module {
  id?: number;
  course_id: number;
  title: string;
  order_index?: number;
}

interface Lesson {
  id?: number;
  course_id: number;
  module_id?: number;
  title: string;
  description?: string;
  order_index?: number;
  duration_minutes?: number;
  s3_key?: string;
  video_url?: string;
  thumbnail_url?: string;
  status?: "draft" | "processing" | "ready" | "published";
}

// Courses API
export const courseApi = {
  create: async (course: Course) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course),
    });
    if (!response.ok) throw new Error("Failed to create course");
    return response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error("Failed to fetch course");
    return response.json();
  },

  getByProfessor: async (professorId: number) => {
    const response = await fetch(`${API_BASE_URL}/courses/professor/${professorId}`);
    if (!response.ok) throw new Error("Failed to fetch courses");
    return response.json();
  },

  update: async (id: number, course: Partial<Course>) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course),
    });
    if (!response.ok) throw new Error("Failed to update course");
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete course");
    return response.json();
  },
};

// Modules API
export const moduleApi = {
  create: async (courseId: number, module: Omit<Module, "course_id">) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(module),
    });
    if (!response.ok) throw new Error("Failed to create module");
    return response.json();
  },

  update: async (moduleId: number, module: Partial<Module>) => {
    const response = await fetch(`${API_BASE_URL}/courses/modules/${moduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(module),
    });
    if (!response.ok) throw new Error("Failed to update module");
    return response.json();
  },

  delete: async (moduleId: number) => {
    const response = await fetch(`${API_BASE_URL}/courses/modules/${moduleId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete module");
    return response.json();
  },
};

// Lessons API
export const lessonApi = {
  create: async (lesson: Lesson) => {
    const response = await fetch(`${API_BASE_URL}/videos/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lesson),
    });
    if (!response.ok) throw new Error("Failed to create lesson");
    return response.json();
  },

  getByCourse: async (courseId: number) => {
    const response = await fetch(`${API_BASE_URL}/videos/lessons/course/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch lessons");
    return response.json();
  },

  update: async (lessonId: number, lesson: Partial<Lesson>) => {
    const response = await fetch(`${API_BASE_URL}/videos/lessons/${lessonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lesson),
    });
    if (!response.ok) throw new Error("Failed to update lesson");
    return response.json();
  },

  delete: async (lessonId: number) => {
    const response = await fetch(`${API_BASE_URL}/videos/lessons/${lessonId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete lesson");
    return response.json();
  },
};

// Video Upload API
export const videoApi = {
  uploadToS3: async (videoFile: File): Promise<{ s3_key: string; file_name: string }> => {
    const formData = new FormData();
    formData.append("video", videoFile);

    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload video");
    }

    return response.json();
  },

  getVideoUrl: async (s3Key: string): Promise<string> => {
    const encodedKey = encodeURIComponent(s3Key);
    const response = await fetch(`${API_BASE_URL}/videos/url?s3Key=${encodedKey}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || "Failed to get video URL");
    }
    const data = await response.json();
    return data.video_url;
  },
};

// Enrollment API
export const enrollmentApi = {
  getAvailableCourses: async () => {
    const response = await fetch(`${API_BASE_URL}/enrollments/courses/available`);
    if (!response.ok) throw new Error("Failed to fetch available courses");
    return response.json();
  },

  getCoursePreview: async (courseId: number) => {
    const response = await fetch(`${API_BASE_URL}/enrollments/courses/${courseId}/preview`);
    if (!response.ok) throw new Error("Failed to fetch course preview");
    return response.json();
  },

  enrollInCourse: async (studentId: number, courseId: number) => {
    const response = await fetch(`${API_BASE_URL}/enrollments/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to enroll in course");
    }
    return response.json();
  },

  getStudentEnrollments: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/enrollments/students/${studentId}/enrollments`);
    if (!response.ok) throw new Error("Failed to fetch enrollments");
    return response.json();
  },

  checkEnrollment: async (studentId: number, courseId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/students/${studentId}/courses/${courseId}/enrollment`
    );
    if (!response.ok) throw new Error("Failed to check enrollment");
    return response.json();
  },

  getEnrolledCourseDetails: async (studentId: number, courseId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/enrollments/students/${studentId}/courses/${courseId}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch course details");
    }
    return response.json();
  },

  completeLesson: async (enrollmentId: number, lessonId: number) => {
    const response = await fetch(`${API_BASE_URL}/enrollments/lessons/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId, lessonId }),
    });
    if (!response.ok) throw new Error("Failed to complete lesson");
    return response.json();
  },
};

// Admin API
export const adminApi = {
  getStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/students`);
    if (!response.ok) throw new Error("Failed to fetch students");
    return response.json();
  },

  getStudentDetails: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/students/${studentId}`);
    if (!response.ok) throw new Error("Failed to fetch student details");
    return response.json();
  },

  banStudent: async (studentId: number, banned: boolean, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/students/${studentId}/ban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned, reason }),
    });
    if (!response.ok) throw new Error("Failed to ban/unban student");
    return response.json();
  },

  deleteStudent: async (studentId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete student");
    return response.json();
  },

  getProfessors: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/professors`);
    if (!response.ok) throw new Error("Failed to fetch professors");
    return response.json();
  },

  getProfessorDetails: async (professorId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/professors/${professorId}`);
    if (!response.ok) throw new Error("Failed to fetch professor details");
    return response.json();
  },

  banProfessor: async (professorId: number, banned: boolean, reason?: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/professors/${professorId}/ban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned, reason }),
    });
    if (!response.ok) throw new Error("Failed to ban/unban professor");
    return response.json();
  },

  deleteProfessor: async (professorId: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/professors/${professorId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete professor");
    return response.json();
  },
};

