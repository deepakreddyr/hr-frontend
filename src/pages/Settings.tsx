import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  Save,
  Moon,
  Sun,
  // Phone // uncomment if you want to restore call prefs
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();

  const [settings, setSettings] = useState({
    emailAlerts: true,
    weeklyReports: false,
    creditWarnings: true,
    // Optional call prefs - currently commented
    // voiceGender: 'female',
    // callSpeed: 'normal',
    // reschedule: true
  });

  // Fetch settings on load
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/settings`, { withCredentials: true })
      .then(res => {
        const data = res.data;
        setSettings({
          emailAlerts: data.emailAlerts,
          weeklyReports: data.weeklyReports,
          creditWarnings: data.creditWarnings
        });

        if (data.darkTheme !== isDark) toggleTheme();
      })
      .catch(err => console.error("Failed to fetch settings:", err));
  }, []);

  // Save settings
  const handleSave = () => {
    axios.post(`${import.meta.env.VITE_API_URL}/api/settings`, {
      ...settings,
      darkTheme: isDark
    }, { withCredentials: true })
      .then(() => console.log("Settings saved"))
      .catch(err => console.error("Failed to save settings:", err));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
        <Button onClick={handleSave} className="hover-glow">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                <div>
                  <Label className="text-foreground font-medium">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Label>
                  <p className="text-muted-foreground text-sm">Toggle between dark and light theme</p>
                </div>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/*
        // Uncomment this block if you want to restore Call Preferences

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
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
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
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
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
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
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
        */}

        {/* Notification Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
                  className="data-[state=checked]:bg-primary"
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
                  className="data-[state=checked]:bg-primary"
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
                  className="data-[state=checked]:bg-primary"
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
