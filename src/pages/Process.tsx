import React, { useState, useEffect } from 'react';
import {
  Upload, Sparkles, CheckCircle, Circle, BarChart3, Users, Zap, X, FileText, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, useParams } from 'react-router-dom';

// Processing Loader Component
const ProcessingLoader = ({ searchId }: { searchId: string }) => {
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

    const startProcessing = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/process-candidates/${searchId}`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error('Error starting processing:', err);
      }
    };

    const checkAndRedirect = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/check-processing/${searchId}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (res.ok && data.processed) {
          clearInterval(textInterval);
          clearInterval(progressInterval);
          clearInterval(pollInterval);
          clearTimeout(errorTimeout);

          if (data.status === 'results') {
            navigate(`/results/${searchId}`);
          } else if (data.status === 'error') {
            setError(true);
            setLoadingText('Processing failed. Please try again.');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    startProcessing();
    const pollInterval = setInterval(checkAndRedirect, 2000);

    const errorTimeout = setTimeout(() => {
      setLoadingText('Processing is taking longer than expected. Please wait...');
      setError(true);
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearInterval(pollInterval);
    }, 60000); // Increased to 60 seconds for larger datasets

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearInterval(pollInterval);
      clearTimeout(errorTimeout);
    };
  }, [navigate, searchId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-8 max-w-md mx-auto">
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/20">
              <Sparkles className="w-12 h-12 text-primary animate-bounce" />
            </div>
          </div>
          <div className="absolute -top-4 -left-8 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
            <BarChart3 className="w-6 h-6 text-primary/60" />
          </div>
          <div className="absolute -top-2 -right-6 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}>
            <Users className="w-5 h-5 text-primary/60" />
          </div>
          <div className="absolute -bottom-2 -left-6 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2s' }}>
            <Zap className="w-4 h-4 text-primary/60" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Processing Your Candidates
          </h1>
          <p className="text-muted-foreground text-lg">
            Please wait while we analyze all resumes and match them with your job requirements.
          </p>
        </div>

        <div className="h-8 flex items-center justify-center">
          <p className="text-primary font-medium text-lg">
            {loadingText}
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {Math.round(Math.min(progress, 100))}% complete
          </p>
        </div>

        {error && (
          <div className="space-y-2">
            <p className="text-red-500 text-sm">
              {loadingText}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs"
            >
              Return to Dashboard
            </Button>
          </div>
        )}

        <div className="flex justify-center space-x-2">
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

// Main Process Component
const Process = () => {
  const [formData, setFormData] = useState({
    bulkResumeData: '',
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLast, setIsLast] = useState(false);
  const [submitted, setSubmitted] = useState(0);
  const [target, setTarget] = useState(0);
  const [currentCandidate, setCurrentCandidate] = useState<{ index: number; name: string; email: string } | null>(null);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [oldCandidateCount, setOldCandidateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();
  const { searchId } = useParams();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process/${searchId}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        console.log('Initial data:', data);

        if (data.success) {
          setSubmitted(data.submitted || 0);
          setTarget(data.target || 0);
          setCurrentCandidate(data.candidate || null);
          setIsLast(data.isLast || false);
          setOldCandidateCount(data.old_candidate_count || 0);
          setAllCandidates(data.shortlisted || []);
        } else {
          alert(data.error || 'Failed to fetch initial data');
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        alert('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    };

    if (searchId) {
      fetchInitialData();
    }
  }, [searchId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['text/csv', 'application/pdf', 'text/plain'];
    const isValid = validTypes.includes(file.type) || 
                    file.name.endsWith('.csv') || 
                    file.name.endsWith('.pdf') || 
                    file.name.endsWith('.txt');
    
    if (isValid) {
      setUploadedFile(file);
      setFormData({ bulkResumeData: '' });
    } else {
      alert('Please upload a valid file (PDF, CSV, or TXT)');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bulkResumeData.trim() && !uploadedFile) {
      alert('Please provide resume data either by pasting text or uploading a file.');
      return;
    }
    
    setIsLoading(true);

    try {
      const form = new FormData();
      form.append('resumeText', formData.bulkResumeData);
      if (uploadedFile) {
        form.append('resumeFile', uploadedFile);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process/${searchId}`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: form,
      });

      const data = await res.json();
      console.log('Submit response:', data);

      if (res.ok) {
        if (data.processing) {
          setIsProcessing(true);
        } else if (data.next) {
          setSubmitted(data.submitted);
          setCurrentCandidate(data.candidate || null);
          setIsLast(data.isLast);

          setFormData({
            bulkResumeData: '',
          });
          setUploadedFile(null);
        }
      } else {
        alert(data.errors ? data.errors.join('\n') : 'Submission failed.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      bulkResumeData: '',
    });
    setUploadedFile(null);
  };

  // Helper function to check if a candidate has a resume
  const hasResume = (candidate: any) => {
    // A candidate has a resume if their position in the list is less than submitted count
    const candidatePosition = allCandidates.findIndex(c => c.index === candidate.index);
    return candidatePosition < submitted;
  };

  if (isProcessing && searchId) {
    return <ProcessingLoader searchId={searchId} />;
  }

  if (isLoading && submitted === 0 && allCandidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Candidate Resumes</h1>
        <p className="text-muted-foreground">Upload resume data for each shortlisted candidate</p>

        {/* Show update info if there are old candidates */}
        {oldCandidateCount > 0 && (
          <Alert className="mt-4 border-blue-500 bg-blue-50 text-blue-900">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong>Updated Shortlist:</strong> {oldCandidateCount} candidate(s) with submitted resumes have been preserved. 
              You only need to upload resumes for the {target - oldCandidateCount} new candidate(s).
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Indicator */}
        {target > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Progress: {submitted} of {target} candidates
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round((submitted / target) * 100)}% complete
              </p>
            </div>
            <div className="w-full bg-secondary/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(submitted / target) * 100}%` }}
              ></div>
            </div>

            {/* Candidate List with visual separation */}
            <div className="flex flex-wrap gap-2 mt-3">
              {allCandidates.map((candidate, index) => {
                const candidateHasResume = hasResume(candidate);
                const isCurrent = currentCandidate?.index === candidate.index;
                const isOld = index < oldCandidateCount;

                return (
                  <div
                    key={candidate.index}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs ${
                      candidateHasResume && isOld
                        ? 'bg-green-500/20 text-green-600 border border-green-500/40'
                        : candidateHasResume
                        ? 'bg-green-500/20 text-green-400'
                        : isCurrent
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-secondary/20 text-muted-foreground'
                    }`}
                  >
                    {candidateHasResume ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                    <span>{candidate.name}</span>
                    {candidateHasResume && isOld && (
                      <span className="text-[10px] opacity-70">(saved)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentCandidate && (
          <p className="text-sm text-accent mt-2">
            Uploading resume for candidate: <strong>{currentCandidate.name}</strong>
          </p>
        )}
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Resume Data</span>
            {currentCandidate && (
              <span className="text-sm font-normal text-muted-foreground">
                - {currentCandidate.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-primary/30 bg-background/50'
              }`}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    File uploaded successfully. You can submit or replace it.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    Drop resume file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse (PDF, CSV, or TXT)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>
              )}
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Text Area */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Paste Resume Text
              </label>
              <Textarea
                value={formData.bulkResumeData}
                onChange={(e) => {
                  setFormData({ bulkResumeData: e.target.value });
                  if (e.target.value.trim() && uploadedFile) {
                    setUploadedFile(null);
                  }
                }}
                placeholder="Paste the resume content here..."
                className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20 min-h-[200px]"
                disabled={isLoading || !!uploadedFile}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {uploadedFile ? 'Clear the uploaded file to paste text' : 'You can paste resume text directly here'}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isLoading || (!formData.bulkResumeData.trim() && !uploadedFile)}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  `Submit Resume ${submitted + 1}/${target}`
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Process;