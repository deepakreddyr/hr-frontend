import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Briefcase, FileText, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message}`),
  error: (message: string) => console.error(`TOAST ERROR: ${message}`),
  warning: (message: string) => console.warn(`TOAST WARNING: ${message}`),
};

interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  skills: string;
  total_experience: string;
  relevant_work_experience: string;
  match_score: string;
  summary: string;
  call_status: string;
}

interface Candidate {
  id: number;
  search_id: number;
  user_id: number;
  liked: boolean;
  hiring_status: boolean;
  join_status: boolean;
  created_at?: string;
  updated_at?: string;
  name: string;
  email: string;
  phone: string;
  skills: string;
  total_experience: string;
  relevant_work_experience: string;
  summary: string;
  match_score: number;
  call_status: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  match_score?: string;
}

interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: number | null;
  searchId: number;
  onSuccess?: (candidate: Candidate) => void;
}

const CandidateFormModal: React.FC<CandidateFormModalProps> = ({ 
  isOpen, 
  onClose, 
  candidateId = null, 
  searchId, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<CandidateFormData>({
    name: '',
    email: '',
    phone: '',
    skills: '',
    total_experience: '',
    relevant_work_experience: '',
    match_score: '',
    summary: '',
    call_status: 'not_called'
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  useEffect(() => {
    if (candidateId && isOpen) {
      setIsEditMode(true);
      fetchCandidateData();
    } else {
      setIsEditMode(false);
      resetForm();
    }
  }, [candidateId, isOpen]);

  const fetchCandidateData = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/candidate?candidate_id=${candidateId}`,
        {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success && data.candidate) {
        const candidate: Candidate = data.candidate;
        setFormData({
          name: candidate.name || '',
          email: candidate.email || '',
          phone: candidate.phone || '',
          skills: candidate.skills || '',
          total_experience: candidate.total_experience || '',
          relevant_work_experience: candidate.relevant_work_experience || '',
          match_score: candidate.match_score ? String(candidate.match_score) : '',
          summary: candidate.summary || '',
          call_status: candidate.call_status || 'not_called'
        });
      } else {
        toast.error("Failed to load candidate data");
      }
    } catch (error) {
      console.error("Error fetching candidate:", error);
      toast.error("Failed to load candidate data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      skills: '',
      total_experience: '',
      relevant_work_experience: '',
      match_score: '',
      summary: '',
      call_status: 'not_called'
    });
    setErrors({});
    setShowConfirmation(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    const matchScore = parseFloat(formData.match_score);
    if (formData.match_score && (isNaN(matchScore) || matchScore < 0 || matchScore > 100)) {
      newErrors.match_score = 'Match score must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmitClick = () => {
    console.log("button is clicked");
    // if (!validateForm()) {
    //   toast.warning("Please fix the validation errors");
    //   return;
    // }
    setShowConfirmation(true);
    console.log("confirmationworks")
  };

  const handleConfirmedSubmit = async () => {
    setLoading(true);
    setShowConfirmation(false);
    const token = localStorage.getItem("access_token");
    
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/candidate`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = isEditMode ? {
        candidate_id: candidateId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: formData.skills,
        total_experience: formData.total_experience,
        relevant_work_experience: formData.relevant_work_experience,
        match_score: formData.match_score ? parseFloat(formData.match_score) : 0,
        summary: formData.summary,
        call_status: formData.call_status
      } : {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: formData.skills,
        search_id: searchId,
        total_experience: formData.total_experience,
        relevant_work_experience: formData.relevant_work_experience,
        match_score: formData.match_score ? parseFloat(formData.match_score) : 0,
        summary: formData.summary,
        call_status: formData.call_status
      };
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(isEditMode ? "Candidate updated successfully" : "Candidate added successfully");
        if (onSuccess && data.candidate) {
          onSuccess(data.candidate as Candidate);
        }
        onClose();
        resetForm();
      } else {
        toast.error(data.error || "Failed to save candidate");
      }
    } catch (error) {
      console.error("Error saving candidate:", error);
      toast.error("Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="bg-card border-primary/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="border-b border-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                {isEditMode ? 'Edit Candidate' : 'Add New Candidate'}
              </CardTitle>
              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isEditMode ? 'Update candidate information below' : 'Fill in the details to add a new candidate'}
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading && isEditMode ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`bg-background border-primary/30 ${errors.name ? 'border-red-400' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
                        className={`bg-background border-primary/30 ${errors.email ? 'border-red-400' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                        className={`bg-background border-primary/30 ${errors.phone ? 'border-red-400' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Call Status
                      </label>
                      <select
                        name="call_status"
                        value={formData.call_status}
                        onChange={handleChange}
                        className="w-full bg-background border border-primary/30 rounded-lg px-3 py-2 text-foreground"
                      >
                        <option value="not_called">Not Called</option>
                        <option value="Called & Answered">Called & Answered</option>
                        <option value="Re-schedule">Re-schedule</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Total Experience (Years)
                      </label>
                      <Input
                        name="total_experience"
                        value={formData.total_experience}
                        onChange={handleChange}
                        placeholder="5"
                        className="bg-background border-primary/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Relevant Experience (Years)
                      </label>
                      <Input
                        name="relevant_work_experience"
                        value={formData.relevant_work_experience}
                        onChange={handleChange}
                        placeholder="3"
                        className="bg-background border-primary/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Match Score (0-100)
                      </label>
                      <Input
                        name="match_score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.match_score}
                        onChange={handleChange}
                        placeholder="85"
                        className={`bg-background border-primary/30 ${errors.match_score ? 'border-red-400' : ''}`}
                      />
                      {errors.match_score && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.match_score}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Skills
                    </label>
                    <Input
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, Python, AWS"
                      className="bg-background border-primary/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of skills
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Summary
                    </label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      placeholder="Brief summary of candidate's background and qualifications..."
                      rows={4}
                      className="w-full bg-background border border-primary/30 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
                  <Button
                    onClick={() => {
                      onClose();
                      resetForm();
                    }}
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitClick}
                    disabled={loading}
                    className="bg-accent hover:bg-accent/90 glow-accent"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditMode ? 'Update Candidate' : 'Add Candidate'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <Card className="bg-card border-primary/20 w-full max-w-md">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-accent" />
                Confirm {isEditMode ? 'Update' : 'Addition'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-foreground mb-4">
                Are you sure you want to {isEditMode ? 'update' : 'add'} this candidate?
              </p>
              <div className="bg-muted/20 p-4 rounded-lg mb-6 space-y-2">
                <p className="text-sm"><strong>Name:</strong> {formData.name}</p>
                <p className="text-sm"><strong>Email:</strong> {formData.email}</p>
                <p className="text-sm"><strong>Phone:</strong> {formData.phone}</p>
                {formData.total_experience && (
                  <p className="text-sm"><strong>Total Exp:</strong> {formData.total_experience} years</p>
                )}
                {formData.relevant_work_experience && (
                  <p className="text-sm"><strong>Relevant Exp:</strong> {formData.relevant_work_experience} years</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmedSubmit}
                  className="bg-accent hover:bg-accent/90 glow-accent"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CandidateFormModal;