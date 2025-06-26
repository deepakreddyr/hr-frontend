
import React, { useState } from 'react';
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
  CheckCircle
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

  // Mock data for final selected candidates
  const candidates = [
    {
      id: 1,
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@email.com',
      phone: '+1 (555) 123-4567',
      totalExp: '5 years',
      relevantExp: '4 years',
      matchScore: 95,
      status: 'interviewed',
      joined: false,
      liked: true,
      skills: 'React, TypeScript, AWS'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '+1 (555) 234-5678',
      totalExp: '3 years',
      relevantExp: '3 years',
      matchScore: 88,
      status: 'offer_extended',
      joined: false,
      liked: true,
      skills: 'Vue.js, Python, Docker'
    },
    {
      id: 3,
      name: 'Michael Johnson',
      email: 'michael.j@email.com',
      phone: '+1 (555) 345-6789',
      totalExp: '7 years',
      relevantExp: '6 years',
      matchScore: 92,
      status: 'joined',
      joined: true,
      liked: true,
      skills: 'Angular, Node.js, MongoDB'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 456-7890',
      totalExp: '4 years',
      relevantExp: '3 years',
      matchScore: 85,
      status: 'pending',
      joined: false,
      liked: true,
      skills: 'React Native, iOS, Android'
    }
  ];

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

  const handleMarkAsJoined = (candidateId: number) => {
    console.log('Marking candidate as joined:', candidateId);
  };

  const handleRemoveFromFinalList = (candidateId: number) => {
    console.log('Removing candidate from final list:', candidateId);
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
          >
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10"
            disabled={selectedCandidates.length === 0}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Bulk Actions ({selectedCandidates.length})
          </Button>
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
        <Card className="bg-card/50 backdrop-blur-sm border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Process</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {candidates.filter(c => !c.joined && c.status !== 'pending').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-yellow-400" />
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
                    onClick={() => navigate(`/candidate/${candidate.id}`)}
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
                        {!candidate.joined && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsJoined(candidate.id)}
                            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                          >
                            Mark Joined
                          </Button>
                        )}
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
    </div>
  );
};

export default FinalSelects;
