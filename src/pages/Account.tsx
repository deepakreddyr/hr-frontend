import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Shield, CreditCard, LogOut, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // ✅ Import toast

const Account = () => {
  const { toast } = useToast(); // ✅ Initialize toast

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    credits: 0
  });

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user-profile`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserData({
          name: data.name,
          email: data.email,
          organization: data.organization,
          role: data.role,
          credits: data.creds
        });
      } else {
        console.error(data.error || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password change requested', passwordForm);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/add-user`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addUserForm),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "✅ Success",
          description: data.message || "User added successfully!",
          variant: "default",
        });

        // Reset form
        setAddUserForm({
          name: '',
          email: '',
          password: '',
          role: ''
        });
      } else {
        toast({
          title: "❌ Failed",
          description: data.message || "Could not add user",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error adding user:", err);
      toast({
        title: "❌ Error",
        description: "Something went wrong while adding user.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = userData.role === 'admin' || userData.role === 'master';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3">
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 glow-primary animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="text-foreground font-medium">{userData.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-foreground font-medium">{userData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Organization</Label>
                <p className="text-foreground font-medium">{userData.organization}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="text-foreground font-medium">{userData.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-primary/20 rounded-lg border border-primary/30 hover:bg-primary/30 transition-colors">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-foreground">Credits Remaining: </span>
              <span className="text-primary font-bold text-lg">{userData.credits}</span>
            </div>
          </CardContent>
        </Card>

        {/* Add User Form (Admin only) */}
        {isAdmin &&
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Add New User</span>
              </CardTitle>
              <CardDescription>Create a new user for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={addUserForm.name}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button type="submit" className="w-full hover-glow">
                  Add User
                </Button>
              </form>
            </CardContent>
          </Card>
        }

        {/* Security Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security & Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Two-Factor Authentication</Label>
                <p className="text-muted-foreground text-sm">Add an extra layer of security to your account</p>
              </div>
              <Switch className="data-[state=checked]:bg-primary" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Email Notifications</Label>
                <p className="text-muted-foreground text-sm">Receive security alerts via email</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
            <Button variant="destructive" className="hover-glow">
              <LogOut className="w-4 h-4 mr-2" />
              Logout All Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
