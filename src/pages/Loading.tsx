import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, BarChart3, Users, Zap } from 'lucide-react';

const Loading = () => {
  const [loadingText, setLoadingText] = useState('Analyzing resumes...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const texts = [
      'Analyzing resumes...',
      'Matching skills and experience...',
      'Calculating compatibility scores...',
      'Preparing candidate profiles...',
      'Almost ready...'
    ];

    let currentIndex = 0;

    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 300);

    // ✅ First: Trigger backend processing
    const startProcessing = async () => {
      try {
        await fetch(`${REACT_APP_API_URL}/api/loading`, {
          method: 'GET',
          credentials: 'include',
        });
      } catch (err) {
        console.error('Error triggering processing:', err);
      }
    };

    // ✅ Poll until processing is done
    const checkAndRedirect = async () => {
      try {
        const res = await fetch('${REACT_APP_API_URL}/api/check-processing', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();

        if (res.ok && data.processed) {
          clearInterval(textInterval);
          clearInterval(progressInterval);
          clearInterval(pollInterval);
          clearTimeout(errorTimeout);

          const searchId = data.search_id || data.searchID || data.id;
          if (searchId) {
            navigate(`/results/${searchId}`);
          } else {
            navigate('/results');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // ⏯ Start everything
    startProcessing();
    const pollInterval = setInterval(checkAndRedirect, 2000);

    const errorTimeout = setTimeout(() => {
      setLoadingText('Something went wrong. Please refresh or try again.');
      setError(true);
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearInterval(pollInterval);
    }, 20000);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearInterval(pollInterval);
      clearTimeout(errorTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-8 max-w-md mx-auto">
        {/* Bot & Animations */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse-glow"></div>
            <div className="relative w-full h-full bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-border/50">
              <Bot className="w-12 h-12 text-primary animate-bounce-gentle" />
            </div>
          </div>
          <div className="absolute -top-4 -left-8 animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
            <BarChart3 className="w-6 h-6 text-primary/60" />
          </div>
          <div className="absolute -top-2 -right-6 animate-bounce-gentle" style={{ animationDelay: '1s' }}>
            <Users className="w-5 h-5 text-accent/60" />
          </div>
          <div className="absolute -bottom-2 -left-6 animate-bounce-gentle" style={{ animationDelay: '1.5s' }}>
            <Zap className="w-4 h-4 text-primary/60" />
          </div>
        </div>

        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground animate-fade-in">
            Please wait while we analyze and load your candidates...
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            This may take a few seconds depending on the number of resumes.
          </p>
        </div>

        {/* Loading Text */}
        <div className="h-8 flex items-center justify-center">
          <p className="text-primary font-medium text-lg animate-fade-in-slow">
            {loadingText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Processing... {Math.round(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mt-4">
            Something went wrong. Please refresh the page and try again.
          </p>
        )}

        {/* Pulsing Dots */}
        <div className="flex justify-center space-x-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
