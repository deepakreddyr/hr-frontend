import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Sparkles, MapPin, Building, Clock, Wifi, FileText, User, CheckCircle, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate , useParams } from 'react-router-dom';

// Move InputField component outside of the main component
const InputField = ({
  label,
  icon,
  value,
  onChange,
  disabled = false,
  type = 'text',
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2 flex items-center space-x-1">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
      disabled={disabled}
    />
  </div>
);

const Process = () => {
  const hasSetInitialData = useRef(false);
  const [formData, setFormData] = useState({
    bulkResumeData: '',
    hiringCompany: '',
    companyLocation: '',
    hrCompany: '',
    noticePeriod: '',
    remoteWork: false,
    contractHiring: false,
    customQuestion: '',
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLast, setIsLast] = useState(false);
  const [submitted, setSubmitted] = useState(0);
  const [target, setTarget] = useState(0);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [shortlistedIndices, setShortlistedIndices] = useState<number[]>([]);
  const [questionGenerated, setQuestionGenerated] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { searchId } = useParams();
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${REACT_APP_API_URL}/api/process/${searchId}`, { 
          method: 'GET', 
          credentials: 'include' 
        });
        const data = await res.json();
        console.log('Initial data:', data);
        
        if (data.success) {
          setSubmitted(data.submitted || 0);
          setTarget(data.target || 0);
          setCurrentIndex(data.currentIndex ?? null);
          setIsLast(data.isLast || false);
          const parsedIndices = Array.isArray(data.shortlisted_indices)
            ? data.shortlisted_indices
            : JSON.parse(data.shortlisted_indices || '[]');

          setShortlistedIndices(parsedIndices);


          if (data.right_fields && !hasSetInitialData.current) {
            setFormData(prev => ({
              ...prev,
              ...data.prev_fields
            }));
            setFieldsDisabled(data.submitted > 0);
            hasSetInitialData.current = true;
          }
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
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
    }
  };

  const generateSuggestions = async () => {
    try {
      const res = await fetch('${REACT_APP_API_URL}/api/get-questions', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.questions) {
        setSuggestions(data.questions);
        setQuestionGenerated(true);
      } else {
        alert(data.error || 'Failed to fetch questions');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while generating suggestions.');
    }
  };

  const addSuggestionToCustom = (suggestion: string) => {
    setFormData(prev => ({ ...prev, customQuestion: suggestion }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = new FormData();
      form.append('resumeText', formData.bulkResumeData);
      form.append('hiringCompany', formData.hiringCompany);
      form.append('companyLocation', formData.companyLocation);
      form.append('hrCompany', formData.hrCompany);
      form.append('noticePeriod', formData.noticePeriod);
      form.append('remoteWork', formData.remoteWork ? 'on' : '');
      form.append('contractH', formData.contractHiring ? 'on' : '');
      form.append('customQuestion', formData.customQuestion);
      if (uploadedFile) form.append('csvFile', uploadedFile);

      const res = await fetch(`${REACT_APP_API_URL}/api/process/${searchId}`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      const data = await res.json();
      console.log('Submit response:', data);
      
      if (res.ok) {
        if (data.redirect) {
          navigate('/loading');
        } else if (data.next) {
          setSubmitted(data.submitted);
          setCurrentIndex(data.candidateIndex);
          setIsLast(data.isLast);
          
          
          // Disable fields after first submission
          if (data.right_fields) {
            setFormData(prev => ({
              ...prev,
              ...data.right_fields
            }));
            setFieldsDisabled(true);
          }
          // Clear only the resume text and custom question for next candidate
          setFormData(prev => ({
            ...prev,
            bulkResumeData: '',
            customQuestion: '',
          }));
          setUploadedFile(null);
          setSuggestions([]);
          setQuestionGenerated(false);
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
      hiringCompany: '',
      companyLocation: '',
      hrCompany: '',
      noticePeriod: '',
      remoteWork: false,
      contractHiring: false,
      customQuestion: '',
    });
    setUploadedFile(null);
    setSuggestions([]);
    setQuestionGenerated(false);
  };

  if (isLoading && submitted === 0) {
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
        <h1 className="text-3xl font-bold text-foreground">Process Job Requirements</h1>
        <p className="text-muted-foreground">Define search criteria and upload candidate data</p>
        
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
            
            {/* Candidate List */}
            <div className="flex flex-wrap gap-2 mt-3">
              {shortlistedIndices.map((candidateIdx, index) => (
                <div
                  key={candidateIdx}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs ${
                    index < submitted
                      ? 'bg-green-500/20 text-green-400'
                      : index === submitted
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-secondary/20 text-muted-foreground'
                  }`}
                >
                  {index < submitted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                  <span>Candidate #{candidateIdx}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentIndex !== null && (
          <p className="text-sm text-accent mt-2">
            Uploading resume for candidate #{currentIndex}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Job Requirements</span>
                {currentIndex && (
                  <span className="text-sm font-normal text-muted-foreground">
                    - Candidate #{currentIndex}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Resume Data for Candidate # {currentIndex || 'N/A'}
                  </label>
                  <Textarea
                    value={formData.bulkResumeData}
                    onChange={(e) => setFormData(prev => ({ ...prev, bulkResumeData: e.target.value }))}
                    placeholder="Paste resume data here or upload CSV..."
                    className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20 min-h-[120px]"
                    disabled={isLoading}
                  />
                  <div className="flex items-center space-x-3 mt-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="csv-upload"
                      className={`inline-flex items-center px-3 py-2 bg-secondary/50 text-foreground rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors text-sm ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </label>
                    {uploadedFile && (
                      <span className="text-sm text-primary">{uploadedFile.name} uploaded</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Hiring Company *"
                    icon={<Building className="w-4 h-4" />}
                    value={formData.hiringCompany}
                    onChange={(val) => setFormData(prev => ({ ...prev, hiringCompany: val }))}
                    disabled={fieldsDisabled || isLoading}
                  />
                  <InputField
                    label="Company Location"
                    icon={<MapPin className="w-4 h-4" />}
                    value={formData.companyLocation}
                    onChange={(val) => setFormData(prev => ({ ...prev, companyLocation: val }))}
                    disabled={fieldsDisabled || isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="HR Company"
                    icon={<User className="w-4 h-4" />}
                    value={formData.hrCompany}
                    onChange={(val) => setFormData(prev => ({ ...prev, hrCompany: val }))}
                    disabled={fieldsDisabled || isLoading}
                  />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Notice Period</span>
                    </label>
                    <select
                      value={formData.noticePeriod}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, noticePeriod: e.target.value }))
                      }
                      disabled={fieldsDisabled || isLoading}
                      className="w-full px-3 py-2 bg-background/50 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    >
                      <option value="">Select notice period</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                      <option value="more than 3">More than 3 months</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="remoteWork"
                      checked={formData.remoteWork}
                      onChange={(e) => setFormData(prev => ({ ...prev, remoteWork: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={fieldsDisabled || isLoading}
                    />
                    <label htmlFor="remoteWork" className="text-sm font-medium text-foreground flex items-center">
                      <Wifi className="w-4 h-4 mr-1" />
                      Remote Work Available
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="contractHiring"
                      checked={formData.contractHiring}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractHiring: e.target.checked }))}
                      className="w-4 h-4 text-primary"
                      disabled={fieldsDisabled || isLoading}
                    />
                    <label htmlFor="contractHiring" className="text-sm font-medium text-foreground flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Contract Hiring
                    </label>
                  </div>
                </div>

                {isLast && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-foreground">
                        Custom Question for AI Bot
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateSuggestions}
                        disabled={questionGenerated || isLoading}
                        className="border-accent/30 text-accent hover:bg-accent/10"
                      >
                        Generate Suggestions
                      </Button>
                    </div>
                    <Textarea
                      value={formData.customQuestion}
                      onChange={(e) => setFormData(prev => ({ ...prev, customQuestion: e.target.value }))}
                      placeholder="Enter a custom question..."
                      className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isLoading}
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

        <div className="lg:col-span-1">
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>Question Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-sm">
                    {isLast 
                      ? 'Click "Generate Suggestions" to see AI-powered question recommendations'
                      : 'Custom questions are available on the final candidate'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Click any suggestion to add it to your custom question:
                  </p>
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => addSuggestionToCustom(s)}
                      className="p-3 bg-background/50 rounded-lg border border-accent/20 cursor-pointer hover:bg-accent/10 hover:border-accent/40 transition-all duration-200"
                    >
                      <p className="text-sm text-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Process;