import { useEffect, useState } from "react";
import { djangoAPI } from "@/integrations/django/client";
import { DjangoGrade, DjangoStudent, DjangoSubject, DjangoClass } from "@/integrations/django/types";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Using Django types instead of local interfaces

const Grades = () => {
  const [grades, setGrades] = useState<DjangoGrade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<DjangoGrade[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<DjangoGrade | null>(null);
  const [students, setStudents] = useState<DjangoStudent[]>([]);
  const [subjects, setSubjects] = useState<DjangoSubject[]>([]);
  const [classes, setClasses] = useState<DjangoClass[]>([]);
  const [formData, setFormData] = useState({
    student: "",
    subject: "",
    class_name_id: "",
    grade_value: "",
    max_grade: "100",
    grade_type: "assignment",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchSubjects();
    fetchClasses();
  }, []);

  useEffect(() => {
    const filtered = grades.filter(
      (grade) =>
        grade.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGrades(filtered);
  }, [searchTerm, grades]);

  const fetchGrades = async () => {
    try {
      const data = await djangoAPI.getGrades();
      setGrades(data || []);
    } catch (error) {
      toast.error("Error fetching grades");
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await djangoAPI.getStudents();
      setStudents(data || []);
    } catch (error) {
      toast.error("Error fetching students");
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await djangoAPI.getSubjects();
      setSubjects(data || []);
    } catch (error) {
      toast.error("Error fetching subjects");
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await djangoAPI.getClasses();
      setClasses(data || []);
    } catch (error) {
      toast.error("Error fetching classes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const gradeData = {
        student: parseInt(formData.student),
        subject: parseInt(formData.subject),
        class_id: parseInt(formData.class_name_id),
        grade_value: parseFloat(formData.grade_value),
        max_grade: parseFloat(formData.max_grade),
        grade_type: formData.grade_type,
        title: formData.title,
        description: formData.description || null,
        graded_at: editingGrade ? editingGrade.graded_date : new Date().toISOString(),
      };

      if (editingGrade) {
        await djangoAPI.updateGrade(editingGrade.id, gradeData);
        toast.success("Grade updated successfully");
      } else {
        await djangoAPI.createGrade(gradeData);
        toast.success("Grade added successfully");
      }

      fetchGrades();
      resetForm();
    } catch (error) {
      toast.error(`Error ${editingGrade ? 'updating' : 'adding'} grade`);
    }
  };

  const resetForm = () => {
    setFormData({
      student: "",
      subject: "",
      class_name_id: "",
      grade_value: "",
      max_grade: "100",
      grade_type: "assignment",
      title: "",
      description: "",
    });
    setEditingGrade(null);
    setDialogOpen(false);
  };

  const handleEdit = (grade: DjangoGrade) => {
    setEditingGrade(grade);
    setFormData({
      student: grade.student.toString(),
      subject: grade.subject.toString(),
      class_name_id: grade.class_name_id.toString(),
      grade_value: grade.grade_value.toString(),
      max_grade: grade.max_grade.toString(),
      grade_type: grade.grade_type,
      title: grade.title,
      description: grade.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (gradeId: number) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await djangoAPI.deleteGrade(gradeId);
        toast.success("Grade deleted successfully");
        fetchGrades();
      } catch (error) {
        toast.error("Error deleting grade");
      }
    }
  };

  const getGradeColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 90) return "default";
    if (percentage >= 80) return "secondary";
    if (percentage >= 70) return "outline";
    return "destructive";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Grades</h2>
            <p className="text-muted-foreground">Manage student grades</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingGrade ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
                <DialogDescription>{editingGrade ? 'Update grade information' : 'Enter grade information'}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="student">Student</Label>
                    <select
                      id="student"
                      value={formData.student}
                      onChange={(e) =>
                        setFormData({ ...formData, student: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.student_id} - {student.first_name} {student.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class_name_id">Class</Label>
                    <select
                      id="class_name_id"
                      value={formData.class_name_id}
                      onChange={(e) =>
                        setFormData({ ...formData, class_name_id: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade_type">Grade Type</Label>
                    <select
                      id="grade_type"
                      value={formData.grade_type}
                      onChange={(e) =>
                        setFormData({ ...formData, grade_type: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="quiz">Quiz</option>
                      <option value="exam">Exam</option>
                      <option value="midterm">Midterm</option>
                      <option value="final">Final</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade_value">Grade Value</Label>
                    <Input
                      id="grade_value"
                      type="number"
                      step="0.01"
                      value={formData.grade_value}
                      onChange={(e) =>
                        setFormData({ ...formData, grade_value: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingGrade ? 'Update Grade' : 'Add Grade'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grade Records</CardTitle>
            <CardDescription>View and manage all grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, subject, or title..."
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
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No grades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">
                          {grade.student_name}
                        </TableCell>
                        <TableCell>{grade.subject_name}</TableCell>
                        <TableCell>{grade.class_name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{grade.title}</div>
                            {grade.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {grade.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{grade.grade_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <Badge variant={getGradeColor(grade.grade_value, grade.max_grade)}>
                              {grade.grade_value}/{grade.max_grade}
                            </Badge>
                            {grade.percentage && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {grade.percentage.toFixed(1)}%
                              </div>
                            )}
                            {grade.letter_grade && (
                              <div className="text-xs font-medium mt-1">
                                Grade: {grade.letter_grade}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(grade.graded_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(grade)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(grade.id)}
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

export default Grades;
