import React, { useState, useEffect } from 'react';
import { Heart, Search, Phone, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedProfiles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [savedCandidates, setSavedCandidates] = useState([]);

  useEffect(() => {
    const fetchSavedCandidates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get-liked-candiates`, {
          credentials: 'include',
        });
        const data = await response.json();
        setSavedCandidates(data || []);
      } catch (error) {
        console.error('Failed to fetch saved candidates:', error);
      }
    };

    fetchSavedCandidates();
  }, []);

  const filteredCandidates = savedCandidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.job_role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCandidateClick = (candidateId: number) => {
    navigate(`/transcript/${candidateId}`);
  };

  const handleDelete = async (candidateId: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/unlike-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ candidate_id: candidateId }),
      });

      if (response.ok) {
        setSavedCandidates((prev) =>
          prev.filter((candidate) => candidate.id !== candidateId)
        );
      } else {
        console.error('Failed to unlike candidate');
      }
    } catch (error) {
      console.error('Error unliking candidate:', error);
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
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Heart className="w-8 h-8 mr-3 text-red-400" />
            Saved Profiles
          </h1>
          <p className="text-muted-foreground">Your favorite candidates all in one place</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Saved</p>
          <p className="text-2xl font-bold text-primary">{savedCandidates.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search saved profiles by name, skills, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Saved Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 group relative"
          >
            {/* Favorite Badge */}
            <div className="absolute top-4 right-4">
              <Heart className="w-5 h-5 text-red-400 fill-current" />
            </div>

            {/* Profile Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                {candidate.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {candidate.name}
                </h3>
                <p className="text-sm text-muted-foreground">{candidate.job_role}</p>
              </div>
            </div>

            {/* Match Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Match Score</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(candidate.match_score || 0)}`}>
                  {candidate.match_score || 0}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${candidate.match_score || 0}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{candidate.phone || '-'}</span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Experience</p>
                <p className="text-sm text-foreground">{candidate.total_experience || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Skills</p>
                <p className="text-sm text-foreground line-clamp-2">{candidate.skills || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="text-sm text-foreground">{candidate.location || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Saved on</p>
                <p className="text-sm text-foreground">
                  {candidate.created_at
                    ? new Date(candidate.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCandidateClick(candidate.id)}
                className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Profile</span>
              </button>
              <button
                onClick={() => handleDelete(candidate.id)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'No matching profiles found' : 'No saved profiles yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search terms to find what you\'re looking for.'
              : 'Start saving your favorite candidates to see them here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedProfiles;
