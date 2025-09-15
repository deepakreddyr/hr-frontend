import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HistorySkeleton from '@/components/ui/HistorySkeleton';


const History = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSearches = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/searches`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setSearches(data || []);
    } catch (error) {
      console.error('Failed to fetch search data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const filteredSearches = searches.filter((search) => {
    const rc = search.rc_name || '';
    const role = search.job_role || '';
    return (
      rc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleRowClick = async (searchId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search-status/${searchId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!res.ok || !data.status) {
        console.error("Could not fetch status for search ID:", searchId);
        return;
      }

      const status = data.status;

      if (status === "shortlist") {
        navigate(`/shortlist/${searchId}`);
      } else if (status === "process") {
        navigate(`/process/${searchId}`);
      } else if (status === "results") {
        navigate(`/results/${searchId}`);
      }
    } catch (error) {
      console.error("Error fetching search status:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search History</h1>
          <p className="text-muted-foreground">Track all your recruitment searches and results</p>
        </div>
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
                    <span>Search name</span>
                  </div>
                </th>
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

            {loading ? (
              <HistorySkeleton rows={5} />
            ) : (
              <tbody>
                {filteredSearches.map((search) => (
                  <tr
                    key={search.id}
                    onClick={() => handleRowClick(search.id)}
                    className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-foreground">{search.search_name || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{search.rc_name || '-'}</div>
                    </td>
                    <td className="p-4">{search.job_role || '-'}</td>
                    <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                      {search.key_skills || '-'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {search.created_at ? new Date(search.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-medium">
                        {Array.isArray(search.shortlisted_index)
                          ? search.shortlisted_index.length
                          : (typeof search.shortlisted_index === 'string'
                            ? JSON.parse(search.shortlisted_index).length
                            : 0)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredSearches.length === 0 && (
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
