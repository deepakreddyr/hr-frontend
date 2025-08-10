import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Phone, Heart, UserCheck, Star, Filter, Download, SortAsc, Search, CheckSquare, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Results = () => {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
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

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(`${REACT_APP_API_URL}/api/results?searchID=${searchId}`, {
        withCredentials: true,
      });
        console.log(res);
        setCandidates(res.data.candidates || []);
        setStats({
          shortlisted: res.data.total,
          callsScheduled: res.data.calls_scheduled,
          rescheduled: res.data.rescheduled_calls,
          total: res.data.total
        });
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };
    if (searchId) fetchCandidates();
  }, [searchId]);


  const handleCandidateSelect = (candidateId: number) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const handleLikeToggle = async (candidateId: number, currentLiked: boolean) => {
    try {
      await axios.post(`${REACT_APP_API_URL}/like-candidate`, {
        withCredentials: true,
        candidate_id: candidateId,
        liked: !currentLiked
      });
      setCandidates(prev =>
        prev.map(c => (c.id === candidateId ? { ...c, liked: !currentLiked } : c))
      );
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleAddToFinalSelects = async () => {
    try {
      await axios.post(`${REACT_APP_API_URL}/add-final-select`, {
        withCredentials: true,
        candidate_ids: selectedCandidates
      });
      setShowFinalSuccess(true);

    setTimeout(() => {
      setShowFinalSuccess(false);
    }, 3000);
    } catch (error) {
      console.error("Failed to add to final selects:", error);
    }
  };

  const handleViewFinalSelects = () => {
    navigate('/final-selects');
  };

  const handleCallCandidate = async (candidate) => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/call-single`, {
      name: candidate.name,
      phone: candidate.phone,
      skills: candidate.skills,
      company: candidate.company || '',
      candidate_id: candidate.id,
    }, { withCredentials: true });

    setCallSuccessName(candidate.name);
    setShowCallSuccess(true);

    // Hide the message after 3 seconds
    setTimeout(() => {
      setShowCallSuccess(false);
    }, 3000);
  } catch (error) {
    console.error("Failed to call candidate", error);
    alert("Failed to call candidate.");
  }
};

const handleCallSelectedCandidates = async () => {
  try {
    const selected = candidates.filter(c => selectedCandidates.includes(c.id));
    const payload = selected.map(c => ({
      name: c.name,
      phone: c.phone,
      skills: c.skills,
      company: c.company || '',
      candidate_id: c.id
    }));

    const res = await axios.post(`${REACT_APP_API_URL}/call`, {
      candidates: payload
    }, { withCredentials: true });

    
    setShowCallSuccess(true);

    // Hide the message after 3 seconds
    setTimeout(() => {
      setShowCallSuccess(false);
    }, 3000);
  } catch (error) {
    console.error("Failed to call selected candidates", error);
    alert("Failed to initiate calls.");
  }
};

const handleCallAllCandidates = async () => {
  try {
    const payload = candidates.map(c => ({
      name: c.name,
      phone: c.phone,
      skills: c.skills,
      company: c.company || '',
      candidate_id: c.id
    }));

    const res = await axios.post(`${REACT_APP_API_URL}/call`, {
      candidates: payload
    }, { withCredentials: true });

    alert("Calls initiated for all candidates");
  } catch (error) {
    console.error("Failed to call all candidates", error);
    alert("Failed to initiate calls.");
  }
};

  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === 'liked') return candidate.liked && matchesSearch;
      if (filter === 'completed') return candidate.call_status === 'completed' && matchesSearch;
      if (filter === 'high-match') return candidate.match_score >= 90 && matchesSearch;

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'match_score') return b.match_score - a.match_score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'call_status') return a.call_status.localeCompare(b.call_status);
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'scheduled': return 'text-blue-400 bg-blue-400/20';
      case 'rescheduled': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
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
        <p className="text-lg font-medium text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
          <p className="text-muted-foreground">Found {candidates.length} candidates for search #{searchId}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleViewFinalSelects} className="bg-accent hover:bg-accent/90 text-white glow-accent">
            <UserCheck className="w-4 h-4 mr-2" />
            View Final Selects
          </Button>
          <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Repeat Cards for stats */}
        {[
          { label: "Shortlisted Count", value: stats.shortlisted, icon: <CheckSquare />, color: "primary" },
          { label: "Calls Scheduled", value: stats.callsScheduled, icon: <Phone />, color: "blue-400" },
          { label: "Re-Scheduled", value: stats.rescheduled, icon: <Phone />, color: "yellow-400" },
          { label: "Total Found", value: stats.total, icon: <Star />, color: "accent" }
        ].map((stat, idx) => (
          <Card key={idx} className={`bg-card/50 backdrop-blur-sm border-${stat.color}/20`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-8 h-8 text-${stat.color}`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-background border border-primary/30 rounded-lg px-3 py-2 text-foreground"
                >
                  <option value="all">All Candidates</option>
                  <option value="liked">Liked Only</option>
                  <option value="completed">Calls Completed</option>
                  <option value="high-match">High Match (90+)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <SortAsc className="w-5 h-5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background border border-primary/30 rounded-lg px-3 py-2 text-foreground"
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
                className="pl-10 bg-background border-primary/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Candidate Results</span>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCandidates.length === candidates.length}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
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
                  <TableRow
                    key={candidate.id}
                    className="hover:bg-primary/5 cursor-pointer"
                    onClick={() => navigate(`/transcript/${candidate.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleCandidateSelect(candidate.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.skills}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.phone}</TableCell>
                    <TableCell>{candidate.totalExp}</TableCell>
                    <TableCell>{candidate.relevantExp}</TableCell>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/30"
                          onClick={() => handleCallCandidate(candidate)}  // <-- updated
                        >
                          Call
                        </Button>
                        <button
                          onClick={() => handleLikeToggle(candidate.id, candidate.liked)}
                          className="p-1 hover:bg-accent/10 rounded"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              candidate.liked ? 'text-red-400 fill-current' : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCallAllCandidates}>
                <Phone className="w-4 h-4 mr-2" />
                Call All
              </Button>
              <Button
                disabled={selectedCandidates.length === 0}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
                onClick={handleCallSelectedCandidates}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Selected ({selectedCandidates.length})
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleAddToFinalSelects}
                disabled={selectedCandidates.length === 0}
                className="bg-accent hover:bg-accent/90 glow-accent"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Add to Final Selects
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {showCallSuccess && (
      <div className="fixed bottom-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up z-50">
        ✅ Call to <strong>{callSuccessName}</strong> initiated successfully!
      </div>
    )}
    {showFinalSuccess && (
  <div className="fixed bottom-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up z-50">
    🎉 Selected candidates added to <strong>Final Selects</strong>!
  </div>
)}
  
    </div>
  );
};

export default Results;
