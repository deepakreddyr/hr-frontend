
import React, { useState } from 'react';
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

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john@company.com',
    organization: 'Tech Corp',
    role: 'Admin',
    credits: 250
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password change requested');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 glow-primary">
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
            <div className="flex items-center space-x-2 p-3 bg-primary/20 rounded-lg border border-primary/30">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-foreground">Credits Remaining: </span>
              <span className="text-primary font-bold text-lg">{userData.credits}</span>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
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
                  className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:ring-primary focus:border-primary"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 glow-primary">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 lg:col-span-2">
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
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Email Notifications</Label>
                <p className="text-muted-foreground text-sm">Receive security alerts via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="destructive" className="hover:scale-105 transition-all duration-200">
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
