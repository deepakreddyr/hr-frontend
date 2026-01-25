import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  Download,
  Star,
  ArrowLeft,
  Clock,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Candidate {
  name: string;
  phone: string;
  email: string;
  skills: string[];
  matchScore: number;
  callStatus: string;
  totalExperience: string;
  relevantExperience: string;
  summary: string;
  liked: boolean;
  hiringStatus: string;
  joinStatus: string;
}

interface TranscriptEntry {
  speaker: 'ai' | 'candidate';
  message: string;
  timestamp: string;
}

interface Evaluation {
  score?: number;
  strengths?: string[];
  concerns?: string[];
  summary?: string;
}

interface StructuredData {
  [key: string]: any;
}

interface CallInfo {
  id: number;
  duration?: string;
  status?: string;
  summary?: string;
  timestamp?: string;
}

interface CallRecord {
  id: number;
  transcript: TranscriptEntry[];
  evaluation: Evaluation;
  structured: StructuredData;
  call: CallInfo;
}

const safeRender = (value: any, defaultValue: string = ''): string => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  return String(value);
};

const formatStructuredKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const renderStructuredValue = (value: any): JSX.Element => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">N/A</span>;
  }
  
  if (typeof value === 'boolean') {
    return value ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" /> Yes
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <XCircle className="w-3 h-3 mr-1" /> No
      </Badge>
    );
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <div className="text-xs text-muted-foreground bg-secondary/50 rounded p-2 mt-1 font-mono">
        {JSON.stringify(value, null, 2)}
      </div>
    );
  }
  
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {value.map((item, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }
  
  const strValue = String(value);
  
  // Check if it's a date
  if (strValue.match(/^\d{4}-\d{2}-\d{2}/) || strValue.includes('T')) {
    try {
      const date = new Date(strValue);
      if (!isNaN(date.getTime())) {
        return (
          <span className="text-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date.toLocaleString()}
          </span>
        );
      }
    } catch (e) {}
  }
  
  // Long text
  if (strValue.length > 50) {
    return (
      <p className="text-sm text-foreground bg-secondary/30 rounded p-2 mt-1 leading-relaxed">
        {strValue}
      </p>
    );
  }
  
  return <span className="text-foreground font-medium">{strValue}</span>;
};

const Transcript: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [activeCallId, setActiveCallId] = useState<string>('');

  const activeCallRecord = calls.find(call => String(call.id) === activeCallId);

  const handleDownload = () => {
    if (!activeCallRecord || !candidate) return;

    const transcriptData = activeCallRecord.transcript || [];
    const callIndex = calls.findIndex(c => String(c.id) === activeCallId) + 1;
    const candidateName = candidate.name || 'Candidate';
    const fileName = `${candidateName.replace(/\s/g, '_')}_Call_${callIndex}_Transcript.txt`;

    let fileContent = `--- Transcript for ${candidateName} (Call ${callIndex}) ---\n`;
    fileContent += `Date: ${safeRender(activeCallRecord.call.timestamp ? new Date(activeCallRecord.call.timestamp).toLocaleString() : null)}\n\n`;
    
    if (transcriptData.length === 0) {
      fileContent += "--- NO TRANSCRIPT DATA AVAILABLE ---\n";
    } else {
      const formattedTranscript = transcriptData.map(entry => 
        `${entry.speaker === 'ai' ? 'AI Recruiter' : candidateName}: ${entry.message}`
      ).join('\n\n');
      fileContent += formattedTranscript;
    }

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchTranscriptData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transcript/${candidateId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error('Failed to fetch transcript data');

        const data = await res.json();

        setCandidate(data.candidate);
        setCalls(data.calls || []);
        
        if (data.calls && data.calls.length > 0) {
          setActiveCallId(String(data.calls[data.calls.length - 1].id));
        }

      } catch (err) {
        console.error('Failed to load transcript:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptData();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading call history...</p>
        </div>
      </div>
    );
  }

  const activeCallData = activeCallRecord || ({} as CallRecord);
  const transcriptData: TranscriptEntry[] = activeCallData.transcript || [];
  const evaluationData: Evaluation = activeCallData.evaluation || {};
  const structuredData: StructuredData = activeCallData.structured || {};
  const callInfo: CallInfo = activeCallData.call || {} as CallInfo;
  const callSummary = callInfo.summary;
  const callDuration = callInfo.duration;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-primary/30 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Call History for {safeRender(candidate?.name, 'Unknown Candidate')}
            </h1>
            <p className="text-sm text-muted-foreground">
              Candidate ID: {candidateId} | Total Calls: {calls.length}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="border-accent/30 text-accent hover:bg-accent/10 w-full md:w-auto"
          onClick={handleDownload}
          disabled={calls.length === 0}
        >
          <Download className="w-4 h-4 mr-2" /> Download Transcript
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {candidate?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <div>
                  <span className="text-lg">{safeRender(candidate?.name)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{safeRender(candidate?.phone)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">
                    Active Call: {safeRender(callDuration, 'N/A')} min
                  </span>
                </div>
              </div>

              {/* Match Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Match Score</span>
                  <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-400/20 text-green-400">
                    {safeRender(candidate?.matchScore, '0')}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                    style={{ width: `${candidate?.matchScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Experience & Status */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm text-muted-foreground">Total Experience</span>
                  <span className="text-sm text-foreground text-right">{safeRender(candidate?.totalExperience)}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm text-muted-foreground">Relevant Experience</span>
                  <span className="text-sm text-foreground text-right">{safeRender(candidate?.relevantExperience)}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hiring Status</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {safeRender(candidate?.hiringStatus, 'N/A')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structured Data Card - Enhanced */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Hash className="w-4 h-4 text-accent" />
                <span>Structured Info (Call {calls.findIndex(c => String(c.id) === activeCallId) + 1})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(structuredData).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(structuredData).map(([key, value], i) => (
                    <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                        {formatStructuredKey(key)}
                      </div>
                      <div className="text-sm">
                        {renderStructuredValue(value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground py-4">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm italic">No structured data for this call.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Evaluation Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Star className="w-4 h-4 text-accent" />
                <span>AI Evaluation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Match Score</span>
                <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-400/20 text-green-400">
                  {safeRender(candidate?.matchScore, '0')}%
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Candidate Summary</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {safeRender(candidate?.summary, 'No overall candidate summary available.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call History/Transcript Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Call History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calls.length > 0 ? (
                <Tabs value={activeCallId} onValueChange={setActiveCallId} className="w-full">
                  <div className="overflow-x-auto pb-2">
                    <TabsList className="inline-flex h-auto min-w-full justify-start mb-4">
                      {calls.map((call, index) => (
                        <TabsTrigger 
                          key={call.id} 
                          value={String(call.id)} 
                          className="text-xs px-4 py-2 whitespace-nowrap data-[state=active]:bg-primary/20"
                        >
                          Call {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {calls.map((callRecord, index) => (
                    <TabsContent key={callRecord.id} value={String(callRecord.id)} className="mt-4">
                      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          Transcript for Call {index + 1}
                        </h3>
                        {callRecord.call.timestamp && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(callRecord.call.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {callRecord.transcript.length > 0 ? (
                          callRecord.transcript.map((entry, idx) => (
                            <div
                              key={idx}
                              className={`flex ${entry.speaker === 'ai' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                            >
                              <div
                                className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg shadow-sm ${
                                  entry.speaker === 'ai'
                                    ? 'bg-primary/10 border border-primary/20 text-foreground'
                                    : 'bg-accent/10 border border-accent/20 text-foreground'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5 gap-2">
                                  <span
                                    className={`text-xs font-semibold ${
                                      entry.speaker === 'ai' ? 'text-primary' : 'text-accent'
                                    }`}
                                  >
                                    {entry.speaker === 'ai' ? 'Divya' : safeRender(candidate?.name)}
                                  </span>
                                  {entry.timestamp && (
                                    <span className="text-xs text-muted-foreground">
                                      {safeRender(entry.timestamp)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {safeRender(entry.message)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 bg-secondary/50 rounded-lg flex items-center justify-center space-x-2 text-muted-foreground">
                            <AlertTriangle className="w-5 h-5" />
                            <p>No transcript data available for this call.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="p-6 bg-secondary/50 rounded-lg flex items-center justify-center space-x-2 text-muted-foreground">
                  <AlertTriangle className="w-5 h-5" />
                  <p>No call records found for this candidate.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Summary */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="text-base">
                Call Summary (Call {calls.findIndex(c => String(c.id) === activeCallId) + 1})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {safeRender(callSummary, 'No summary available for the selected call.')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.7);
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Transcript;