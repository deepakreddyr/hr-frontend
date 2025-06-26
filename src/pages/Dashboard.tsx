import React, { useEffect, useState } from 'react';
import {
  Users, Search as SearchIcon, UserCheck, Phone, CreditCard, TrendingUp,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setDashboardData(data);
          setUsageData(data.weekly_activity || []);
        } else {
          console.error("Error fetching dashboard data:", data.error);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center py-10 text-red-500">Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {dashboardData.user_name}!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Credits Used</p>
          <p className="text-2xl font-bold text-primary">{dashboardData.creds_used}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Candidates Searched"
          value={dashboardData.todays_candidates || 0}
          icon={Users}
          trend="+12%"
          color="primary"
        />
        <MetricCard
          title="Searches Made"
          value={dashboardData.todays_searches || 0}
          icon={SearchIcon}
          trend="+8%"
          color="accent"
        />
        <MetricCard
          title="Joinees Achieved"
          value={dashboardData.new_joinees || 0}
          icon={UserCheck}
          trend="+15%"
          color="success"
        />
        <MetricCard
          title="Calls Made"
          value={dashboardData.people_called ?? "--"}
          icon={Phone}
          trend="+25%"
          color="warning"
        />
        <MetricCard
          title="Credits Used"
          value={dashboardData.creds_used || 0}
          icon={CreditCard}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Usage Trends */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Weekly Usage Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="searches"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Joinees per day */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Daily Activity (Joinees)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="joinees" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chatbot Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">AI Assistant</h3>
        <div className="bg-secondary/30 border border-dashed border-primary/30 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
            <SearchIcon className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-lg font-medium text-foreground mb-2">Chat with RecruiterAI</h4>
          <p className="text-muted-foreground mb-4">Get instant help with your recruitment tasks</p>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors">
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
