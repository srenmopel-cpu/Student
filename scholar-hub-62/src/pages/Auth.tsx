import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { djangoAuth, LoginCredentials, RegisterData } from "@/integrations/django/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupDateOfBirth, setSignupDateOfBirth] = useState("");
  const [signupGender, setSignupGender] = useState<'M' | 'F' | 'O'>('M');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await djangoAuth.login({
        username: loginEmail, // Using email as username for login
        password: loginPassword,
      });

      // Store tokens
      djangoAuth.setTokens(response.tokens);

      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupEmail || !signupPassword || !signupFullName || !signupDateOfBirth || !signupGender) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Split full name into first and last name
      const nameParts = signupFullName.trim().split(' ');
      const firstName = String(nameParts[0] || '');
      const lastName = String(nameParts.slice(1).join(' ') || '');

      console.log('Name parsing:', { signupFullName, nameParts, firstName, lastName, lastNameType: typeof lastName });

      const registrationData = {
        username: signupEmail, // Using email as username
        email: signupEmail,
        password: signupPassword,
        password_confirm: signupPassword,
        first_name: firstName,
        last_name: lastName,
        student_id: `STU${Date.now()}`, // Generate a student ID
        date_of_birth: signupDateOfBirth,
        gender: signupGender,
      };

      console.log('Final registration data:', registrationData);
      console.log('Data types:', {
        username: typeof registrationData.username,
        email: typeof registrationData.email,
        first_name: typeof registrationData.first_name,
        last_name: typeof registrationData.last_name,
        student_id: typeof registrationData.student_id,
        date_of_birth: typeof registrationData.date_of_birth,
        gender: typeof registrationData.gender,
      });

      const response = await djangoAuth.register(registrationData);

      console.log('Registration successful:', response);

      // Store tokens
      djangoAuth.setTokens(response.tokens);

      toast.success("Account created! You can now log in.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Student Management System</CardTitle>
            <CardDescription>Manage students, classes, grades, and attendance</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-dob">Date of Birth</Label>
                  <Input
                    id="signup-dob"
                    type="date"
                    value={signupDateOfBirth}
                    onChange={(e) => setSignupDateOfBirth(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gender">Gender</Label>
                  <Select value={signupGender} onValueChange={(value: 'M' | 'F' | 'O') => setSignupGender(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
