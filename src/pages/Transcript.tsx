
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Download, Star, UserCheck, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Transcript = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  // Mock data
  const candidate = {
    id: candidateId,
    name: 'Alex Rodriguez',
    phone: '+1 (555) 123-4567',
    email: 'alex.rodriguez@email.com',
    matchScore: 95,
    callStatus: 'completed',
    callDuration: '12:34',
    totalExperience: '5 years',
    relevantExperience: '4 years'
  };

  const transcript = [
    {
      speaker: 'ai',
      timestamp: '00:00',
      message: 'Hello Alex! Thank you for taking the time to speak with me today. I\'m an AI recruiter from TechCorp. How are you doing?'
    },
    {
      speaker: 'candidate',
      timestamp: '00:15',
      message: 'Hi! I\'m doing well, thank you. I\'m excited to learn more about the opportunity.'
    },
    {
      speaker: 'ai',
      timestamp: '00:25',
      message: 'Great! I\'d like to start by understanding your experience with React and TypeScript. Can you tell me about your most recent project using these technologies?'
    },
    {
      speaker: 'candidate',
      timestamp: '00:45',
      message: 'Absolutely! In my current role at DevCorp, I\'ve been leading a team of 4 developers on a large-scale e-commerce platform built with React 18 and TypeScript. We\'ve implemented advanced features like real-time inventory updates, dynamic pricing, and a sophisticated checkout system.'
    },
    {
      speaker: 'ai',
      timestamp: '01:15',
      message: 'That sounds impressive! How did you handle state management in such a complex application?'
    },
    {
      speaker: 'candidate',
      timestamp: '01:30',
      message: 'We used Redux Toolkit for global state management, combined with React Query for server state. This gave us excellent performance and made our code much more maintainable. We also implemented custom hooks for reusable logic.'
    },
    {
      speaker: 'ai',
      timestamp: '02:00',
      message: 'Excellent! What about testing? How do you ensure code quality in your projects?'
    },
    {
      speaker: 'candidate',
      timestamp: '02:15',
      message: 'Testing is crucial in our workflow. We use Jest and React Testing Library for unit and integration tests, with Cypress for end-to-end testing. We maintain 90%+ code coverage and have automated tests running on every PR.'
    }
  ];

  const evaluation = {
    summary: 'Alex demonstrates strong technical expertise in React and TypeScript with excellent leadership experience. Shows deep understanding of modern development practices including state management, testing, and team collaboration. Highly suitable for senior developer roles.',
    score: 95,
    strengths: [
      'Strong React/TypeScript experience (4+ years)',
      'Leadership and mentoring skills',
      'Excellent testing practices',
      'Modern development workflow knowledge'
    ],
    concerns: [
      'May be overqualified for mid-level positions',
      'Salary expectations might be high'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-primary/30 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Call Transcript</h1>
            <p className="text-muted-foreground">Candidate ID: {candidateId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Transcript
          </Button>
          <Button className="bg-primary hover:bg-primary/90 glow-primary">
            <UserCheck className="w-4 h-4 mr-2" />
            Mark as Final Select
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="lg:col-span-1">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="text-lg">{candidate.name}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{candidate.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Duration: {candidate.callDuration}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Match Score</span>
                  <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-400/20 text-green-400">
                    {candidate.matchScore}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                    style={{ width: `${candidate.matchScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Experience</span>
                  <span className="text-sm text-foreground">{candidate.totalExperience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Relevant Experience</span>
                  <span className="text-sm text-foreground">{candidate.relevantExperience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Call Status</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-400/20 text-green-400">
                    {candidate.callStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Summary */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent" />
                <span>AI Evaluation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Score</span>
                  <span className="text-2xl font-bold text-accent">{evaluation.score}/100</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index} className="text-xs text-green-400 flex items-start">
                      <span className="w-1 h-1 rounded-full bg-green-400 mt-2 mr-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Concerns</h4>
                <ul className="space-y-1">
                  {evaluation.concerns.map((concern, index) => (
                    <li key={index} className="text-xs text-yellow-400 flex items-start">
                      <span className="w-1 h-1 rounded-full bg-yellow-400 mt-2 mr-2 flex-shrink-0" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcript */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Conversation Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {transcript.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex ${entry.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        entry.speaker === 'ai'
                          ? 'bg-primary/20 border border-primary/30 text-foreground'
                          : 'bg-accent/20 border border-accent/30 text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${
                          entry.speaker === 'ai' ? 'text-primary' : 'text-accent'
                        }`}>
                          {entry.speaker === 'ai' ? 'AI Recruiter' : candidate.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{entry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20 mt-6">
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{evaluation.summary}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Transcript;
