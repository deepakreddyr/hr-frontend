import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Heart, UserCheck, Star, Filter, Download, SortAsc, Search, CheckSquare, Users, Plus, Edit3, Trash2, AlertTriangle, TrendingUp, ChevronDown, XCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CandidateFormModal from '@/components/CandidateFormModal';

const toast = {
  success: (message: string) => console.log(`TOAST SUCCESS: ${message}`),
  error: (message: string) => console.error(`TOAST ERROR: ${message}`),
  warning: (message: string) => console.warn(`TOAST WARNING: ${message}`),
};

interface AnalysisReport {
  global_rank?: number;
  tournament_rationale?: string;
  tournament_final_score?: number;
  scoring_tier?: string;
  strengths?: string[];
  weaknesses?: string[];
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
  match_score: number;
  summary: string;
  call_status: string;
  company?: string;
  analysis_report?: AnalysisReport;
}

const Results: React.FC = () => {
  const { searchId } = useParams<{ searchId: string }>();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('match_score');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    shortlisted: 0,
    callsScheduled: 0,
    rescheduled: 0,
    total: 0
  });
  const [showCallSuccess, setShowCallSuccess] = useState(false);
  const [callSuccessName, setCallSuccessName] = useState('');
  const [showFinalSuccess, setShowFinalSuccess] = useState(false);
  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [savedCustomQuestion, setSavedCustomQuestion] = useState('');

  // ── Bulk call state ────────────────────────────────────────────────────────
  const [bulkCallSession, setBulkCallSession] = useState<{ bulkListId: string; total: number } | null>(null);
  const [bulkCallProgress, setBulkCallProgress] = useState<{
    completed: number; in_progress: number; pending: number; failed: number; done: boolean;
  } | null>(null);
  const [isBulkCalling, setIsBulkCalling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // State for CandidateFormModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToEditId, setCandidateToEditId] = useState<number | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    candidateId: number | null;
    candidateName: string;
  }>({
    show: false,
    candidateId: null,
    candidateName: ''
  });

  // --- MODAL HANDLERS ---
  const handleOpenAddModal = () => {
    setCandidateToEditId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (candidateId: number) => {
    setCandidateToEditId(candidateId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCandidateToEditId(null);
  };

  const handleCandidateSuccess = (newOrUpdatedCandidate: Candidate) => {
    setCandidates(prev => {
      const existingIndex = prev.findIndex(c => c.id === newOrUpdatedCandidate.id);

      if (existingIndex !== -1) {
        // Update existing candidate
        return prev.map((c, index) =>
          index === existingIndex ? newOrUpdatedCandidate : c
        );
      } else {
        // Add new candidate
        return [newOrUpdatedCandidate, ...prev];
      }
    });

    // Update stats when adding new candidate
    if (!candidates.find(c => c.id === newOrUpdatedCandidate.id)) {
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        shortlisted: prev.shortlisted + 1
      }));
    }
  };

  // --- DELETE HANDLERS WITH CONFIRMATION ---
  const handleDeleteClick = (candidateId: number, candidateName: string) => {
    setDeleteConfirmation({
      show: true,
      candidateId,
      candidateName
    });
  };

  const handleConfirmDelete = async () => {
    const { candidateId, candidateName } = deleteConfirmation;

    if (!candidateId) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/candidate`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          candidate_id: candidateId
        }
      });

      toast.success(`Candidate ${candidateName} deleted successfully.`);

      // Remove the candidate from the local state
      setCandidates(prev => prev.filter(c => c.id !== candidateId));

      // Update stats 
      setStats(prev => ({
        ...prev,
        total: prev.total > 0 ? prev.total - 1 : 0,
        shortlisted: prev.shortlisted > 0 ? prev.shortlisted - 1 : 0
      }));

    } catch (error: any) {
      console.error("Failed to delete candidate:", error);
      toast.error(`Failed to delete candidate: ${error.response?.data?.error || "Server error"}`);
    } finally {
      setDeleteConfirmation({ show: false, candidateId: null, candidateName: '' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, candidateId: null, candidateName: '' });
  };

  useEffect(() => {
    const fetchSearchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        // 1. Fetch Candidates
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/results?searchID=${searchId}`, { headers });

        const fetchedCandidates: Candidate[] = (res.data.candidates || []).map((c: any) => ({
          ...c,
          match_score: parseFloat(c.match_score) || 0,
          // Ensure experience fields are strings
          total_experience: c.totalExp ? String(c.totalExp) : '',
          relevant_work_experience: c.relevantExp ? String(c.relevantExp) : '',
          analysis_report: c.analysis_report || null,
        }));

        setCandidates(fetchedCandidates);
        setStats({
          shortlisted: res.data.total,
          callsScheduled: res.data.calls_scheduled,
          rescheduled: res.data.rescheduled_calls,
          total: res.data.total
        });

        // 2. Fetch Saved Custom Question 
        const questionRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/custom-question?search_id=${searchId}`, { headers });
        if (questionRes.data.success) {
          setSavedCustomQuestion(questionRes.data.custom_question || '');
        }

      } catch (error) {
        console.error("Error fetching search data:", error);
        toast.error("Failed to fetch candidate data.");
      } finally {
        setLoading(false);
      }
    };
    if (searchId) fetchSearchData();
  }, [searchId]);

  // Calculate filtered candidates based on current filter and search
  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (filter) {
        case 'liked':
          return candidate.liked;
        case 'high-match':
          return candidate.match_score >= 90;
        case 'Called & Answered':
          return candidate.call_status === 'Called & Answered';
        case 'Re-schedule':
          return candidate.call_status === 'Re-schedule';
        case 'not_called':
          return candidate.call_status === 'not_called';
        case 'all':
        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (sortBy === 'match_score') return b.match_score - a.match_score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'call_status') return a.call_status.localeCompare(b.call_status);
      return 0;
    });

  // Get currently selected candidates that are also in the filtered list
  const getSelectedFilteredCandidates = () => {
    return filteredCandidates.filter(c => selectedCandidates.includes(c.id));
  };

  // Clear selections when filter changes to avoid confusion
  useEffect(() => {
    setSelectedCandidates([]);
  }, [filter, searchTerm]);

  // ── Bulk call progress polling ─────────────────────────────────────────────
  useEffect(() => {
    if (!bulkCallSession) return;

    const token = localStorage.getItem('access_token');
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bulk-call-status?bulk_list_id=${bulkCallSession.bulkListId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const prog = res.data;
        setBulkCallProgress(prog);

        if (prog.done) {
          clearInterval(interval);
          setIsBulkCalling(false);
          toast.success(`Bulk call complete — ${prog.completed} / ${prog.total} connected.`);
        }
      } catch (err) {
        console.error('Bulk call status poll error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bulkCallSession]);

  const handleCandidateSelect = (candidateId: number) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredCandidates.map(c => c.id);
    const allFilteredSelected = filteredIds.length > 0 &&
      filteredIds.every(id => selectedCandidates.includes(id));

    if (allFilteredSelected) {
      // Deselect all filtered candidates
      setSelectedCandidates(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered candidates (merge with existing selections)
      setSelectedCandidates(prev => {
        const newSelections = [...prev];
        filteredIds.forEach(id => {
          if (!newSelections.includes(id)) {
            newSelections.push(id);
          }
        });
        return newSelections;
      });
    }
  };

  const handleLikeToggle = async (candidateId: number, currentLiked: boolean) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/like-candidate`, {
        candidate_id: candidateId,
        liked: !currentLiked
      }, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        }
      },);
      setCandidates(prev =>
        prev.map(c => (c.id === candidateId ? { ...c, liked: !currentLiked } : c))
      );
    } catch (err) {
      console.error("Failed to toggle like", err);
      toast.error("Failed to update like status.");
    }
  };

  const handleAddToFinalSelects = async () => {
    const selectedFiltered = getSelectedFilteredCandidates();

    if (selectedFiltered.length === 0) {
      toast.warning("No candidates selected from the current filtered view.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/add-final-select`, {
        candidate_ids: selectedFiltered.map(c => c.id)
      }, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        }
      },);
      setShowFinalSuccess(true);
      setTimeout(() => {
        setShowFinalSuccess(false);
      }, 3000);
      toast.success(`${selectedFiltered.length} candidates added to Final Selects.`);

      setSelectedCandidates([]);
    } catch (error) {
      console.error("Failed to add to final selects:", error);
      toast.error("Failed to add candidates to final selects.");
    }
  };

  const handleAddCustomQuestion = () => {
    setCustomQuestion(savedCustomQuestion);
    setGeneratedOptions([]);
    setShowCustomQuestionModal(true);
  };

  const handleSelectGeneratedOption = (question: string) => {
    setCustomQuestion(question);
  };

  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("access_token");

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/get-questions?search_id=${searchId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.success && res.data.questions && res.data.questions.length > 0) {
        setGeneratedOptions(res.data.questions);
        if (!customQuestion.trim()) {
          setCustomQuestion(res.data.questions[0]);
        }
        toast.success("AI questions generated successfully. Please select one or edit the text box.");
      } else {
        toast.error("AI failed to generate questions. Please try again or enter a custom one.");
      }
    } catch (error: any) {
      console.error("Failed to generate question", error.response?.data || error.message);
      toast.error(`Failed to generate question: ${error.response?.data?.error || "Server error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCustomQuestion = async () => {
    if (!customQuestion.trim()) {
      toast.warning("Please enter or select a question to save.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/custom-question`, {
        search_id: searchId,
        question: customQuestion
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      toast.success("Custom question saved successfully!");
      setSavedCustomQuestion(customQuestion);
      setShowCustomQuestionModal(false);
      setCustomQuestion('');
      setGeneratedOptions([]);

    } catch (error: any) {
      console.error("Failed to save custom question", error.response?.data || error.message);
      toast.error(`Failed to save custom question: ${error.response?.data?.error || "Server error"}`);
    }
  };

  const handleViewFinalSelects = () => {
    navigate('/final-selects');
  };

  const handleExportCandidates = () => {
    if (filteredCandidates.length === 0) {
      toast.warning("No candidates in the current filtered view to export.");
      return;
    }

    try {
      const headers = [
        "Name", "Email", "Phone", "Total Exp", "Relevant Exp", "Match Score (%)", "Call Status", "Liked", "Skills"
      ];

      const csvRows = filteredCandidates.map(c => [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email.replace(/"/g, '""')}"`,
        `"${c.phone.replace(/"/g, '""')}"`,
        c.total_experience || '-',
        c.relevant_work_experience || '-',
        c.match_score,
        `"${c.call_status.replace(/"/g, '""')}"`,
        c.liked ? 'Yes' : 'No',
        `"${c.skills.replace(/"/g, '""')}"`
      ].join(','));

      const csvString = [
        headers.join(','),
        ...csvRows
      ].join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Search_${searchId}_Candidates_Export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredCandidates.length} candidates to CSV.`);

    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export candidate data.");
    }
  };

  const handleCallCandidate = async (candidate: Candidate) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/call-single`, {
        search_id: searchId,
        name: candidate.name,
        phone: candidate.phone,
        skills: candidate.skills,
        company: candidate.company || '',
        candidate_id: candidate.id,
      }, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        }
      },);
      setCallSuccessName(candidate.name);
      setShowCallSuccess(true);
      setTimeout(() => {
        setShowCallSuccess(false);
      }, 3000);
      toast.success(`Call initiated for ${candidate.name}.`);
    } catch (error) {
      console.error("Failed to call candidate", error);
      toast.error("Failed to initiate call for candidate.");
    }
  };

  // ── Shared helper: kick off a bulk call session ───────────────────────────
  const launchBulkCall = async (candidateList: Candidate[]) => {
    if (isBulkCalling) {
      toast.warning('A bulk call is already in progress.');
      return;
    }
    setIsBulkCalling(true);
    setBulkCallProgress(null);
    setBulkCallSession(null);

    const token = localStorage.getItem('access_token');
    try {
      const payload = candidateList.map(c => ({
        name: c.name,
        phone: c.phone,
        skills: c.skills,
        candidate_id: c.id,
      }));

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bulk-call`,
        { search_id: searchId, candidates: payload, max_concurrent_calls: 2 },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const { bulk_list_id, total } = res.data;
      setBulkCallSession({ bulkListId: bulk_list_id, total });
      setBulkCallProgress({ completed: 0, in_progress: 0, pending: total, failed: 0, done: false });
      toast.success(`Bulk call started for ${total} candidates (max 2 concurrent).`);
      setSelectedCandidates([]);
    } catch (error: any) {
      console.error('Bulk call failed', error);
      toast.error(`Failed to start bulk call: ${error.response?.data?.error || 'Server error'}`);
      setIsBulkCalling(false);
    }
  };

  const handleCallSelectedCandidates = async () => {
    const selectedFiltered = getSelectedFilteredCandidates();
    if (selectedFiltered.length === 0) {
      toast.warning('No candidates selected from the current filtered view.');
      return;
    }
    await launchBulkCall(selectedFiltered);
  };

  const handleCallAllCandidates = async () => {
    if (filteredCandidates.length === 0) {
      toast.warning('No candidates in the current filtered view.');
      return;
    }
    await launchBulkCall(filteredCandidates);
  };

  const handleCancelBulkCall = async () => {
    setIsCancelling(true);
    const token = localStorage.getItem('access_token');
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bulk-call-cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Bulk call campaign cancelled.');
    } catch (err: any) {
      console.error('Cancel error', err);
      toast.error('Failed to cancel bulk call.');
    } finally {
      setBulkCallSession(null);
      setBulkCallProgress(null);
      setIsBulkCalling(false);
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Called & Answered': return 'text-green-400 bg-green-400/20';
      case 'Re-schedule': return 'text-yellow-400 bg-yellow-400/20';
      case 'scheduled': return 'text-blue-400 bg-blue-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      case 'not_called':
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-400/20';
    if (score >= 80) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  // Fallback for empty results
  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
            <p className="text-muted-foreground">Search #{searchId}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleOpenAddModal} className="btn-theme-inverse">
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
            <Button onClick={handleViewFinalSelects} className="btn-secondary">
              <UserCheck className="w-4 h-4 mr-2" />
              View Final Selects
            </Button>
          </div>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Shortlisted Count", value: 0, icon: <CheckSquare />, color: "primary" },
            { label: "Calls Scheduled", value: 0, icon: <Phone />, color: "blue-400" },
            { label: "Re-Scheduled", value: 0, icon: <Phone />, color: "yellow-400" },
            { label: "Total Found", value: 0, icon: <Star />, color: "accent" }
          ].map((stat, idx) => (
            <Card key={idx} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="w-8 h-8 text-primary">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}

        </div>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Candidates Shortlisted</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any candidates matching your search criteria. Try adjusting your search parameters or expanding your requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <CandidateFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          candidateId={candidateToEditId}
          searchId={Number(searchId)}
          onSuccess={handleCandidateSuccess}
        />
      </div>
    );
  }

  const selectedFilteredCount = getSelectedFilteredCandidates().length;
  const allFilteredSelected = filteredCandidates.length > 0 &&
    filteredCandidates.every(c => selectedCandidates.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
          <p className="text-muted-foreground">
            Found {candidates.length} candidates for search #{searchId}
            {filter !== 'all' && ` (${filteredCandidates.length} filtered)`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleOpenAddModal} className="btn-theme-inverse">
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
          <Button onClick={handleAddCustomQuestion} className="btn-theme-inverse">
            {savedCustomQuestion ? 'Edit Custom Question' : 'Add Custom Question'}
          </Button>
          <Button onClick={handleViewFinalSelects} className="btn-theme-inverse">
            <UserCheck className="w-4 h-4 mr-2" />
            View Final Selects
          </Button>
          <Button
            onClick={handleExportCandidates}
            variant="outline"
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Shortlisted Count", value: stats.shortlisted, icon: <CheckSquare />, color: "primary" },
          { label: "Calls Scheduled", value: stats.callsScheduled, icon: <Phone />, color: "blue-400" },
          { label: "Re-Scheduled", value: stats.rescheduled, icon: <Phone />, color: "yellow-400" },
          { label: "Total Found", value: stats.total, icon: <Star />, color: "accent" }
        ].map((stat, idx) => (
          <Card key={idx} className="glass-card hover-glow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="w-8 h-8 text-primary">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}

      </div>

      {/* Filter/Sort/Search Bar */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                >
                  <option value="all">All Candidates</option>
                  <option value="liked">Liked Only</option>
                  <option value="high-match">High Match (90+)</option>
                  <option value="Called & Answered">Called & Answered</option>
                  <option value="not_called">Not Called</option>
                  <option value="Re-schedule">Re-schedule</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <SortAsc className="w-5 h-5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                >
                  <option value="match_score">Sort by Match Score</option>
                  <option value="name">Sort by Name</option>
                  <option value="call_status">Sort by Call Status</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Candidate Results ({filteredCandidates.length})</span>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground">
                Select All {filter !== 'all' ? '(Filtered)' : ''}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Exp</TableHead>
                  <TableHead>Relevant Exp</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map(candidate => (
                  <React.Fragment key={candidate.id}>
                    <TableRow
                      className={`transition-colors duration-150 cursor-pointer ${hoveredRow === candidate.id ? 'bg-primary/8 border-b-0' : 'hover:bg-primary/5'
                        }`}
                      onMouseEnter={() => setHoveredRow(candidate.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleCandidateSelect(candidate.id)}
                        />
                      </TableCell>

                      {/* GLOBAL RANK BADGE */}
                      <TableCell>
                        {candidate.analysis_report?.global_rank ? (
                          <div className="flex items-center justify-center">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm ${candidate.analysis_report.global_rank === 1
                                ? 'bg-yellow-400/20 text-yellow-400 ring-1 ring-yellow-400/40'
                                : candidate.analysis_report.global_rank === 2
                                  ? 'bg-slate-400/20 text-slate-300 ring-1 ring-slate-400/40'
                                  : candidate.analysis_report.global_rank === 3
                                    ? 'bg-orange-400/20 text-orange-400 ring-1 ring-orange-400/40'
                                    : 'bg-primary/10 text-primary ring-1 ring-primary/30'
                                }`}
                            >
                              #{candidate.analysis_report.global_rank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs text-center block">—</span>
                        )}
                      </TableCell>

                      <TableCell className="cursor-pointer" onClick={() => navigate(`/transcript/${candidate.id}`)}>
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{candidate.name}</p>
                              {candidate.analysis_report?.tournament_rationale && (
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${hoveredRow === candidate.id ? 'rotate-180 text-primary' : ''
                                    }`}
                                />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{candidate.skills}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                      <TableCell className="text-muted-foreground">{candidate.phone}</TableCell>

                      <TableCell>
                        {candidate.total_experience &&
                          candidate.total_experience !== '0' &&
                          candidate.total_experience.trim() !== ''
                          ? `${candidate.total_experience} yrs`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {candidate.relevant_work_experience &&
                          candidate.relevant_work_experience !== '0' &&
                          candidate.relevant_work_experience.trim() !== ''
                          ? `${candidate.relevant_work_experience} yrs`
                          : '-'}
                      </TableCell>

                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(candidate.match_score)}`}>
                          {candidate.match_score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.call_status)}`}>
                          {candidate.call_status}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(candidate.id)}
                            className="p-1 hover:bg-primary/10 rounded"
                            title="Edit Candidate"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(candidate.id, candidate.name)}
                            className="p-1 hover:bg-red-400/10 rounded"
                            title="Delete Candidate"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/30"
                            onClick={() => handleCallCandidate(candidate)}
                          >
                            Call
                          </Button>
                          <button
                            onClick={() => handleLikeToggle(candidate.id, candidate.liked)}
                            className="p-1 hover:bg-accent/10 rounded"
                          >
                            <Heart
                              className={`w-4 h-4 ${candidate.liked ? 'text-red-400 fill-current' : 'text-muted-foreground'}`}
                            />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* ANIMATED RATIONALE DROPDOWN ROW */}
                    <AnimatePresence>
                      {hoveredRow === candidate.id && candidate.analysis_report?.tournament_rationale && (
                        <tr
                          onMouseEnter={() => setHoveredRow(candidate.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className="bg-primary/5 border-b border-primary/10"
                        >
                          <td colSpan={10} className="p-0 overflow-hidden">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                              <div className="px-6 py-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/15 bg-card/60 backdrop-blur-sm">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Ranking Rationale</span>
                                      {candidate.analysis_report?.scoring_tier && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                          {candidate.analysis_report.scoring_tier}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-foreground/85 leading-relaxed">
                                      {candidate.analysis_report.tournament_rationale}
                                    </p>
                                  </div>
                                  {/* Tournament score pill - centred */}
                                  {/* {candidate.analysis_report?.tournament_final_score && (
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5">
                                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-400/10 ring-1 ring-green-400/20">
                                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                        <span className="text-sm font-bold text-green-400">{candidate.analysis_report.tournament_final_score}</span>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">Score</span>
                                    </div>
                                  )} */}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleCallAllCandidates}
                disabled={isBulkCalling}
              >
                {isBulkCalling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                Call All {filter !== 'all' ? 'Filtered' : ''} ({filteredCandidates.length})
              </Button>
              <Button
                disabled={selectedFilteredCount === 0 || isBulkCalling}
                variant="outline"
                className="border-border hover:bg-primary/10"
                onClick={handleCallSelectedCandidates}
              >
                {isBulkCalling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                Call Selected ({selectedFilteredCount})
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleAddToFinalSelects}
                disabled={selectedFilteredCount === 0}
                className="btn-theme-inverse"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Add to Final Selects ({selectedFilteredCount})
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* SUCCESS TOAST NOTIFICATIONS */}
      {showCallSuccess && (
        <div className="fixed bottom-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up z-50">
          {callSuccessName ? `Call to ${callSuccessName} initiated successfully!` : 'Calls initiated successfully!'}
        </div>
      )}

      {showFinalSuccess && (
        <div className="fixed bottom-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up z-50">
          Selected candidates added to <strong>Final Selects</strong>!
        </div>
      )}

      {/* ── BULK CALL PROGRESS BANNER ─────────────────────────────────────────── */}
      {isBulkCalling && bulkCallProgress && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div className="bg-card border border-primary/30 rounded-2xl shadow-2xl backdrop-blur-md p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: icon + text */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    Bulk Call in Progress
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-primary font-bold">{bulkCallProgress.completed}</span>
                    {' '}completed &nbsp;·&nbsp;
                    <span className="text-yellow-400 font-bold">{bulkCallProgress.in_progress}</span>
                    {' '}calling &nbsp;·&nbsp;
                    <span className="text-muted-foreground">{bulkCallProgress.pending}</span>
                    {' '}pending
                    {bulkCallProgress.failed > 0 && (
                      <> &nbsp;·&nbsp; <span className="text-red-400 font-bold">{bulkCallProgress.failed}</span> failed</>
                    )}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex-1 hidden sm:block">
                <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: bulkCallSession
                        ? `${Math.round(((bulkCallProgress.completed + bulkCallProgress.failed) / bulkCallSession.total) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
                  {bulkCallSession
                    ? `${bulkCallProgress.completed + bulkCallProgress.failed} / ${bulkCallSession.total}`
                    : ''}
                </p>
              </div>

              {/* Cancel button */}
              <button
                onClick={handleCancelBulkCall}
                disabled={isCancelling}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isCancelling
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <XCircle className="w-3 h-3" />}
                {isCancelling ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <Card className="bg-card border-red-400/20 w-full max-w-md">
            <CardHeader className="border-b border-red-400/10">
              <CardTitle className="text-xl flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                Confirm Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-foreground mb-4">
                Are you sure you want to delete this candidate? This action cannot be undone.
              </p>
              <div className="bg-red-400/10 border border-red-400/30 p-4 rounded-lg mb-6">
                <p className="text-sm font-semibold text-red-400">
                  {deleteConfirmation.candidateName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All associated data will be permanently removed.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={handleCancelDelete}
                  variant="outline"
                  className="border-border hover:bg-primary/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CUSTOM QUESTION MODAL */}
      {showCustomQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-primary/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Add Custom Question</CardTitle>
                <button
                  onClick={() => {
                    setShowCustomQuestionModal(false);
                    setCustomQuestion('');
                    setGeneratedOptions([]);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Add a custom screening question that will be asked to candidates during their calls.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* DISPLAY CURRENTLY SAVED QUESTION */}
              {savedCustomQuestion && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-2">
                  <h4 className="text-sm font-semibold text-green-400">
                    <CheckSquare className="w-4 h-4 inline mr-2" />Currently Saved Question:
                  </h4>
                  <p className="text-sm text-foreground italic break-words">"{savedCustomQuestion}"</p>
                  <p className="text-xs text-muted-foreground">
                    Saving a new question below will overwrite this one.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Generate AI Question Options
                  </label>
                  <Button
                    onClick={handleGenerateQuestion}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-accent/30 hover:bg-accent/10"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Generate New Questions
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Let AI generate contextual screening questions based on your job requirements (Can be re-generated).
                </p>
              </div>

              {generatedOptions.length > 0 && (
                <div className="space-y-3 p-4 bg-muted/20 border border-primary/10 rounded-lg">
                  <h4 className="text-sm font-semibold text-foreground">Select a Generated Question to use/edit:</h4>
                  <div className="space-y-2">
                    {generatedOptions.map((question, index) => (
                      <Button
                        key={index}
                        variant={customQuestion === question ? "default" : "outline"}
                        className={`w-full justify-start whitespace-normal h-auto py-2 text-left ${customQuestion === question ? 'glow-accent' : 'border-primary/30 hover:bg-primary/10'}`}
                        onClick={() => handleSelectGeneratedOption(question)}
                      >
                        <span className="font-bold mr-2">{index + 1}.</span> {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">or type your own</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Question to Save (This will be saved to the database)
                </label>
                <textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="E.g., Can you explain your experience with React and state management libraries?"
                  className="w-full h-32 bg-background border border-primary/30 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This question will be added to the standard screening questions for all candidates.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-primary/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomQuestionModal(false);
                    setCustomQuestion('');
                    setGeneratedOptions([]);
                  }}
                  className="border-border hover:bg-primary/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCustomQuestion}
                  disabled={!customQuestion.trim()}
                  className="btn-theme-inverse px-8"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Save Question
                </Button>

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CANDIDATE FORM MODAL (Add/Edit) - This modal has its own confirmation */}
      <CandidateFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        candidateId={candidateToEditId}
        searchId={Number(searchId)}
        onSuccess={handleCandidateSuccess}
      />
    </div>
  );
};

export default Results;