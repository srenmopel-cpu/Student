import { useEffect, useState } from "react";
import { djangoAPI } from "@/integrations/django/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Class {
  id: number;
  class_name: string;
  grade_level: string;
  section: string | null;
  academic_year: string;
  class_teacher: number | null;
  room_number: string | null;
  capacity: number;
  description: string | null;
  current_enrollment: number;
  available_seats: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    class_name: "",
    grade_level: "",
    section: "",
    academic_year: new Date().getFullYear().toString(),
    class_teacher: null as number | null,
    room_number: "",
    capacity: 30,
    description: "",
  });


  useEffect(() => {
    fetchClasses();
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = classes.filter(
      (cls) =>
        cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.grade_level.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  const fetchClasses = async () => {
    try {
      const response = await djangoAPI.getClasses();
      // Handle both paginated and direct array responses
      const classesData = Array.isArray(response) ? response : (response.results || []);
      setClasses(classesData);
    } catch (error) {
      toast.error("Error fetching classes");
      console.error("Error fetching classes:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await djangoAPI.getUsers();
      // Handle both paginated and direct array responses
      const usersData = Array.isArray(response) ? response : (response.results || []);
      setUsers(usersData);
    } catch (error) {
      toast.error("Error fetching users");
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    try {
      if (editingClass) {
        await djangoAPI.updateClass(editingClass.id, formData);
        toast.success("Class updated successfully");
      } else {
        await djangoAPI.createClass(formData);
        toast.success("Class created successfully");
      }
      fetchClasses();
      resetForm();
    } catch (error) {
      toast.error(editingClass ? "Error updating class" : "Error creating class");
      console.error("Error saving class:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      try {
        await djangoAPI.deleteClass(id);
        toast.success("Class deleted successfully");
        fetchClasses();
      } catch (error) {
        toast.error("Error deleting class");
        console.error("Error deleting class:", error);
      }
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      class_name: cls.class_name,
      grade_level: cls.grade_level,
      section: cls.section || "",
      academic_year: cls.academic_year,
      class_teacher: cls.class_teacher,
      room_number: cls.room_number || "",
      capacity: cls.capacity,
      description: cls.description || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      class_name: "",
      grade_level: "",
      section: "",
      academic_year: new Date().getFullYear().toString(),
      class_teacher: null,
      room_number: "",
      capacity: 30,
      description: "",
    });
    setEditingClass(null);
    setDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Classes</h2>
            <p className="text-muted-foreground">Manage class information</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? "Edit Class" : "Add New Class"}
                </DialogTitle>
                <DialogDescription>
                  {editingClass ? "Update class information" : "Create a new class"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class_name">Class Name</Label>
                  <Input
                    id="class_name"
                    value={formData.class_name}
                    onChange={(e) =>
                      setFormData({ ...formData, class_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Input
                    id="grade_level"
                    value={formData.grade_level}
                    onChange={(e) =>
                      setFormData({ ...formData, grade_level: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value.slice(0, 10) })
                    }
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Input
                    id="academic_year"
                    value={formData.academic_year}
                    onChange={(e) =>
                      setFormData({ ...formData, academic_year: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number</Label>
                  <Input
                    id="room_number"
                    value={formData.room_number}
                    onChange={(e) =>
                      setFormData({ ...formData, room_number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class_teacher">Class Teacher</Label>
                  <Select
                    value={formData.class_teacher?.toString() || "null"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class_teacher: value === "null" ? null : parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No teacher assigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.first_name} {user.last_name} ({user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClass ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Records</CardTitle>
            <CardDescription>View and manage all classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by class name or grade level..."
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
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No classes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.class_name}</TableCell>
                        <TableCell>{cls.grade_level}</TableCell>
                        <TableCell>{cls.section || "N/A"}</TableCell>
                        <TableCell>{cls.academic_year}</TableCell>
                        <TableCell>{cls.room_number || "N/A"}</TableCell>
                        <TableCell>{cls.capacity}</TableCell>
                        <TableCell>
                          {cls.class_teacher ? (
                            (() => {
                              const teacher = users.find(user => user.id === cls.class_teacher);
                              return teacher ? `${teacher.first_name} ${teacher.last_name}` : "N/A";
                            })()
                          ) : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cls)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cls.id)}
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

export default Classes;
