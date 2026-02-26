import React, { useState, useEffect, DragEvent } from "react";
import {
  Building,
  MapPin,
  User,
  Wifi,
  FileText,
  Upload,
  ListChecks,
  Database,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast"; // assuming shadcn toast

// Input with leading icon
const IconInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = true,
}: {
  label: string;
  icon: any;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-foreground">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
        <Icon size={16} />
      </span>
      <Input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 bg-background/50 border-border focus:border-primary focus:ring-primary/20"
      />
    </div>
  </div>
);

const ShortlistForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    searchName: "",
    hiringCompany: "",
    hrCompany: "",
    jobRole: "",
    skills: "",
    companyLocation: "",
    remoteWork: false,
    contractHiring: false,
    resumeLink: "",
    numCandidates: 5,
    jdFile: null as File | null,
    excelFile: null as File | null,
    noticePeriod: "",
  });

  const [resumeSource, setResumeSource] = useState<'link' | 'excel'>('link');
  const [excelDragOver, setExcelDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Task import states
  const [sourceType, setSourceType] = useState<'blank' | 'task'>('blank');
  const [taskOptions, setTaskOptions] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Fetch tasks when sourceType changes to 'task'
  useEffect(() => {
    const fetchTasks = async () => {
      if (sourceType === 'task') {
        setLoadingTasks(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/inbox`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });
          const data = await response.json();

          if (data.success) {
            setTaskOptions(data.tasks || []);
          } else {
            console.error('Error fetching tasks:', data.error);
            setTaskOptions([]);
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          setTaskOptions([]);
        } finally {
          setLoadingTasks(false);
        }
      } else {
        setTaskOptions([]);
      }
    };

    fetchTasks();
  }, [sourceType]);

  // Prefill form when a task is selected
  useEffect(() => {
    if (!selectedTaskId || sourceType !== 'task') return;

    const selectedTask = taskOptions.find(task => task.id.toString() === selectedTaskId);

    if (selectedTask) {
      // Map task fields to form fields based on your database schema
      setFormData(prev => ({
        ...prev,
        searchName: selectedTask.title || '',
        jobRole: selectedTask.job_role || '',
        skills: selectedTask.skills || '',
        hiringCompany: selectedTask.company_name || '',
        companyLocation: selectedTask.job_location || '',
        // Note: resumeLink can be populated from notes if needed
        // resumeLink: selectedTask.notes?.includes('http') ? selectedTask.notes : prev.resumeLink,
      }));
    }
  }, [selectedTaskId, sourceType, taskOptions]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setFormData({ ...formData, jdFile: file });
      } else {
        alert("Please upload a PDF file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, jdFile: file });
  };

  const handleExcelDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setExcelDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv"
      ];
      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setFormData({ ...formData, excelFile: file });
      } else {
        alert("Please upload an Excel or CSV file");
      }
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, excelFile: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validate JD file (browsers don't enforce required on hidden inputs)
    if (!formData.jdFile) {
      toast({
        title: "JD file required",
        description: "Please upload a Job Description PDF before submitting.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Validate resume source
    if (resumeSource === 'link' && !formData.resumeLink.trim()) {
      toast({
        title: "Resume link required",
        description: "Please enter a Google Drive or Sheet link for resumes.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    if (resumeSource === 'excel' && !formData.excelFile) {
      toast({
        title: "Excel file required",
        description: "Please upload an Excel or CSV file with resumes.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();

      // Always append the JD file
      payload.append("jdFile", formData.jdFile);

      // Append resume source
      if (resumeSource === 'link') {
        payload.append("resumeLink", formData.resumeLink);
      } else if (formData.excelFile) {
        payload.append("excelFile", formData.excelFile);
      }

      // Append remaining scalar fields
      const scalarFields = ['searchName', 'hiringCompany', 'hrCompany', 'jobRole', 'skills', 'companyLocation', 'remoteWork', 'contractHiring', 'numCandidates', 'noticePeriod'] as const;
      scalarFields.forEach((key) => {
        const value = formData[key];
        if (value !== null && value !== undefined) {
          payload.append(key, String(value));
        }
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/shortlist/simple`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: payload,
        }
      );

      const data = await res.json();
      if (data.success) {
        navigate(`/results/${data.search_id}`);
      } else {
        toast({
          title: "No candidates shortlisted",
          description:
            data.message + " Try again with updated job/resume data.",
          variant: "destructive", // red styling if using shadcn
          duration: Infinity,
        });
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error submitting form",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: Infinity,
      });
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      searchName: "",
      hiringCompany: "",
      hrCompany: "",
      jobRole: "",
      skills: "",
      companyLocation: "",
      remoteWork: false,
      contractHiring: false,
      resumeLink: "",
      numCandidates: 5,
      jdFile: null,
      excelFile: null,
      noticePeriod: "",
    });
    setResumeSource('link');
    setSelectedTaskId(null);
    setSourceType('blank');
  };

  const handleSourceTypeChange = (val: 'blank' | 'task') => {
    setSourceType(val);
    setSelectedTaskId(null);
    // Don't reset form data immediately - let user decide
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center space-x-2">
        <ListChecks className="w-7 h-7 text-primary" />
        <span>Create Shortlist</span>
      </h1>
      <p className="text-muted-foreground mb-6">
        Fill in job details and upload resumes to start candidate shortlisting.
      </p>

      {/* Task Import Section */}
      <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Database className="w-5 h-5 text-primary" />
            <span>Import From Task (Optional)</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Import Option</label>
              <Select value={sourceType} onValueChange={handleSourceTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose import option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Start from scratch</SelectItem>
                  <SelectItem value="task">Import from assigned task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sourceType === 'task' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Task
                </label>
                <Select
                  value={selectedTaskId || ''}
                  onValueChange={setSelectedTaskId}
                  disabled={loadingTasks}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingTasks ? 'Loading tasks...' : 'Select a task'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {taskOptions.length === 0 && !loadingTasks ? (
                      <SelectItem value="no-options" disabled>
                        No tasks found
                      </SelectItem>
                    ) : (
                      taskOptions.map((task: any) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.title || `Task ID ${task.id}`}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Building className="w-5 h-5 text-primary" />
              <span>Job & Company Info</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <IconInput
              label="Search Name"
              icon={ListChecks}
              value={formData.searchName}
              onChange={(val) => setFormData({ ...formData, searchName: val })}
              placeholder="Eg. iOS Developer shortlist"
            />
            <IconInput
              label="Hiring Company"
              icon={Building}
              value={formData.hiringCompany}
              onChange={(val) =>
                setFormData({ ...formData, hiringCompany: val })
              }
              placeholder="Eg. TechCorp Ltd"
            />
            <IconInput
              label="HR Company"
              icon={User}
              value={formData.hrCompany}
              onChange={(val) => setFormData({ ...formData, hrCompany: val })}
              placeholder="Eg. RecruitX"
            />
            <IconInput
              label="Job Role"
              icon={User}
              value={formData.jobRole}
              onChange={(val) => setFormData({ ...formData, jobRole: val })}
              placeholder="Eg. iOS Developer"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2  items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Skills</span>
              </label>
              <Textarea
                required
                value={formData.skills}
                placeholder="Eg. Swift, SwiftUI, Xcode"
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                className="bg-background/50 border-border focus:border-primary focus:ring-primary/20 min-h-[80px]"
              />
            </div>
            <IconInput
              label="Company Location"
              icon={MapPin}
              value={formData.companyLocation}
              onChange={(val) =>
                setFormData({ ...formData, companyLocation: val })
              }
              placeholder="Eg. Bangalore"
            />

            {/* Checkboxes */}
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.remoteWork}
                  onChange={(e) =>
                    setFormData({ ...formData, remoteWork: e.target.checked })
                  }
                  className="w-4 h-4 text-primary"
                />
                <span className="flex items-center text-sm font-medium">
                  <Wifi className="w-4 h-4 mr-1" /> Remote Work
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.contractHiring}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractHiring: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary"
                />
                <span className="flex items-center text-sm font-medium">
                  <FileText className="w-4 h-4 mr-1" /> Contract Hiring
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <Card className="glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Upload className="w-5 h-5 text-primary" />
              <span>Resume & JD Upload</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Resume Source
              </label>
              <Tabs value={resumeSource} onValueChange={(val) => setResumeSource(val as 'link' | 'excel')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="link">Drive Link</TabsTrigger>
                  <TabsTrigger value="excel">Excel File</TabsTrigger>
                </TabsList>
                <TabsContent value="link" className="mt-0">
                  <IconInput
                    label="Resume Link (Google Drive/Sheet)"
                    icon={Upload}
                    value={formData.resumeLink}
                    onChange={(val) => setFormData({ ...formData, resumeLink: val })}
                    placeholder="Eg. https://drive.google.com/..."
                    required={resumeSource === 'link'}
                  />
                </TabsContent>
                <TabsContent value="excel" className="mt-0">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Upload Excel/CSV
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${excelDragOver ? "border-primary bg-primary/10" : "border-muted"
                        }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setExcelDragOver(true);
                      }}
                      onDragLeave={() => setExcelDragOver(false)}
                      onDrop={handleExcelDrop}
                      onClick={() => document.getElementById("excelFileInput")?.click()}
                    >
                      <FileSpreadsheet className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop Excel here, or click to upload
                      </p>
                      {formData.excelFile && (
                        <p className="mt-2 text-sm text-primary font-medium">
                          {formData.excelFile.name}
                        </p>
                      )}
                      <input
                        type="file"
                        id="excelFileInput"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        onChange={handleExcelFileChange}
                        required={resumeSource === 'excel'}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <IconInput
              label="Number of Candidates"
              icon={ListChecks}
              type="number"
              value={formData.numCandidates.toString()}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  numCandidates: parseInt(val) || 0,
                })
              }
              placeholder="Eg. 5"
            />

            {/* Notice Period */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Notice Period
              </label>
              <Select
                value={formData.noticePeriod}
                onValueChange={(val) =>
                  setFormData({ ...formData, noticePeriod: val })
                }
                required
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="Select notice period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 weeks">2 Weeks</SelectItem>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="2 months">2 Months</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="more">More than 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Drag & Drop JD Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${dragOver ? "border-primary bg-primary/10" : "border-muted"
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("jdFileInput")?.click()}
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag & drop JD here, or click to upload
              </p>
              {formData.jdFile && (
                <p className="mt-2 text-sm text-primary font-medium">
                  {formData.jdFile.name}
                </p>
              )}
              <input
                type="file"
                id="jdFileInput"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit & Reset */}
      <div className="flex justify-center space-x-4 pt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <Button
          type="submit"
          disabled={submitting}
          className="btn-primary min-w-[200px]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <ListChecks className="w-4 h-4" />
              Submit Shortlist
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="btn-secondary min-w-[120px]"
        >
          Reset
        </Button>
      </div>
    </form>
  );
};

export default ShortlistForm;