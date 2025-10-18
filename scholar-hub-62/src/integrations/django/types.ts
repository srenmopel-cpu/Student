// Django API types matching the Django models

export interface DjangoStudent {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  phone?: string;
  address?: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  created_at: string;
  updated_at: string;
}

export interface DjangoClass {
  id: number;
  class_name: string;
  grade_level: string;
  section?: string;
  academic_year: string;
  class_teacher?: number; // User ID
  room_number?: string;
  capacity: number;
  description?: string;
  current_enrollment: number;
  available_seats: number;
  created_at: string;
  updated_at: string;
}

export interface DjangoSubject {
  id: number;
  subject_code: string;
  subject_name: string;
  description?: string;
  credits: number;
  department?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DjangoGrade {
  id: number;
  student: number; // Student ID
  student_name?: string; // Read-only field from serializer
  subject: number; // Subject ID
  subject_name?: string; // Read-only field from serializer
  class_name_id: number; // Class ID
  class_name?: string; // Read-only field from serializer
  grade_value: number;
  max_grade: number;
  grade_type: 'assignment' | 'quiz' | 'test' | 'exam' | 'midterm' | 'final' | 'project' | 'participation';
  title: string;
  description?: string;
  weight: number;
  percentage?: number; // Read-only field from serializer
  letter_grade?: string; // Read-only field from serializer
  graded_by?: number; // User ID
  graded_date: string;
  created_at: string;
  updated_at: string;
}

export interface DjangoAttendance {
  id: number;
  student: number; // Student ID
  student_name?: string; // Read-only field from serializer
  class_name_id: number; // Class ID
  class_name?: string; // Read-only field from serializer
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  duration?: number; // Read-only field from serializer
  notes?: string;
  marked_by?: number; // User ID
  created_at: string;
  updated_at: string;
}

// API Response types
export interface DjangoAPIResponse<T> {
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

// Filter params for different resources
export interface StudentFilters {
  status?: string;
  grade_level?: string;
  search?: string;
}

export interface ClassFilters {
  grade_level?: string;
  academic_year?: string;
  class_teacher?: number;
}

export interface GradeFilters {
  student?: number;
  subject?: number;
  class_name?: number;
  grade_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface AttendanceFilters {
  student?: number;
  class_name?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}