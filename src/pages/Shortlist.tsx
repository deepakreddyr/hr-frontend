import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Sparkles, Filter, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Shortlist = () => {
  const { searchId } = useParams<{ searchId?: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    searchName: '',
    requiredSkills: '',
    numberOfCandidates: 5,
    jobRole: '',
    customQuestion: '',
    candidateData: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // NEW: source selector
  const [sourceType, setSourceType] = useState<'blank' | 'search' | 'task'>('blank');
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // fetch available sources
  useEffect(() => {
    if (sourceType === 'search') {
      fetch(`${import.meta.env.VITE_API_URL}/api/my-searches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
        .then(res => res.json())
        .then(data => setSourceOptions(data || []));
    } else if (sourceType === 'task') {
      fetch(`${import.meta.env.VITE_API_URL}/api/my-tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
        .then(res => res.json())
        .then(data => setSourceOptions(data || []));
    } else {
      setSourceOptions([]);
    }
  }, [sourceType]);

  // prefill when selected
  useEffect(() => {
    if (!selectedSourceId) return;

    const url =
      sourceType === 'search'
        ? `${import.meta.env.VITE_API_URL}/api/shortlist/${selectedSourceId}`
        : `${import.meta.env.VITE_API_URL}/api/tasks/${selectedSourceId}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            searchName: data.searchName || data.title || '',
            requiredSkills: data.requiredSkills || data.skills?.join(', ') || '',
            numberOfCandidates: data.numCandidates || 5,
            jobRole: data.jobRole || data.position || '',
            customQuestion: data.customQuestion || '',
            candidateData: data.candidateData || '',
          });
        }
      });
  }, [selectedSourceId, sourceType]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const payload = new FormData();
    payload.append('searchName', formData.searchName);
    payload.append('skills', formData.requiredSkills);
    payload.append('jobRole', formData.jobRole);
    payload.append('numCandidates', formData.numberOfCandidates.toString());
    payload.append('candidateData', formData.candidateData);
    if (uploadedFile) {
      payload.append('jdFile', uploadedFile);
    }

    try {
      const url = searchId
        ? `${import.meta.env.VITE_API_URL}/api/shortlist/${searchId}`
        : `${import.meta.env.VITE_API_URL}/api/shortlist`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: payload,
      });

      const data = await res.json();
      if (data.success) {
        const finalSearchId = searchId || data.search_id;
        navigate(`/process/${finalSearchId}`);
      } else {
        setErrorMessage(data.message || 'No candidates matched the required skills.');
      }
    } catch (err) {
      console.error('Shortlist submit failed:', err);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      searchName: '',
      requiredSkills: '',
      numberOfCandidates: 5,
      jobRole: '',
      customQuestion: '',
      candidateData: ''
    });
    setUploadedFile(null);
    setErrorMessage(null);
    setSelectedSourceId(null);
    setSourceType('blank');
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {searchId ? 'Update Shortlist' : 'Create Shortlist'}
          </h1>
          <p className="text-muted-foreground">Define criteria and upload job description</p>
        </div>
        {searchId && (
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Search ID: {searchId}</span>
          </div>
        )}
      </div>

      {/* FORM + JD Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 glow-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Shortlist Criteria & Candidates Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search Name *</label>
                <Input
                  value={formData.searchName}
                  onChange={(e) => setFormData({ ...formData, searchName: e.target.value })}
                  placeholder="e.g., Frontend Hiring - June 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Role *</label>
                <Input
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  placeholder="e.g., Senior React Developer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Required Skills *</label>
                <Textarea
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="React, TypeScript, Node.js, AWS"
                  required
                  minLength={1}
                />
                {errorMessage && (
                  <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Candidate List *</label>
                <Textarea
                  value={formData.candidateData}
                  onChange={(e) => setFormData({ ...formData, candidateData: e.target.value })}
                  placeholder="Paste candidate resumes (one per line)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Candidates</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.numberOfCandidates}
                  onChange={(e) =>
                    setFormData({ ...formData, numberOfCandidates: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary/90 glow-primary transition-all duration-300"
                >
                  {loading ? 'Shortlisting...' : searchId ? 'Update Shortlist' : 'Create Shortlist'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          {/* SOURCE SELECTOR */}
          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary" />
                <span>Import From</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="">
                <Select
                  value={sourceType}
                  onValueChange={(val: 'blank' | 'search' | 'task') => {
                    setSourceType(val);
                    setSelectedSourceId(null);
                    setFormData({
                      searchName: '',
                      requiredSkills: '',
                      numberOfCandidates: 5,
                      jobRole: '',
                      customQuestion: '',
                      candidateData: ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blank">None</SelectItem>
                    <SelectItem value="search">Existing Search</SelectItem>
                    <SelectItem value="task">Assigned Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='mt-[1vw]'>
                {sourceType !== 'blank' && (
                  <Select value={selectedSourceId || ''} onValueChange={setSelectedSourceId}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select a ${sourceType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((opt: any) => (
                        <SelectItem key={opt.id} value={opt.id.toString()}>
                          {opt.searchName || opt.title || `ID ${opt.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>  
          </Card>
          <CardHeader className='mt-[8vw]'>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Job Description (PDF)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Upload JD PDF</p>
                  <p className="text-sm text-muted-foreground mb-4">PDF only. Max 10MB.</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-primary/20 text-primary rounded-lg cursor-pointer hover:bg-primary/30 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              ) : (
                <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-accent" />
                      <div>
                        <p className="font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shortlist;
