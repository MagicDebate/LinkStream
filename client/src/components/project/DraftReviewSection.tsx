import { useState, useEffect } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { LinkCandidate } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DraftReviewSectionProps {
  projectId: string;
  className?: string;
}

interface FilterCounts {
  all: number;
  hubs: number;
  commerce: number;
  similar: number;
  deep: number;
  fresh: number;
  orphans: number;
  broken: number;
}

export function DraftReviewSection({ projectId, className }: DraftReviewSectionProps) {
  const [candidates, setCandidates] = useState<LinkCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<LinkCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    all: 0,
    hubs: 0,
    commerce: 0,
    similar: 0,
    deep: 0,
    fresh: 0,
    orphans: 0,
    broken: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCandidates();
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchTerm, activeFilter]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      // Get the most recent run for this project
      const runs = await mockApi.getRuns(projectId);
      if (runs.length === 0) {
        // If no runs exist, create demo data
        const project = await mockApi.getProject(projectId);
        if (project) {
          await mockApi.initializeDemoData(projectId);
          const newRuns = await mockApi.getRuns(projectId);
          if (newRuns.length > 0) {
            const data = await mockApi.getLinkCandidates(newRuns[0].id);
            setCandidates(data);
            calculateFilterCounts(data);
          }
        }
        return;
      }

      const latestRun = runs[0];
      const data = await mockApi.getLinkCandidates(latestRun.id);
      setCandidates(data);
      calculateFilterCounts(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить черновики ссылок",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFilterCounts = (data: LinkCandidate[]) => {
    const counts = data.reduce((acc, candidate) => {
      acc.all++;
      if (candidate.type in acc) {
        (acc as any)[candidate.type]++;
      }
      return acc;
    }, {
      all: 0,
      hubs: 0,
      commerce: 0,
      similar: 0,
      deep: 0,
      fresh: 0,
      orphans: 0,
      broken: 0,
    });
    setFilterCounts(counts);
  };

  const applyFilters = () => {
    let filtered = candidates;

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.type === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.sourceUrl.toLowerCase().includes(term) ||
        candidate.targetUrl.toLowerCase().includes(term) ||
        candidate.anchor.toLowerCase().includes(term)
      );
    }

    setFilteredCandidates(filtered);
  };

  const toggleCandidateSelection = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }
    setSelectedCandidates(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      const allIds = new Set(filteredCandidates.map(c => c.id));
      setSelectedCandidates(allIds);
    }
  };

  const toggleRowExpansion = (candidateId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId);
    } else {
      newExpanded.add(candidateId);
    }
    setExpandedRows(newExpanded);
  };

  const approveAllVisible = async () => {
    try {
      const runs = await mockApi.getRuns(projectId);
      if (runs.length === 0) return;

      const runId = runs[0].id;
      
      for (const candidate of filteredCandidates) {
        if (candidate.status !== 'approved') {
          await mockApi.updateLinkCandidate(candidate.id, runId, {
            status: 'approved'
          });
        }
      }

      await loadCandidates();
      toast({
        title: "Success",
        description: `Approved ${filteredCandidates.length} link candidates`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve candidates",
        variant: "destructive",
      });
    }
  };

  const clearSelection = () => {
    setSelectedCandidates(new Set());
  };

  const exportCSV = () => {
    const csvData = filteredCandidates.map(candidate => ({
      'Source URL': candidate.sourceUrl,
      'Target URL': candidate.targetUrl,
      'Anchor Text': candidate.anchor,
      'Type': candidate.type,
      'Status': candidate.status,
      'Rejection Reason': candidate.rejectionReason || '',
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `link-candidates-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyChanges = async () => {
    try {
      const runs = await mockApi.getRuns(projectId);
      if (runs.length === 0) return;

      await mockApi.updateRun(runs[0].id, projectId, {
        status: 'published',
        completedAt: new Date(),
      });

      toast({
        title: "Changes applied",
        description: "Link candidates have been published successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply changes",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hubs: 'bg-blue-100 text-blue-800',
      commerce: 'bg-emerald-100 text-emerald-800',
      similar: 'bg-purple-100 text-purple-800',
      deep: 'bg-orange-100 text-orange-800',
      fresh: 'bg-green-100 text-green-800',
      orphans: 'bg-gray-100 text-gray-800',
      broken: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-slate-100 text-slate-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (isLoading) {
    return (
      <Section 
        title="Draft Review" 
        number={5}
        className={className}
        data-section="draft"
      >
        <div className="p-6 text-center text-slate-500">
          Loading draft candidates...
        </div>
      </Section>
    );
  }

  if (candidates.length === 0) {
    return (
      <Section 
        title="Draft Review" 
        number={5}
        className={className}
        data-section="draft"
      >
        <div className="p-6 text-center text-slate-500">
          No draft candidates available. Run a generation first.
        </div>
      </Section>
    );
  }

  return (
    <Section 
      title="Draft Review" 
      number={5}
      className={className}
      data-section="draft"
    >
      <div className="p-6">
        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
            <button 
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                activeFilter === 'all' 
                  ? "bg-primary-100 text-primary-800" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              All ({filterCounts.all})
            </button>
            {Object.entries(filterCounts).filter(([key]) => key !== 'all' && filterCounts[key as keyof FilterCounts] > 0).map(([type, count]) => (
              <button 
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  activeFilter === type 
                    ? "bg-primary-100 text-primary-800" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search URLs or anchors..."
                className="pl-10 w-64"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-3 text-left font-medium text-slate-700">
                  <Checkbox 
                    checked={selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </th>
                <th className="px-3 py-3 text-left font-medium text-slate-700">Source</th>
                <th className="px-3 py-3 text-left font-medium text-slate-700">Target</th>
                <th className="px-3 py-3 text-left font-medium text-slate-700">Anchor</th>
                <th className="px-3 py-3 text-left font-medium text-slate-700">Type</th>
                <th className="px-3 py-3 text-left font-medium text-slate-700">Status</th>
                <th className="px-3 py-3 text-left font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCandidates.map((candidate) => (
                <>
                  <tr key={candidate.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <Checkbox 
                        checked={selectedCandidates.has(candidate.id)}
                        onCheckedChange={() => toggleCandidateSelection(candidate.id)}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="truncate max-w-xs" title={candidate.sourceUrl}>
                        {candidate.sourceUrl}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="truncate max-w-xs" title={candidate.targetUrl}>
                        {candidate.targetUrl}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{candidate.anchor}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={getTypeColor(candidate.type)}>
                        {candidate.type.charAt(0).toUpperCase() + candidate.type.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      {candidate.rejectionReason ? (
                        <span className="text-xs text-slate-500">{candidate.rejectionReason}</span>
                      ) : (
                        <button 
                          onClick={() => toggleRowExpansion(candidate.id)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ChevronDown 
                            className={cn(
                              "w-4 h-4 transform transition-transform",
                              expandedRows.has(candidate.id) && "rotate-180"
                            )} 
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRows.has(candidate.id) && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-3 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs font-medium text-slate-700 mb-2">Before</h5>
                            <div className="p-3 bg-white border rounded text-xs leading-relaxed">
                              {candidate.beforeText || 'Sample text before the link insertion.'}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-slate-700 mb-2">After</h5>
                            <div className="p-3 bg-white border rounded text-xs leading-relaxed">
                              {candidate.afterText || (
                                <>
                                  Sample text before the{' '}
                                  <a href={candidate.targetUrl} className="text-primary-600 underline">
                                    {candidate.anchor}
                                  </a>
                                  {' '}link insertion.
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <div className="flex space-x-3">
            <Button onClick={approveAllVisible} className="bg-emerald-600 hover:bg-emerald-700">
              Approve All Visible
            </Button>
            <Button variant="outline" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button onClick={applyChanges}>
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
