import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Shield, CreditCard, LogOut } from 'lucide-react';

const Account = () => {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    organization: '',
    role: 'User',
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
          role: 'User',
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
    console.log('Password change requested');
  };

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

        {/* Change Password */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Change Password</span>
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>
              <Button type="submit" className="w-full hover-glow">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

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
