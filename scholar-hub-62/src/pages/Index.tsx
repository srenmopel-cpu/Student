import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Student Management System
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Streamline your educational institution with powerful tools for managing students, classes, grades, and attendance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:max-w-5xl">
            <div className="flex flex-col items-center space-y-3 rounded-lg bg-card p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Student Management</h3>
              <p className="text-sm text-muted-foreground">
                Efficiently manage student records, enrollment, and information in one place
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 rounded-lg bg-card p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Class & Subject Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Organize classes, subjects, and teacher assignments with ease
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 rounded-lg bg-card p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track grades, attendance, and generate insights with powerful analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
