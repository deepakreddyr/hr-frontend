import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Sparkles, Filter, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Shortlist = () => {
  const [impSearchId, setImpSearchId] = useState<number | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    searchName: '',
    requiredSkills: '',
    numberOfCandidates: 1,
    jobRole: '',
    candidateData: '',
    hiringCompany: '',
    companyLocation: '',
    hrCompany: '',
    noticePeriod: '',
    remoteWorkAvailable: '',
    contractHiring: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Source selector
  const [sourceType, setSourceType] = useState<'blank' | 'search' | 'task'>('blank');
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Notice period options
  const noticePeriodOptions = [
    'Immediate',
    '15 days',
    '1 month',
    '2 months',
    '3 months',
    'More than 3 months'
  ];

  // fetch available sources
  useEffect(() => {
    const fetchSources = async () => {
      try {
        if (sourceType === 'search') {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/get-search`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });
          const data = await res.json();
          setSourceOptions(data.success ? data.tasks || [] : []);
        } else if (sourceType === 'task') {
          setLoadingTasks(true);
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/inbox`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });
          const data = await res.json();
          setSourceOptions(data.success ? data.tasks || [] : []);
          setLoadingTasks(false);
        } else {
          setSourceOptions([]);
          setImpSearchId(null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setSourceOptions([]);
        setLoadingTasks(false);
      }
    };

    fetchSources();
  }, [sourceType]);

  // prefill when source is selected
  useEffect(() => {
    if (!selectedSourceId) {
      setImpSearchId(null);
      return;
    }

    try {
      if (sourceType === 'search') {
        const s = sourceOptions.find((opt) => opt.id.toString() === selectedSourceId);
        if (s) {
          // Set the search ID for update operation
          setImpSearchId(s.id);
          
          // Convert boolean fields to string values for the form
          let remoteWorkValue = '';
          if (s.remote_work === true) {
            remoteWorkValue = 'Yes';
          } else if (s.remote_work === false) {
            remoteWorkValue = 'No';
          }
          
          let contractHiringValue = '';
          if (s.contract_hiring === true) {
            contractHiringValue = 'Yes';
          } else if (s.contract_hiring === false) {
            contractHiringValue = 'No';
          }
          
          setFormData({
            searchName: s.search_name || '',
            requiredSkills: s.key_skills || '',
            numberOfCandidates: s.noc || 1,
            jobRole: s.job_role || '',
            candidateData: s.raw_data || '',
            hiringCompany: s.rc_name || '',
            companyLocation: s.company_location || '',
            hrCompany: s.hc_name || '',
            noticePeriod: s.notice_period || '',
            remoteWorkAvailable: remoteWorkValue,
            contractHiring: contractHiringValue
          });
        }
      } else if (sourceType === 'task') {
        const t = sourceOptions.find((opt) => opt.id.toString() === selectedSourceId);
        if (t) {
          // Tasks create new shortlists, not updates
          setImpSearchId(null);
          
          setFormData({
            searchName: t.title || '',
            requiredSkills: t.skills || '',
            numberOfCandidates: t.openings || 1,
            jobRole: t.job_role || '',
            candidateData: '',
            hiringCompany: t.hiring_company || '',
            companyLocation: t.company_location || '',
            hrCompany: t.hr_company || '',
            noticePeriod: t.notice_period || '',
            remoteWorkAvailable: t.remote_work_available || '',
            contractHiring: t.contract_hiring || ''
          });
        }
      }
    } catch (err) {
      console.error('Prefill error:', err);
    }
  }, [selectedSourceId, sourceType, sourceOptions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') setUploadedFile(f);
  };

  const handleRemoveFile = () => setUploadedFile(null);

  const validateForm = () => {
    const errs: string[] = [];
    if (!formData.searchName.trim()) errs.push('Search Name is required');
    if (!formData.jobRole.trim()) errs.push('Job Role is required');
    if (!formData.requiredSkills.trim()) errs.push('Required Skills are required');
    if (!formData.candidateData.trim()) errs.push('Candidate Data is required');
    if (!formData.hiringCompany.trim()) errs.push('Hiring Company is required');
    if (!formData.companyLocation.trim()) errs.push('Company Location is required');
    if (!formData.hrCompany.trim()) errs.push('HR Company is required');
    if (!formData.noticePeriod.trim()) errs.push('Notice Period is required');
    if (!formData.remoteWorkAvailable.trim()) errs.push('Remote Work Available is required');
    if (!formData.contractHiring.trim()) errs.push('Contract Hiring is required');
    if (!uploadedFile) errs.push('Job Description PDF is required');
    if (formData.numberOfCandidates < 1 || formData.numberOfCandidates > 50) {
      errs.push('Number of Candidates must be between 1 and 50');
    }
    if (errs.length) {
      setErrorMessage(errs.join(', '));
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = new FormData();
    payload.append('searchName', formData.searchName);
    payload.append('requiredSkills', formData.requiredSkills);
    payload.append('jobRole', formData.jobRole);
    payload.append('numberOfCandidates', formData.numberOfCandidates.toString());
    payload.append('candidateData', formData.candidateData);
    payload.append('hiringCompany', formData.hiringCompany);
    payload.append('companyLocation', formData.companyLocation);
    payload.append('hrCompany', formData.hrCompany);
    payload.append('noticePeriod', formData.noticePeriod);
    payload.append('remoteWorkAvailable', formData.remoteWorkAvailable);
    payload.append('contractHiring', formData.contractHiring);
    
    // Include search_id in payload if updating
    if (impSearchId) {
      payload.append('search_id', impSearchId.toString());
    }
    
    if (uploadedFile) payload.append('jdFile', uploadedFile);

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/shortlist`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        body: payload,
      });
      const data = await res.json();

      if (data.success) {
        if (data.is_update) {
          setSuccessMessage(data.message);
          // Wait a moment to show the success message
          setTimeout(() => {
            navigate(`/process/${data.search_id}`);
          }, 1500);
        } else {
          navigate(`/process/${data.search_id}`);
        }
      } else {
        setErrorMessage(data.message || data.error || 'No candidates matched.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      searchName: '',
      requiredSkills: '',
      numberOfCandidates: 1,
      jobRole: '',
      candidateData: '',
      hiringCompany: '',
      companyLocation: '',
      hrCompany: '',
      noticePeriod: '',
      remoteWorkAvailable: '',
      contractHiring: ''
    });
    setUploadedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedSourceId(null);
    setSourceType('blank');
    setImpSearchId(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {impSearchId ? 'Update Shortlist' : 'Create Shortlist'}
          </h1>
          <p className="text-muted-foreground">Define criteria and upload job description</p>
        </div>
        {impSearchId && (
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Search ID: {impSearchId}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {impSearchId && (
        <Alert className="border-blue-500 bg-blue-50 text-blue-900">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            You are updating an existing search. Old candidates with submitted resumes will be preserved, 
            and new candidates will be added based on your updated criteria.
          </AlertDescription>
        </Alert>
      )}

      {/* SOURCE SELECTOR */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Import From</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Source Type</label>
              <Select value={sourceType} onValueChange={(v) => {
                setSourceType(v as any);
                setSelectedSourceId(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Start from scratch</SelectItem>
                  <SelectItem value="search">Import from search</SelectItem>
                  <SelectItem value="task">Import from task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sourceType !== 'blank' && (
              <div>
                <label className="block text-sm font-medium mb-2">Select {sourceType}</label>
                <Select
                  value={selectedSourceId || ''}
                  onValueChange={setSelectedSourceId}
                  disabled={loadingTasks && sourceType === 'task'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingTasks ? 'Loading…' : `Select a ${sourceType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No {sourceType}s found
                      </SelectItem>
                    ) : (
                      sourceOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id.toString()}>
                          {sourceType === 'search'
                            ? opt.search_name || `Search ${opt.id}`
                            : opt.title || `Task ${opt.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FORM + JD UPLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Criteria & Candidate Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search Name *</label>
                <Input
                  value={formData.searchName}
                  onChange={(e) => setFormData({ ...formData, searchName: e.target.value })}
                  placeholder="Enter search name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Job Role *</label>
                <Input
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  placeholder="Enter job role"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Required Skills *</label>
                <Textarea
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="Enter required skills (comma separated)"
                  required
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Candidate Data *</label>
                <Textarea
                  value={formData.candidateData}
                  onChange={(e) => setFormData({ ...formData, candidateData: e.target.value })}
                  placeholder="Paste candidate data here"
                  required
                  rows={4}
                />
                {impSearchId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Update this field to re-shortlist candidates with new criteria
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Company & Position Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hiring Company *</label>
                    <Input
                      value={formData.hiringCompany}
                      onChange={(e) => setFormData({ ...formData, hiringCompany: e.target.value })}
                      placeholder="Enter hiring company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Company Location *</label>
                    <Input
                      value={formData.companyLocation}
                      onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                      placeholder="Enter company location"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">HR Company *</label>
                    <Input
                      value={formData.hrCompany}
                      onChange={(e) => setFormData({ ...formData, hrCompany: e.target.value })}
                      placeholder="Enter HR company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notice Period *</label>
                    <Select 
                      value={formData.noticePeriod} 
                      onValueChange={(value) => setFormData({ ...formData, noticePeriod: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice period" />
                      </SelectTrigger>
                      <SelectContent>
                        {noticePeriodOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Remote Work Available *</label>
                    <Select 
                      value={formData.remoteWorkAvailable} 
                      onValueChange={(value) => setFormData({ ...formData, remoteWorkAvailable: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select remote work option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contract Hiring *</label>
                    <Select 
                      value={formData.contractHiring} 
                      onValueChange={(value) => setFormData({ ...formData, contractHiring: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract hiring option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Candidates *</label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.numberOfCandidates}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfCandidates: parseInt(e.target.value) || 1 })
                      }
                      placeholder="Enter number of candidates"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting…' : impSearchId ? 'Update Shortlist' : 'Create Shortlist'}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Job Description (PDF) *</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Upload Job Description PDF</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click to select a PDF file from your computer
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 border-2 border-primary/20 rounded-lg bg-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {uploadedFile.type}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveFile}
                      className="ml-2 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      type="button"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload-replace"
                  />
                  <label
                    htmlFor="file-upload-replace"
                    className="inline-block px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    Replace File
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shortlist;