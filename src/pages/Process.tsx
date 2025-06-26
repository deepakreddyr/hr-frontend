
import React, { useState } from 'react';
import { Upload, Sparkles, MapPin, Building, Clock, Wifi, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Process = () => {
  const [formData, setFormData] = useState({
    bulkResumeData: '',
    hiringCompany: '',
    companyLocation: '',
    hrCompany: '',
    noticePeriod: '',
    remoteWork: false,
    contractHiring: false,
    customQuestion: ''
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const questionSuggestions = [
    "What is your experience with cloud platforms like AWS or Azure?",
    "How do you handle tight deadlines and multiple projects?",
    "What's your approach to code review and team collaboration?",
    "Can you describe your experience with agile methodologies?",
    "What programming languages are you most comfortable with?"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
    }
  };

  const generateSuggestions = () => {
    setSuggestions(questionSuggestions);
  };

  const addSuggestionToCustom = (suggestion: string) => {
    setFormData({ ...formData, customQuestion: suggestion });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Processing job requirements:', formData);
    console.log('Uploaded file:', uploadedFile);
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
      customQuestion: ''
    });
    setUploadedFile(null);
    setSuggestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Process Job Requirements</h1>
        <p className="text-muted-foreground">Define search criteria and upload candidate data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Job Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Resume Data Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bulk Resume Data
                  </label>
                  <div className="space-y-3">
                    <Textarea
                      value={formData.bulkResumeData}
                      onChange={(e) => setFormData({ ...formData, bulkResumeData: e.target.value })}
                      placeholder="Paste resume data here or upload CSV file below..."
                      className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20 min-h-[120px]"
                    />
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label
                        htmlFor="csv-upload"
                        className="inline-flex items-center px-3 py-2 bg-secondary/50 text-foreground rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                      </label>
                      {uploadedFile && (
                        <span className="text-sm text-primary">
                          {uploadedFile.name} uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Hiring Company *
                    </label>
                    <Input
                      value={formData.hiringCompany}
                      onChange={(e) => setFormData({ ...formData, hiringCompany: e.target.value })}
                      placeholder="e.g., TechCorp Inc."
                      className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Company Location
                    </label>
                    <Input
                      value={formData.companyLocation}
                      onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                      className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      HR Company
                    </label>
                    <Input
                      value={formData.hrCompany}
                      onChange={(e) => setFormData({ ...formData, hrCompany: e.target.value })}
                      placeholder="e.g., RecruiterPro"
                      className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Notice Period (days)
                    </label>
                    <Input
                      type="number"
                      value={formData.noticePeriod}
                      onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                      placeholder="30"
                      className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="remoteWork"
                      checked={formData.remoteWork}
                      onChange={(e) => setFormData({ ...formData, remoteWork: e.target.checked })}
                      className="w-4 h-4 text-primary bg-background border-primary/30 rounded focus:ring-primary/20"
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
                      onChange={(e) => setFormData({ ...formData, contractHiring: e.target.checked })}
                      className="w-4 h-4 text-primary bg-background border-primary/30 rounded focus:ring-primary/20"
                    />
                    <label htmlFor="contractHiring" className="text-sm font-medium text-foreground flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Contract Hiring
                    </label>
                  </div>
                </div>

                {/* Custom Question */}
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
                      className="border-accent/30 text-accent hover:bg-accent/10"
                    >
                      Generate Suggestions
                    </Button>
                  </div>
                  <Textarea
                    value={formData.customQuestion}
                    onChange={(e) => setFormData({ ...formData, customQuestion: e.target.value })}
                    placeholder="Enter a custom question for the AI bot to ask candidates..."
                    className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90 glow-primary transition-all duration-300"
                  >
                    Submit Process
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClear}
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Panel */}
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
                    Click "Generate Suggestions" to see AI-powered question recommendations
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Click any suggestion to add it to your custom question:
                  </p>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => addSuggestionToCustom(suggestion)}
                      className="p-3 bg-background/50 rounded-lg border border-accent/20 cursor-pointer hover:bg-accent/10 hover:border-accent/40 transition-all duration-200"
                    >
                      <p className="text-sm text-foreground">{suggestion}</p>
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
