import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  Download,
  Star,
  ArrowLeft,
  Clock,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming Tabs components are available

// --- Interface Definitions (Remain the same) ---
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

// Helper function to safely render data or "N/A"
const safeRender = (value: any, defaultValue: string = ''): string => {
    if (value === null || value === undefined || value === "") {
        return defaultValue;
    }
    return String(value);
};


const Transcript: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [activeCallId, setActiveCallId] = useState<string>('');

  const activeCallRecord = calls.find(call => String(call.id) === activeCallId);


  // --- UPDATED: Download Function ---
  const handleDownload = () => {
    if (!activeCallRecord || !candidate) return;

    const transcriptData = activeCallRecord.transcript || [];
    const callIndex = calls.findIndex(c => String(c.id) === activeCallId) + 1;
    const candidateName = candidate.name || 'Candidate';
    const fileName = `${candidateName.replace(/\s/g, '_')}_Call_${callIndex}_Transcript.txt`;

    // 1. Format the transcript text
    let fileContent = `--- Transcript for ${candidateName} (Call ${callIndex}) ---\n`;
    fileContent += `Date: ${safeRender(activeCallRecord.call.timestamp ? new Date(activeCallRecord.call.timestamp).toLocaleString() : null)}\n\n`;
    
    if (transcriptData.length === 0) {
        fileContent += "--- NO TRANSCRIPT DATA AVAILABLE ---\n";
    } else {
        const formattedTranscript = transcriptData.map(entry => 
            `${entry.speaker === 'ai' ? 'AI Recruiter' : candidateName}: ${entry.message}`
        ).join('\n');
        fileContent += formattedTranscript;
    }

    // 2. Create a Blob and URL for the file
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // 3. Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // 4. Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // -----------------------------


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
            // Set the latest call as active
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
    return <div className="text-center text-muted-foreground">Loading call history...</div>;
  }
  
  // ⭐️ FIX: Corrected Destructuring to handle null/undefined safely and maintain CallInfo type
  const activeCallData = activeCallRecord || ({} as CallRecord);

  const transcriptData: TranscriptEntry[] = activeCallData.transcript || [];
  const evaluationData: Evaluation = activeCallData.evaluation || {};
  const structuredData: StructuredData = activeCallData.structured || {};
  const callInfo: CallInfo = activeCallData.call || {} as CallInfo; // Explicitly type fallback

  const callSummary = callInfo.summary; 
  const callDuration = callInfo.duration;
  // ⭐️ END FIX


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
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
                Call History for {safeRender(candidate?.name, 'Unknown Candidate')}
            </h1>
            <p className="text-muted-foreground">Candidate ID: {candidateId} | Total Calls: {calls.length}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="border-accent/30 text-accent hover:bg-accent/10"
            onClick={handleDownload}
            disabled={calls.length === 0}
          >
            <Download className="w-4 h-4 mr-2" /> Download Active Transcript
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info Card - Always rendered */}
        <div className="lg:col-span-1">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
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
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{safeRender(candidate?.phone)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Active Call Duration: {safeRender(callDuration)} min
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
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                    style={{ width: `${candidate?.matchScore || 0}%` }}
                  />
                </div>
              </div>

              {/* Experience & Status */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Experience</span>
                  <span className="text-sm text-foreground">{safeRender(candidate?.totalExperience)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Relevant Experience</span>
                  <span className="text-sm text-foreground">{safeRender(candidate?.relevantExperience)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hiring Status</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    {safeRender(candidate?.hiringStatus, 'N/A')}
                  </span>
                </div>
              </div>

              {/* Structured Call Data - Always rendered */}
              <div className="pt-4 border-t border-border space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                    Structured Info (Call {calls.findIndex(c => String(c.id) === activeCallId) + 1})
                </h4>
                {Object.keys(structuredData).length > 0 ? (
                  Object.entries(structuredData).map(([key, value], i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                      <span className="text-foreground">{safeRender(value)}</span>
                    </div>
                  ))
                ) : (
                    <p className="text-sm text-muted-foreground italic">No structured data captured for this call.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Evaluation Card - Always rendered */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent" />
                <span>AI Evaluation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Candidate Match Score</span>
                  <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-400/20 text-green-400">
                    {safeRender(candidate?.matchScore, '0')}%
                  </span>
              </div>

              {/* Overall Candidate Summary */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Overall Candidate Summary</h4>
                <p className="text-sm text-foreground leading-relaxed">
                    {safeRender(candidate?.summary, 'No overall candidate summary available.')}
                </p>
              </div>
              
              {/* Call-Specific Summary (from active call's evaluation) */}
              {/* <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Call Evaluation Summary</h4>
                <p className="text-sm text-foreground leading-relaxed">
                    {safeRender(evaluationData.summary, 'No call-specific evaluation summary.')}
                </p>
              </div> */}


              {/* Strengths */}
              {/* <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Strengths</h4>
                {evaluationData.strengths && evaluationData.strengths.length > 0 ? (
                    <ul className="space-y-1">
                      {evaluationData.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-green-400 flex items-start">
                          <span className="w-1 h-1 rounded-full bg-green-400 mt-2 mr-2 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                ) : (
                    <p className="text-xs text-muted-foreground italic">N/A</p>
                )}
              </div> */}

              {/* Concerns */}
              {/* <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Concerns</h4>
                {evaluationData.concerns && evaluationData.concerns.length > 0 ? (
                  <ul className="space-y-1">
                    {evaluationData.concerns.map((c, i) => (
                      <li key={i} className="text-xs text-yellow-400 flex items-start">
                        <span className="w-1 h-1 rounded-full bg-yellow-400 mt-2 mr-2 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                    <p className="text-xs text-muted-foreground italic">N/A</p>
                )}
              </div> */}
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
                        <TabsList className="grid w-full grid-cols-4 md:grid-cols-6 lg:grid-cols-8 h-auto overflow-x-auto justify-start mb-4">
                            {calls.map((call, index) => (
                                <TabsTrigger 
                                    key={call.id} 
                                    value={String(call.id)} 
                                    className="text-xs p-2 whitespace-nowrap"
                                >
                                    Call {index + 1}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {calls.map((callRecord, index) => (
                            <TabsContent key={callRecord.id} value={String(callRecord.id)} className="mt-4">
                                <h3 className="text-lg font-semibold text-foreground mb-3">
                                    Transcript for Call {index + 1} 
                                    {callRecord.call.timestamp && (
                                        <span className="text-sm text-muted-foreground ml-3">
                                            - {new Date(callRecord.call.timestamp).toLocaleString()}
                                        </span>
                                    )}
                                </h3>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {/* Transcript Messages */}
                                    {callRecord.transcript.length > 0 ? (
                                        callRecord.transcript.map((entry, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${entry.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] p-3 rounded-lg ${
                                                        entry.speaker === 'ai'
                                                            ? 'bg-primary/10 border border-primary/20 text-foreground'
                                                            : 'bg-accent/10 border border-accent/20 text-foreground'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span
                                                            className={`text-xs font-medium ${
                                                                entry.speaker === 'ai' ? 'text-primary' : 'text-accent'
                                                            }`}
                                                        >
                                                            {entry.speaker === 'ai' ? 'Divya' : safeRender(candidate?.name)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{safeRender(entry.timestamp)}</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed">{safeRender(entry.message)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-secondary rounded-lg flex items-center space-x-2 text-muted-foreground">
                                            <AlertTriangle className="w-5 h-5" />
                                            <p>No transcript data available for this call.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <div className="p-4 bg-secondary rounded-lg flex items-center space-x-2 text-muted-foreground">
                        <AlertTriangle className="w-5 h-5" />
                        <p>No call records found for this candidate.</p>
                    </div>
                )}
            </CardContent>
          </Card>
          
          {/* Call Summary - Always rendered */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle>Call Summary (Call {calls.findIndex(c => String(c.id) === activeCallId) + 1})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {safeRender(callSummary, 'No summary available for the selected call.')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Transcript;