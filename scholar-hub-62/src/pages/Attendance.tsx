import { useEffect, useState } from "react";
import { djangoAPI } from "@/integrations/django/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Attendance {
  id: number;
  student: number;
  student_name?: string;
  class_name: number;
  class_display?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  duration?: number;
  notes?: string;
  marked_by?: number;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

interface Class {
  id: number;
  class_name: string;
}

const Attendance = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [formData, setFormData] = useState({
    student: 0,
    class_name: 0,
    date: new Date().toISOString().split("T")[0],
    status: "present" as 'present' | 'absent' | 'late' | 'excused',
    check_in_time: "",
    check_out_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    const filtered = attendance.filter(
      (record) =>
        record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.class_display?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAttendance(filtered);
  }, [searchTerm, attendance]);

  const fetchAttendance = async () => {
    try {
      const response = await djangoAPI.getAttendance();
      // Handle both paginated and direct array responses
      const attendanceData: Attendance[] = Array.isArray(response) ? response : (response as any).results || [];
      setAttendance(attendanceData);
    } catch (error) {
      toast.error("Error fetching attendance");
      console.error("Error fetching attendance:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await djangoAPI.getStudents();
      // Handle both paginated and direct array responses
      const studentsData: Student[] = Array.isArray(response) ? response : (response as any).results || [];
      setStudents(studentsData);
    } catch (error) {
      toast.error("Error fetching students");
      console.error("Error fetching students:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await djangoAPI.getClasses();
      // Handle both paginated and direct array responses
      const classesData: Class[] = Array.isArray(response) ? response : (response as any).results || [];
      setClasses(classesData);
    } catch (error) {
      toast.error("Error fetching classes");
      console.error("Error fetching classes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && editingRecord) {
        await djangoAPI.updateAttendance(editingRecord.id, formData);
        toast.success("Attendance updated successfully");
      } else {
        await djangoAPI.createAttendance(formData);
        toast.success("Attendance marked successfully");
      }
      await fetchAttendance(); // Wait for data to refresh
      resetForm();
    } catch (error) {
      toast.error(`Error ${isEditing ? 'updating' : 'marking'} attendance`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} attendance:`, error);
    }
  };

  const resetForm = () => {
    setFormData({
      student: 0,
      class_name: 0,
      date: new Date().toISOString().split("T")[0],
      status: "present",
      check_in_time: "",
      check_out_time: "",
      notes: "",
    });
    setIsEditing(false);
    setEditingRecord(null);
    setDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "default";
      case "absent":
        return "destructive";
      case "late":
        return "secondary";
      case "excused":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleEdit = (record: Attendance) => {
    setIsEditing(true);
    setEditingRecord(record);
    setFormData({
      student: record.student,
      class_name: record.class_name,
      date: record.date,
      status: record.status,
      check_in_time: record.check_in_time || "",
      check_out_time: record.check_out_time || "",
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (record: Attendance) => {
    if (window.confirm(`Are you sure you want to delete this attendance record for ${record.student_name}?`)) {
      try {
        await djangoAPI.deleteAttendance(record.id);
        toast.success("Attendance record deleted successfully");
        await fetchAttendance();
      } catch (error) {
        toast.error("Error deleting attendance record");
        console.error("Error deleting attendance:", error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Attendance</h2>
            <p className="text-muted-foreground">Track student attendance</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Attendance' : 'Mark Attendance'}</DialogTitle>
              <DialogDescription>{isEditing ? 'Update student attendance record' : 'Record student attendance'}</DialogDescription>
            </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <select
                    id="student"
                    value={formData.student}
                    onChange={(e) =>
                      setFormData({ ...formData, student: parseInt(e.target.value) })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value={0}>Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.student_id} - {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_name">Class</Label>
                  <select
                    id="class_name"
                    value={formData.class_name}
                    onChange={(e) =>
                      setFormData({ ...formData, class_name: parseInt(e.target.value) })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value={0}>Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'present' | 'absent' | 'late' | 'excused' })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_in_time">Check In Time</Label>
                  <Input
                    id="check_in_time"
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) =>
                      setFormData({ ...formData, check_in_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out_time">Check Out Time</Label>
                  <Input
                    id="check_out_time"
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) =>
                      setFormData({ ...formData, check_out_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">{isEditing ? 'Update Attendance' : 'Mark Attendance'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>View and manage attendance history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student or class..."
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
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record.student_name}</TableCell>
                        <TableCell>{record.class_display}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.check_in_time || "—"}</TableCell>
                        <TableCell>{record.check_out_time || "—"}</TableCell>
                        <TableCell>{record.duration ? `${record.duration.toFixed(2)}h` : "—"}</TableCell>
                        <TableCell>{record.notes || "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(record)}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Attendance;
