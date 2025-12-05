import React, { useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShinyText from "../components/ShinyText";
;
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store JWT tokens in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Store user info for easy access
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('role',data.user.role);
        console.log('Login successful:', data.message);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Handle login failure
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary animate-float">
            <Search className="w-8 h-8 text-white" />
          </div> */}
          <ShinyText 
            text="TheHireAI" 
            disabled={false} 
            speed={3} 
            className='text-4xl font-bold' 
          />
          
          <p className="text-muted-foreground"><ShinyText 
            text="AI-Powered HR Recruitment Platform" 
            disabled={false} 
            speed={3} 
            className='mt-5' 
          /></p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-primary/40 rounded-xl p-8 shadow-2xl glow-primary">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Welcome Back</h2>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a
                href="mailto:admin@example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Contact Administrator
              </a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary mb-1">AI</div>
            <div className="text-xs text-muted-foreground">Powered</div>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-accent mb-1">24/7</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 mb-1">Secure</div>
            <div className="text-xs text-muted-foreground">Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;