
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, X, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Shortlist = () => {
  const { searchId } = useParams();
  const [formData, setFormData] = useState({
    requiredSkills: '',
    numberOfCandidates: 5,
    jobRole: '',
    customQuestion: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Shortlist criteria:', formData);
    console.log('Uploaded file:', uploadedFile);
  };

  const handleReset = () => {
    setFormData({
      requiredSkills: '',
      numberOfCandidates: 5,
      jobRole: '',
      customQuestion: ''
    });
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Shortlist</h1>
          <p className="text-muted-foreground">Define criteria and upload job description</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Search ID: {searchId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shortlist Form */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 glow-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Shortlist Criteria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Job Role *
                </label>
                <Input
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  placeholder="e.g., Senior React Developer"
                  className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Required Skills *
                </label>
                <Textarea
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="React, TypeScript, Node.js, AWS (comma-separated)"
                  className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Candidates to Shortlist
                </label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.numberOfCandidates}
                  onChange={(e) => setFormData({ ...formData, numberOfCandidates: parseInt(e.target.value) })}
                  className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Question for AI Bot
                </label>
                <Textarea
                  value={formData.customQuestion}
                  onChange={(e) => setFormData({ ...formData, customQuestion: e.target.value })}
                  placeholder="What specific experience do you have with microservices architecture?"
                  className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90 glow-primary transition-all duration-300"
                >
                  Create Shortlist
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

        {/* File Upload Section */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Upload Job Description</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF files up to 10MB
                  </p>
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
                  <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
                    <p className="text-sm text-primary">
                      PDF preview would be displayed here using PDF.js
                    </p>
                  </div>
                </div>
              )}

              {uploadedFile && (
                <Button 
                  variant="outline" 
                  className="w-full border-accent/30 text-accent hover:bg-accent/10"
                >
                  Preview Job Description
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shortlist;
