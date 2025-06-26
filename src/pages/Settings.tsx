
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Palette, Phone, Bell, Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    voiceGender: 'female',
    callSpeed: 'normal',
    reschedule: true,
    emailAlerts: true,
    weeklyReports: false,
    creditWarnings: true
  });

  const handleSave = () => {
    console.log('Settings saved:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 glow-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Dark Mode</Label>
                <p className="text-muted-foreground text-sm">Use dark theme across the application</p>
              </div>
              <Switch 
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Call Preferences */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Call Preferences</span>
            </CardTitle>
            <CardDescription>Configure AI call settings and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-foreground font-medium">Voice Gender</Label>
              <Select value={settings.voiceGender} onValueChange={(value) => setSettings(prev => ({ ...prev, voiceGender: value }))}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground font-medium">Call Speed</Label>
              <Select value={settings.callSpeed} onValueChange={(value) => setSettings(prev => ({ ...prev, callSpeed: value }))}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Re-schedule Missed Calls</Label>
                <p className="text-muted-foreground text-sm">Automatically reschedule failed calls</p>
              </div>
              <Switch 
                checked={settings.reschedule}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reschedule: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Manage how you receive updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Email Alerts</Label>
                  <p className="text-muted-foreground text-sm">Receive important notifications via email</p>
                </div>
                <Switch 
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailAlerts: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Weekly Reports</Label>
                  <p className="text-muted-foreground text-sm">Get weekly summaries of your activity</p>
                </div>
                <Switch 
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground font-medium">Credit Warnings</Label>
                  <p className="text-muted-foreground text-sm">Alert when credits are running low</p>
                </div>
                <Switch 
                  checked={settings.creditWarnings}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, creditWarnings: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
