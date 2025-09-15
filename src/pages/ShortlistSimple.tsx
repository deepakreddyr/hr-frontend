import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ShortlistSimple = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    searchName: '',
    jobRole: '',
    requiredSkills: '',
    numberOfCandidates: 5,
    resumeLink: '',
  });

  const [jdFile, setJdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setJdFile(file);
    } else {
      alert('Please upload a valid PDF for JD.');
    }
  };

  const handleRemoveFile = () => setJdFile(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = new FormData();
      payload.append('searchName', formData.searchName);
      payload.append('jobRole', formData.jobRole);
      payload.append('skills', formData.requiredSkills);
      payload.append('numCandidates', formData.numberOfCandidates.toString());
      payload.append('resumeLink', formData.resumeLink);
      if (jdFile) payload.append('jdFile', jdFile);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shortlist/simple`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: payload,
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/process/${data.search_id}`);
      } else {
        setErrorMessage(data.message || 'Shortlist creation failed.');
      }
    } catch (err) {
      console.error('ShortlistSimple submit failed:', err);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Create Simple Shortlist</h1>
        <p className="text-muted-foreground">Provide details and upload files</p>
      </div>

      {/* FORM */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Shortlist Info</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search Name *</label>
              <Input
                value={formData.searchName}
                onChange={(e) => setFormData({ ...formData, searchName: e.target.value })}
                placeholder="e.g., Data Engineer Hiring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Job Role *</label>
              <Input
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                placeholder="e.g., Backend Developer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Required Skills *</label>
              <Textarea
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                placeholder="Python, SQL, AWS"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Number of Candidates *</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.numberOfCandidates}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfCandidates: parseInt(e.target.value) })
                }
                required
              />
            </div>

            {/* Resume Link */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Candidates Resume Link *</label>
              <Input
                type="url"
                value={formData.resumeLink}
                onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                placeholder="https://drive.google.com/resume-link"
                required
              />
            </div>

            {/* JD Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Upload JD (PDF) *</label>
              {!jdFile ? (
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
                  <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="jd-upload"
                    required
                  />
                  <label
                    htmlFor="jd-upload"
                    className="inline-flex items-center px-4 py-2 bg-primary/20 text-primary rounded-lg cursor-pointer"
                  >
                    Choose PDF
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <FileText className="w-5 h-5 text-accent" />
                  <span>{jdFile.name}</span>
                  <button type="button" onClick={handleRemoveFile}>
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-primary">
              {loading ? 'Submitting...' : 'Create Shortlist'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShortlistSimple;
