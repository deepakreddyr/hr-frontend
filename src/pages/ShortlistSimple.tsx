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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        className="pl-9 bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
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
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "jdFile" && value) {
          payload.append("jdFile", value as File);
        } else {
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
    });
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
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
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
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
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
                className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20 min-h-[80px]"
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
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-accent" />
              <span>Resume & JD Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <IconInput
              label="Resume Link (Google Drive/Sheet)"
              icon={Upload}
              value={formData.resumeLink}
              onChange={(val) => setFormData({ ...formData, resumeLink: val })}
              placeholder="Eg. https://drive.google.com/..."
            />
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

            {/* Drag & Drop JD Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                dragOver ? "border-primary bg-primary/10" : "border-muted"
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
      <div className="flex justify-center space-x-4">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-primary hover:bg-primary/90 px-6 py-2 flex items-center"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Shortlist"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="border-primary/30 hover:bg-primary/10 px-6 py-2"
        >
          Reset
        </Button>
      </div>
    </form>
  );
};

export default ShortlistForm;