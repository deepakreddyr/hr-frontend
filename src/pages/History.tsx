
import React, { useState } from 'react';
import { Search, Plus, Calendar, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const searches = [
    {
      id: 1,
      rc_name: 'John Smith',
      job_role: 'Senior React Developer',
      key_skills: 'React, TypeScript, Node.js',
      created_at: '2024-01-15',
      candidates_count: 25
    },
    {
      id: 2,
      rc_name: 'Sarah Johnson',
      job_role: 'Product Manager',
      key_skills: 'Product Strategy, Agile, Analytics',
      created_at: '2024-01-14',
      candidates_count: 18
    },
    {
      id: 3,
      rc_name: 'Mike Wilson',
      job_role: 'DevOps Engineer',
      key_skills: 'AWS, Docker, Kubernetes',
      created_at: '2024-01-13',
      candidates_count: 32
    },
    {
      id: 4,
      rc_name: 'Emily Davis',
      job_role: 'UX Designer',
      key_skills: 'Figma, User Research, Prototyping',
      created_at: '2024-01-12',
      candidates_count: 15
    }
  ];

  const filteredSearches = searches.filter(search =>
    search.rc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    search.job_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (searchId: number) => {
    navigate(`/results/${searchId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search History</h1>
          <p className="text-muted-foreground">Track all your recruitment searches and results</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors glow-primary">
          <Plus className="w-4 h-4" />
          <span>Create New Search</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search by recruiter name or job role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Recruiter</span>
                  </div>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Job Role</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Key Skills</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </div>
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Candidates</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSearches.map((search) => (
                <tr
                  key={search.id}
                  onClick={() => handleRowClick(search.id)}
                  className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors group"
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{search.rc_name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-foreground">{search.job_role}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {search.key_skills}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">{search.created_at}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-medium">
                        {search.candidates_count}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSearches.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No searches found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or create a new search.</p>
        </div>
      )}
    </div>
  );
};

export default History;
