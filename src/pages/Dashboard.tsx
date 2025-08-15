import React, { useEffect, useState } from 'react';
import {
  Users, Search as SearchIcon, UserCheck, Phone, CreditCard, TrendingUp,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usageData, setUsageData] = useState([]);
  console.log(process.env.REACT_APP_API_URL);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        
        // FIXED: Properly configured fetch with credentials
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
          method: 'GET',
          credentials: 'include',  // This is crucial for sending cookies
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await res.json();
        
        if (res.ok) {
          setDashboardData(data);
          setUsageData(data.weekly_activity || []);
        } else {
          // Handle different types of errors
          if (res.status === 401) {
            setError("Session expired. Please login again.");
            // Optionally redirect to login page
            // window.location.href = '/login';
          } else {
            setError(data.error || "Failed to fetch dashboard data");
          }
          console.error("Error fetching dashboard data:", data.error);
        }
      } catch (error) {
        setError("Network error. Please check your connection.");
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Add a function to check session status (for debugging)
  const checkSession = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/session-check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      console.log("Session status:", data);
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Retry
        </button>
        {/* Debug button - remove in production */}
        <button 
          onClick={checkSession} 
          className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Check Session (Debug)
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-10 text-red-500">
        No dashboard data available.
      </div>
    );
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