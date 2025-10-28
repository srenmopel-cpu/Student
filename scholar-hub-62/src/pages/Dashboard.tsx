import { useEffect, useState } from "react";
import { djangoAPI } from "@/integrations/django/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, Calendar, Award, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Stats {
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalAttendanceToday: number;
  totalGrades: number;
  totalAttendanceRecords: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalAttendanceToday: 0,
    totalGrades: 0,
    totalAttendanceRecords: 0,
  });
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total students
      const students = await djangoAPI.getStudents();
      const studentsCount = students.length;

      // Fetch total classes
      const classes = await djangoAPI.getClasses();
      const classesCount = classes.length;

      // Fetch total subjects
      const subjects = await djangoAPI.getSubjects();
      const subjectsCount = subjects.length;

      // Fetch today's attendance
      const today = new Date().toISOString().split("T")[0];
      const attendanceRecords = await djangoAPI.getAttendance({ date: today });
      const attendanceCount = attendanceRecords.filter(record => record.status === "present").length;

      // Fetch total grades
      const allGrades = await djangoAPI.getGrades();
      const gradesCount = allGrades ? allGrades.length : 0;

      // Fetch total attendance records
      const allAttendanceRecordsTotal = await djangoAPI.getAttendance();
      const attendanceRecordsCount = allAttendanceRecordsTotal ? allAttendanceRecordsTotal.length : 0;

      setStats({
        totalStudents: studentsCount,
        totalClasses: classesCount,
        totalSubjects: subjectsCount,
        totalAttendanceToday: attendanceCount,
        totalGrades: gradesCount,
        totalAttendanceRecords: attendanceRecordsCount,
      });

      // Fetch grade distribution
      const grades = allGrades;

      if (grades) {
        const distribution = {
          "A (90-100)": 0,
          "B (80-89)": 0,
          "C (70-79)": 0,
          "D (60-69)": 0,
          "F (0-59)": 0,
        };

        grades.forEach((grade) => {
          const value = parseFloat(String(grade.grade_value));
          if (value >= 90) distribution["A (90-100)"]++;
          else if (value >= 80) distribution["B (80-89)"]++;
          else if (value >= 70) distribution["C (70-79)"]++;
          else if (value >= 60) distribution["D (60-69)"]++;
          else distribution["F (0-59)"]++;
        });

        setGradeDistribution(
          Object.entries(distribution).map(([name, value]) => ({ name, value }))
        );
      }

      // Fetch attendance data for the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const allAttendanceRecords = allAttendanceRecordsTotal.filter(record => record.date >= sevenDaysAgo);

      if (allAttendanceRecords) {
        const attendanceMap = new Map();
        allAttendanceRecords.forEach((record) => {
          const date = record.date;
          if (!attendanceMap.has(date)) {
            attendanceMap.set(date, { date, present: 0, absent: 0, late: 0 });
          }
          const entry = attendanceMap.get(date);
          if (record.status === "present") entry.present++;
          else if (record.status === "absent") entry.absent++;
          else if (record.status === "late") entry.late++;
        });

        setAttendanceData(Array.from(attendanceMap.values()).slice(-7));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--destructive))"];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your student management system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <GraduationCap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">Available subjects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Calendar className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttendanceToday}</div>
              <p className="text-xs text-muted-foreground">Students present</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
              <Award className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGrades}</div>
              <p className="text-xs text-muted-foreground">Grade records</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
              <BarChart3 className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttendanceRecords}</div>
              <p className="text-xs text-muted-foreground">Attendance records</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="hsl(var(--success))" />
                  <Bar dataKey="absent" fill="hsl(var(--destructive))" />
                  <Bar dataKey="late" fill="hsl(var(--warning))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
