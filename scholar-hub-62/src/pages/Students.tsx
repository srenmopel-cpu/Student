import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { djangoAuth } from "@/integrations/django/auth";

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string | null;
  phone: string | null;
  address: string | null;
  enrollment_date: string;
  status: string;
  gender: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  created_at: string;
  updated_at: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
    phone: "",
    address: "",
    status: "active",
    gender: "M",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/students/', {
        headers: {
          'Authorization': `Bearer ${djangoAuth.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token and retry
          try {
            const refreshToken = djangoAuth.getRefreshToken();
            if (refreshToken) {
              const newTokens = await djangoAuth.refreshToken(refreshToken);
              djangoAuth.setTokens(newTokens);
              // Retry with new token
              const retryResponse = await fetch('http://localhost:8000/api/students/', {
                headers: {
                  'Authorization': `Bearer ${newTokens.access}`,
                  'Content-Type': 'application/json',
                },
              });
              if (retryResponse.ok) {
                const data = await retryResponse.json();
                setStudents(Array.isArray(data) ? data : data.results || []);
                return;
              }
            }
          } catch (refreshError) {
            djangoAuth.clearTokens();
            toast.error("Session expired. Please log in again.");
            return;
          }
        }
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Django API fetch error:', error);
      toast.error("Error fetching students");
      setStudents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!djangoAuth.getAccessToken()) {
      toast.error("You must be logged in to manage students");
      return;
    }

    try {
      const submitData = {
        student_id: formData.student_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        status: formData.status,
        gender: formData.gender,
        ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
        ...(formData.phone && formData.phone.trim() !== '' && { phone: formData.phone }),
        ...(formData.address && formData.address.trim() !== '' && { address: formData.address }),
      };

      let response;
      let url = 'http://localhost:8000/api/students/';
      let method = 'POST';
      let requestData = submitData;

      if (editingStudent) {
        url = `http://localhost:8000/api/students/${editingStudent.id}/`;
        method = 'PUT';
        // For updates, send all form data to ensure complete update
        requestData = submitData;
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${djangoAuth.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token and retry
          try {
            const refreshToken = djangoAuth.getRefreshToken();
            if (refreshToken) {
              const newTokens = await djangoAuth.refreshToken(refreshToken);
              djangoAuth.setTokens(newTokens);
              // Retry with new token
              response = await fetch(url, {
                method: method,
                headers: {
                  'Authorization': `Bearer ${newTokens.access}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
              });
              if (!response.ok) {
                // Get error details from response
                const errorData = await response.json();
                console.error('API Error:', errorData);
                toast.error(`Error: ${errorData.detail || errorData.student_id || errorData.email || 'Failed to save student'}`);
                return;
              }
            } else {
              throw new Error('Session expired');
            }
          } catch (refreshError) {
            djangoAuth.clearTokens();
            toast.error("Session expired. Please log in again.");
            return;
          }
        } else {
          // Get error details from response
          const errorData = await response.json();
          console.error('API Error:', errorData);

          // Handle validation errors
          if (errorData.student_id) {
            toast.error(`Student ID Error: ${errorData.student_id[0]}`);
          } else if (errorData.email) {
            toast.error(`Email Error: ${errorData.email[0]}`);
          } else if (errorData.phone) {
            toast.error(`Phone Error: ${errorData.phone[0]}`);
          } else if (errorData.detail) {
            toast.error(`Error: ${errorData.detail}`);
          } else {
            toast.error('Failed to save student');
          }
          return;
        }
      }

      toast.success(editingStudent ? "Student updated successfully" : "Student created successfully");
      await fetchStudents(); // Wait for fetch to complete
      resetForm();
    } catch (error) {
      console.error('Django API error:', error);
      toast.error("Error saving student");
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!djangoAuth.getAccessToken()) {
      toast.error("You must be logged in to update students");
      return;
    }

    try {
      let response = await fetch(`http://localhost:8000/api/students/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${djangoAuth.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token and retry
          try {
            const refreshToken = djangoAuth.getRefreshToken();
            if (refreshToken) {
              const newTokens = await djangoAuth.refreshToken(refreshToken);
              djangoAuth.setTokens(newTokens);
              // Retry with new token
              response = await fetch(`http://localhost:8000/api/students/${id}/`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${newTokens.access}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
              });
              if (!response.ok) {
                throw new Error('Failed to update student status');
              }
            } else {
              throw new Error('Session expired');
            }
          } catch (refreshError) {
            djangoAuth.clearTokens();
            toast.error("Session expired. Please log in again.");
            return;
          }
        } else {
          throw new Error('Failed to update student status');
        }
      }

      toast.success("Student status updated successfully");
      fetchStudents();
    } catch (error) {
      console.error('Django API status update error:', error);
      toast.error("Error updating student status");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      if (!djangoAuth.getAccessToken()) {
        toast.error("You must be logged in to delete students");
        return;
      }

      try {
        let response = await fetch(`http://localhost:8000/api/students/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${djangoAuth.getAccessToken()}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Try to refresh token and retry
            try {
              const refreshToken = djangoAuth.getRefreshToken();
              if (refreshToken) {
                const newTokens = await djangoAuth.refreshToken(refreshToken);
                djangoAuth.setTokens(newTokens);
                // Retry with new token
                response = await fetch(`http://localhost:8000/api/students/${id}/`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${newTokens.access}`,
                  },
                });
                if (!response.ok) {
                  throw new Error('Failed to delete student');
                }
              } else {
                throw new Error('Session expired');
              }
            } catch (refreshError) {
              djangoAuth.clearTokens();
              toast.error("Session expired. Please log in again.");
              return;
            }
          } else {
            throw new Error('Failed to delete student');
          }
        }

        toast.success("Student deleted successfully");
        fetchStudents();
      } catch (error) {
        console.error('Django API delete error:', error);
        toast.error("Error deleting student");
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      date_of_birth: student.date_of_birth || "",
      phone: student.phone || "",
      address: student.address || "",
      status: student.status,
      gender: student.gender,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      first_name: "",
      last_name: "",
      email: "",
      date_of_birth: "",
      phone: "",
      address: "",
      status: "active",
      gender: "M",
    });
    setEditingStudent(null);
    setDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Students</h2>
            <p className="text-muted-foreground">Manage student records</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? "Edit Student" : "Add New Student"}
                </DialogTitle>
                <DialogDescription>
                  {editingStudent
                    ? "Update student information"
                    : "Create a new student record"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input
                      id="student_id"
                      value={formData.student_id}
                      onChange={(e) =>
                        setFormData({ ...formData, student_id: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value as 'M' | 'F' | 'O' })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingStudent ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Records</CardTitle>
            <CardDescription>
              View and manage all student information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.student_id}
                        </TableCell>
                        <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Students;
