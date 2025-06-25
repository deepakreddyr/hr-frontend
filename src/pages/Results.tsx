
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Heart, UserCheck, Star, Filter, Download } from 'lucide-react';

const Results = () => {
  const { searchId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Mock data
  const candidates = [
    {
      id: 1,
      name: 'Alex Rodriguez',
      phone: '+1 (555) 123-4567',
      match_score: 95,
      call_status: 'completed',
      liked: true,
      join_status: false,
      skills: 'React, TypeScript, AWS',
      experience: '5 years'
    },
    {
      id: 2,
      name: 'Sarah Chen',
      phone: '+1 (555) 234-5678',
      match_score: 88,
      call_status: 'pending',
      liked: false,
      join_status: false,
      skills: 'Vue.js, Python, Docker',
      experience: '3 years'
    },
    {
      id: 3,
      name: 'Michael Johnson',
      phone: '+1 (555) 345-6789',
      match_score: 92,
      call_status: 'completed',
      liked: true,
      join_status: true,
      skills: 'Angular, Node.js, MongoDB',
      experience: '7 years'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      phone: '+1 (555) 456-7890',
      match_score: 85,
      call_status: 'failed',
      liked: false,
      join_status: false,
      skills: 'React Native, iOS, Android',
      experience: '4 years'
    }
  ];

  const handleCandidateClick = (candidateId: number) => {
    navigate(`/candidate/${candidateId}`);
  };

  const handleShortlist = () => {
    navigate(`/shortlist/${searchId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-400/20';
    if (score >= 80) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
          <p className="text-muted-foreground">Found {candidates.length} candidates for this search</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleShortlist}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>View Shortlist</span>
          </button>
          <button className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Candidates</option>
          <option value="liked">Liked Only</option>
          <option value="completed">Calls Completed</option>
          <option value="high-match">High Match (90+)</option>
        </select>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
            onClick={() => handleCandidateClick(candidate.id)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{candidate.experience}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {candidate.liked && (
                  <Heart className="w-5 h-5 text-red-400 fill-current" />
                )}
                {candidate.join_status && (
                  <UserCheck className="w-5 h-5 text-green-400" />
                )}
              </div>
            </div>

            {/* Match Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Match Score</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(candidate.match_score)}`}>
                  {candidate.match_score}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${candidate.match_score}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{candidate.phone}</span>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Skills</p>
                <p className="text-sm text-foreground">{candidate.skills}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Call Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.call_status)}`}>
                  {candidate.call_status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-border flex items-center space-x-2">
              <button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                View Profile
              </button>
              <button className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No candidates found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Results;
