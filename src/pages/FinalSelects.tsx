import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Heart, 
  UserCheck, 
  Star, 
  Filter, 
  Download, 
  Trash2,
  Search,
  SortAsc,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const FinalSelects = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; count: number } | null>(null);
  const bulkMenuRef = useRef<HTMLDivElement>(null);

  // Mock data for final selected candidates
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinalCandidates = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/final-selects`, {
          headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        });
        const data = await res.json();
        setCandidates(data.candidates || []);
      } catch (err) {
        console.error("Failed to fetch final selects", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalCandidates();
  }, []);

  // Close bulk menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) {
        setShowBulkMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCandidateSelect = (candidateId: number) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const handleMarkAsJoined = async (candidateId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/final-selects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          joined: [{ candidate_id: candidateId, joined: !currentStatus }]
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        setCandidates(prev =>
          prev.map(candidate =>
            candidate.id === candidateId
              ? { ...candidate, joined: !currentStatus }
              : candidate
          )
        );
      } else {
        console.error("Failed to update join status:", data);
      }
    } catch (err) {
      console.error("Failed to update join status", err);
    }
  };

  const handleRemoveFromFinalList = async (candidateId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/remove-final-select`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ candidate_id: candidateId })
      });

      const data = await res.json();
      if (data.status === "success") {
        setCandidates(prev => prev.filter(c => c.id !== candidateId));
      }
    } catch (err) {
      console.error("Failed to remove candidate from final list", err);
    }
  };

  // Bulk action handlers
  const handleBulkMarkAsJoined = async () => {
    try {
      const joinedUpdates = selectedCandidates.map(candidateId => ({
        candidate_id: candidateId,
        joined: true
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/final-selects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joined: joinedUpdates })
      });

      const data = await res.json();
      if (data.status === "success") {
        setCandidates(prev =>
          prev.map(candidate =>
            selectedCandidates.includes(candidate.id)
              ? { ...candidate, joined: true }
              : candidate
          )
        );
        setSelectedCandidates([]);
        setShowBulkMenu(false);
      }
    } catch (err) {
      console.error("Failed to bulk update join status", err);
    }
  };

  const handleBulkUndoJoined = async () => {
    try {
      const joinedUpdates = selectedCandidates.map(candidateId => ({
        candidate_id: candidateId,
        joined: false
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/final-selects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joined: joinedUpdates })
      });

      const data = await res.json();
      if (data.status === "success") {
        setCandidates(prev =>
          prev.map(candidate =>
            selectedCandidates.includes(candidate.id)
              ? { ...candidate, joined: false }
              : candidate
          )
        );
        setSelectedCandidates([]);
        setShowBulkMenu(false);
      }
    } catch (err) {
      console.error("Failed to bulk undo join status", err);
    }
  };

  const handleBulkDelete = () => {
    setConfirmAction({ type: 'delete', count: selectedCandidates.length });
    setShowConfirmDialog(true);
    setShowBulkMenu(false);
  };

  const confirmBulkAction = async () => {
    if (!confirmAction) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/final-selects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          remove_from_final: selectedCandidates 
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        setCandidates(prev => prev.filter(c => !selectedCandidates.includes(c.id)));
        setSelectedCandidates([]);
        setShowConfirmDialog(false);
        setConfirmAction(null);
      }
    } catch (err) {
      console.error("Failed to bulk delete candidates", err);
    }
  };

  const cancelBulkAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleExportCSV = () => {
    // Define CSV headers
    const headers = [
      'Name',
      'Email', 
      'Phone',
      'Skills',
      'Total Experience',
      'Relevant Experience',
      'Match Score (%)',
      'Status',
      'Joined',
      'Summary'
    ];

    // Convert candidates data to CSV format
    const csvData = filteredCandidates.map(candidate => [
      candidate.name,
      candidate.email,
      candidate.phone,
      candidate.skills,
      candidate.totalExp,
      candidate.relevantExp,
      candidate.matchScore,
      candidate.status.replace('_', ' '),
      candidate.joined ? 'Yes' : 'No',
      candidate.summary?.replace(/,/g, ';') || '' // Replace commas to avoid CSV issues
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `final_selects_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'joined': return 'text-green-400 bg-green-400/20';
      case 'offer_extended': return 'text-blue-400 bg-blue-400/20';
      case 'interviewed': return 'text-yellow-400 bg-yellow-400/20';
      case 'pending': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-400/20';
    if (score >= 80) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'joined') return candidate.joined && matchesSearch;
    if (filter === 'pending') return !candidate.joined && matchesSearch;
    if (filter === 'high-score') return candidate.matchScore >= 90 && matchesSearch;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Final Selects</h1>
          <p className="text-muted-foreground">
            {candidates.length} candidates selected for final consideration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          <div className="relative" ref={bulkMenuRef}>
            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              disabled={selectedCandidates.length === 0}
              onClick={() => setShowBulkMenu(!showBulkMenu)}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Bulk Actions ({selectedCandidates.length})
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            
            {/* Bulk Actions Menu */}
            {showBulkMenu && selectedCandidates.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-primary/20 rounded-lg shadow-lg backdrop-blur-sm z-50">
                <div className="p-2 space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-green-400 hover:bg-green-400/10 hover:text-green-400"
                    onClick={handleBulkMarkAsJoined}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Joined
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400"
                    onClick={handleBulkUndoJoined}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Undo Joined
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-400/10 hover:text-red-400"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Selects</p>
                <p className="text-2xl font-bold text-primary">{candidates.length}</p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-green-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="text-2xl font-bold text-green-400">
                  {candidates.filter(c => c.joined).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-accent">
                  {Math.round(candidates.reduce((acc, c) => acc + c.matchScore, 0) / candidates.length)}%
                </p>
              </div>
              <Star className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-background border border-primary/30 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Candidates</option>
                  <option value="joined">Joined Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="high-score">High Score (90+)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <SortAsc className="w-5 h-5 text-muted-foreground" />
                <select className="bg-background border border-primary/30 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Sort by Match Score</option>
                  <option>Sort by Name</option>
                  <option>Sort by Status</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-primary/30 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Final Selected Candidates</span>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCandidates.length === candidates.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary bg-background border-primary/30 rounded focus:ring-primary/20"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Exp</TableHead>
                  <TableHead>Relevant Exp</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow 
                    key={candidate.id} 
                    className="border-primary/20 hover:bg-primary/5 cursor-pointer"
                    onClick={() => navigate(`/transcript/${candidate.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleCandidateSelect(candidate.id)}
                        className="w-4 h-4 text-primary bg-background border-primary/30 rounded focus:ring-primary/20"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.skills}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.phone}</TableCell>
                    <TableCell className="text-foreground">{candidate.totalExp}</TableCell>
                    <TableCell className="text-foreground">{candidate.relevantExp}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(candidate.matchScore)}`}>
                        {candidate.matchScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {candidate.joined ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsJoined(candidate.id, candidate.joined)}
                          className={`${
                            candidate.joined
                              ? 'border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10'
                              : 'border-green-400/30 text-green-400 hover:bg-green-400/10'
                          }`}
                        >
                          {candidate.joined ? 'Undo Joined' : 'Mark Joined'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromFinalList(candidate.id)}
                          className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No candidates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-destructive/30 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Confirm Deletion</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-foreground mb-6">
              Are you sure you want to remove <span className="font-semibold text-destructive">{confirmAction?.count}</span> candidates from the final list?
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelBulkAction}
                className="border-border hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBulkAction}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove {confirmAction?.count} Candidates
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalSelects;