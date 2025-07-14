import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, Download, Star, UserCheck, ArrowLeft, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Transcript = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [callSummary, setCallSummary] = useState('');
  const [candidate, setCandidate] = useState<any>(null);
  const [transcript, setTranscript] = useState([]);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [structuredData, setStructuredData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranscriptData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/transcript/${candidateId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        setTranscript(data.transcript || []);
        setCandidate(data.candidate || {});
        setEvaluation(data.evaluation || {});
        setStructuredData(data.structured || {}); // ✅ FIXED here
        setCallSummary(data.call?.summary || '');
      } catch (err) {
        console.error('Failed to load transcript:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptData();
  }, [candidateId]);

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading transcript...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-primary/30 hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Call Transcript</h1>
            <p className="text-muted-foreground">Candidate ID: {candidateId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
            <Download className="w-4 h-4 mr-2" /> Download Transcript
          </Button>
          {/* <Button className="bg-primary hover:bg-primary/90 glow-primary">
            <UserCheck className="w-4 h-4 mr-2" /> Mark as Final Select
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="lg:col-span-1">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                  {candidate.name?.split(' ').map(n => n[0]).join('')}
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
                  <span className="text-sm text-foreground">Duration: {candidate.callDuration || 'N/A'}</span>
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
                    {candidate.callStatus ? candidate.callStatus : 'Not Called'}
                  </span>
                </div>
              </div>

              {/* Structured Call Data */}
              <div className="pt-4 border-t border-border space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Structured Info</h4>
                {Object.entries(structuredData).map(([key, value], i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                    <span className="text-foreground">
                      {value !== null && value !== undefined && value !== "" ? String(value) : "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Summary */}
          {/* {evaluation && (
            <Card className="bg-card/50 backdrop-blur-sm border-accent/20 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-accent" />
                  <span>AI Evaluation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Score</span>
                  <span className="text-2xl font-bold text-accent">{evaluation.score}/100</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {evaluation.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-green-400 flex items-start">
                        <span className="w-1 h-1 rounded-full bg-green-400 mt-2 mr-2 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Concerns</h4>
                  <ul className="space-y-1">
                    {evaluation.concerns?.map((c: string, i: number) => (
                      <li key={i} className="text-xs text-yellow-400 flex items-start">
                        <span className="w-1 h-1 rounded-full bg-yellow-400 mt-2 mr-2 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>

        {/* Transcript Section */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Conversation Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {transcript.map((entry: any, index: number) => (
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
                        <span
                          className={`text-xs font-medium ${
                            entry.speaker === 'ai' ? 'text-primary' : 'text-accent'
                          }`}
                        >
                          {entry.speaker === 'ai' ? 'AI Recruiter' : candidate.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
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
              <CardTitle>Call Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{callSummary || 'No summary available.'}</p> {/* ✅ CHANGED */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Transcript;
