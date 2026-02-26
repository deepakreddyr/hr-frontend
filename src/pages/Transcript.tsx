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
  Hash,
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  Briefcase,
  Mail,
  Code,
  Zap,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AgentChecks {
  agent_1_summary?: string;
  agent_2_skills_gap?: {
    missing_critical?: string[];
    strong_matches?: string[];
  };
  agent_3_project_depth?: string;
  agent_4_recommendation?: {
    reasoning?: string;
    recommendation?: string;
  };
}

interface AnalysisReport {
  agent_checks?: AgentChecks;
  candidate_id?: string;
  candidate_name?: string;
  email?: string;
  phone?: string;
  experience_in_skills?: { [key: string]: string };
  overall_match_score?: number;
  relevant_experience_years?: string;
  scoring_tier?: string;
  special_highlights?: string[];
  strengths?: string[];
  total_work_experience_years?: string;
  weaknesses?: string[];
}

interface Candidate {
  name: string;
  phone: string | number;
  email: string;
  skills: string | string[];
  matchScore: number;
  callStatus: string;
  totalExperience: string;
  relevantExperience: string;
  summary: string;
  liked: boolean | null;
  hiringStatus: string | null;
  joinStatus: string | null;
  skillsExperience?: { [key: string]: string };
  analysisReport?: AnalysisReport;
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

const getScoreTierColor = (tier: string): string => {
  const tierLower = tier?.toLowerCase() || '';
  if (tierLower.includes('excellent') || tierLower.includes('outstanding')) return 'text-green-400 bg-green-400/20 border-green-400/30';
  if (tierLower.includes('good') || tierLower.includes('strong')) return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
  if (tierLower.includes('average') || tierLower.includes('moderate')) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
  return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
};

const getRecommendationColor = (recommendation: string): string => {
  const recLower = recommendation?.toLowerCase() || '';
  if (recLower.includes('hire') || recLower.includes('interview')) return 'text-green-400 bg-green-400/20 border-green-400/30';
  if (recLower.includes('consider') || recLower.includes('maybe')) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
  if (recLower.includes('reject') || recLower.includes('pass')) return 'text-red-400 bg-red-400/20 border-red-400/30';
  return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
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
      <div className="text-xs text-muted-foreground bg-secondary/50 rounded-md p-3 mt-2 font-mono overflow-x-auto border border-border/50">
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  }

  if (Array.isArray(value)) {
    // Check if items are long (longer than 50 chars) to switch from badges to list
    const hasLongItems = value.some(item => String(item).length > 50);

    if (hasLongItems) {
      return (
        <ul className="space-y-3 mt-2">
          {value.map((item, idx) => (
            <li key={idx} className="bg-secondary/40 hover:bg-secondary/60 transition-colors rounded-lg p-3 text-sm text-foreground leading-relaxed border border-border/50 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="min-w-1.5 min-h-1.5 w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{String(item)}</span>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item, idx) => (
          <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1 bg-secondary/20 hover:bg-secondary/40 transition-colors">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  const strValue = String(value);

  // Date detection
  if (strValue.match(/^\d{4}-\d{2}-\d{2}/) || strValue.includes('T')) {
    try {
      const date = new Date(strValue);
      if (!isNaN(date.getTime())) {
        return (
          <span className="text-foreground flex items-center gap-1.5 bg-secondary/20 px-2 py-0.5 rounded text-sm w-fit">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            {date.toLocaleString()}
          </span>
        );
      }
    } catch (e) { }
  }

  // Long string handling
  if (strValue.length > 60) {
    return (
      <div className="text-sm text-foreground bg-secondary/30 rounded-lg p-3 mt-1 leading-relaxed border border-border/50">
        {strValue}
      </div>
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
  const [activeTab, setActiveTab] = useState<string>('overview');

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  const activeCallData = activeCallRecord || ({} as CallRecord);
  const transcriptData: TranscriptEntry[] = activeCallData.transcript || [];
  const structuredData: StructuredData = activeCallData.structured || {};
  const callInfo: CallInfo = activeCallData.call || {} as CallInfo;
  const callSummary = callInfo.summary;
  const callDuration = callInfo.duration;

  const analysisReport = candidate?.analysisReport;
  const agentChecks = analysisReport?.agent_checks;
  const skillsArray = typeof candidate?.skills === 'string'
    ? candidate.skills.split(',').map(s => s.trim())
    : (candidate?.skills || []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-border hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {safeRender(candidate?.name, 'Unknown Candidate')}
            </h1>
            <p className="text-sm text-muted-foreground">
              Candidate ID: {candidateId} | Total Calls: {calls.length}
            </p>
          </div>
        </div>
        {calls.length > 0 && (
          <Button
            variant="outline"
            className="border-border text-accent hover:bg-accent/10 w-full md:w-auto"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" /> Download Transcript
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
          <TabsTrigger value="calls">Call History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className="lg:col-span-2 glass-card">

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 glass-card rounded-lg">
                    <div className="text-3xl font-bold text-foreground">
                      {candidate?.matchScore || 0}%
                    </div>
                    <div className="text-xs text-foreground font-medium mt-1">Match Score</div>
                  </div>
                  <div className="text-center p-4 glass-card rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {candidate?.totalExperience || 'N/A'}
                    </div>
                    <div className="text-xs text-foreground font-medium mt-1">Total Exp.</div>
                  </div>
                  <div className="text-center p-4 glass-card rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {candidate?.relevantExperience || 'N/A'}
                    </div>
                    <div className="text-xs text-foreground font-medium mt-1">Relevant Exp.</div>
                  </div>
                  <div className="text-center p-4 glass-card rounded-lg">
                    <Badge className="bg-foreground text-background border-none mb-1">
                      {analysisReport?.scoring_tier || 'N/A'}
                    </Badge>
                    <div className="text-xs text-foreground font-medium mt-2">Scoring Tier</div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="w-4 h-4 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{safeRender(candidate?.email)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{safeRender(candidate?.phone)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">Status: {safeRender(candidate?.callStatus, 'N/A')}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Candidate Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {safeRender(candidate?.summary || analysisReport?.agent_checks?.agent_1_summary,
                  'No summary available for this candidate.')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {agentChecks ? (
            <>
              {/* Recommendation */}
              {agentChecks.agent_4_recommendation && (
                <Card className="glass-card">

                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-400" />
                      AI Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">Decision:</span>
                      <Badge className={getRecommendationColor(agentChecks.agent_4_recommendation.recommendation || '')}>
                        {agentChecks.agent_4_recommendation.recommendation || 'N/A'}
                      </Badge>
                    </div>
                    {agentChecks.agent_4_recommendation.reasoning && (
                      <p className="text-sm text-foreground leading-relaxed mt-2 pl-0">
                        {agentChecks.agent_4_recommendation.reasoning}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills Assessment */}
              {agentChecks.agent_2_skills_gap && (
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-primary" />
                      Skills Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {agentChecks.agent_2_skills_gap.strong_matches && agentChecks.agent_2_skills_gap.strong_matches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <h4 className="text-sm font-semibold text-foreground">Strong Matches</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {agentChecks.agent_2_skills_gap.strong_matches.map((skill, idx) => (
                            <Badge key={idx} className="bg-green-400/20 text-green-400 border-green-400/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {agentChecks.agent_2_skills_gap.missing_critical && agentChecks.agent_2_skills_gap.missing_critical.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <h4 className="text-sm font-semibold text-foreground">Missing Critical Skills</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {agentChecks.agent_2_skills_gap.missing_critical.map((skill, idx) => (
                            <Badge key={idx} className="bg-red-400/20 text-red-400 border-red-400/30">
                              <XCircle className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Project Depth */}
              {agentChecks.agent_3_project_depth && (
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent" />
                      Project Depth Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">
                      {agentChecks.agent_3_project_depth}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisReport?.strengths && analysisReport.strengths.length > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisReport.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {analysisReport?.weaknesses && analysisReport.weaknesses.length > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisReport.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Special Highlights */}
              {analysisReport?.special_highlights && analysisReport.special_highlights.length > 0 && (
                <Card className="glass-card">

                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent" />
                      Special Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisReport.special_highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <Star className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mb-4" />
                  <p>No AI analysis report available for this candidate.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Skills & Experience Tab */}
        <TabsContent value="skills" className="space-y-6">
          {/* Skills List */}
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Technical Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skillsArray.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience in Skills */}
          {(candidate?.skillsExperience || analysisReport?.experience_in_skills) && (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent" />
                  Experience in Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(candidate?.skillsExperience || analysisReport?.experience_in_skills || {})
                    .sort(([, a], [, b]) => {
                      const parseExp = (exp: string) => {
                        const match = exp.match(/(\d+)\s*year/);
                        return match ? parseInt(match[1]) : 0;
                      };
                      return parseExp(String(b)) - parseExp(String(a));
                    })
                    .map(([skill, experience]) => (
                      <div key={skill} className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                        <div className="font-medium text-sm text-foreground mb-1">{skill}</div>
                        <div className="text-xs text-muted-foreground">{String(experience)}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Call History Tab */}
        <TabsContent value="calls" className="space-y-6">
          {calls.length > 0 ? (
            <>
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Call Transcripts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeCallId} onValueChange={setActiveCallId} className="w-full">
                    <div className="overflow-x-auto pb-2">
                      <TabsList className="inline-flex h-auto min-w-full justify-start mb-4">
                        {calls.map((call, index) => (
                          <TabsTrigger
                            key={call.id}
                            value={String(call.id)}
                            className="text-xs px-4 py-2 whitespace-nowrap"
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
                                  className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg shadow-sm ${entry.speaker === 'ai'
                                    ? 'bg-primary/10 border border-border text-foreground'
                                    : 'bg-accent/10 border border-border text-foreground'
                                    }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5 gap-2">
                                    <span
                                      className={`text-xs font-semibold ${entry.speaker === 'ai' ? 'text-primary' : 'text-white'
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
                </CardContent>
              </Card>

              {/* Structured Data for Active Call */}
              {Object.keys(structuredData).length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-accent" />
                      Structured Call Data (Call {calls.findIndex(c => String(c.id) === activeCallId) + 1})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(structuredData).map(([key, value], i) => (
                        <div key={i} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-1 h-3 bg-accent rounded-full" />
                            {formatStructuredKey(key)}
                          </div>
                          <div className="text-sm pl-3 border-l-2 border-border/30">
                            {renderStructuredValue(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Call Summary */}
              {callSummary && (
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Call Summary (Call {calls.findIndex(c => String(c.id) === activeCallId) + 1})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary/20 rounded-lg p-4 border border-border/40">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {callSummary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <p>No call records found for this candidate.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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