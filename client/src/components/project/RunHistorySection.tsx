import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, BarChart3 } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { Run } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Section } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RunHistorySectionProps {
  projectId: string;
}

interface RunStats {
  added: number;
  rejected: number;
  fixed404: number;
  orphansReduced: number;
  avgDepthReduced: number;
  exactPercent: number;
  partialPercent: number;
  genericPercent: number;
}

export function RunHistorySection({ projectId }: RunHistorySectionProps) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRuns();
  }, [projectId]);

  const loadRuns = async () => {
    try {
      const data = await mockApi.getRuns(projectId);
      setRuns(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load run history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockStats = (index: number): RunStats => {
    // Generate consistent mock stats based on run index
    const baseAdded = 200 + (index * 47) % 150;
    const baseRejected = 10 + (index * 13) % 30;
    
    return {
      added: baseAdded,
      rejected: baseRejected,
      fixed404: 5 + (index * 7) % 25,
      orphansReduced: 3 + (index * 11) % 30,
      avgDepthReduced: 3.0 + (index * 0.3) % 1.5,
      exactPercent: 18 + (index * 2) % 8,
      partialPercent: 40 + (index * 3) % 15,
      genericPercent: 30 + (index * 5) % 20,
    };
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-amber-100 text-amber-800';
      case 'draft': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Section title="Run History" number={6}>
        <div className="p-6 text-center text-slate-500">
          Loading run history...
        </div>
      </Section>
    );
  }

  if (runs.length === 0) {
    return (
      <Section title="Run History" number={6}>
        <div className="p-6 text-center text-slate-500">
          No runs found. Complete a generation to see history.
        </div>
      </Section>
    );
  }

  return (
    <Section title="Run History" number={6}>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {runs.map((run, index) => {
            const stats = generateMockStats(index);
            const runNumber = runs.length - index;
            
            return (
              <Card 
                key={run.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => run.status === 'published' || run.status === 'completed' ? scrollToSection('draft') : undefined}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-slate-900">
                      Run #{runNumber}
                    </CardTitle>
                    <Badge className={getStatusColor(run.status)}>
                      {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-xs text-slate-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(run.createdAt)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-emerald-600">
                        {stats.added}
                      </div>
                      <div className="text-slate-500">Added</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">
                        {stats.fixed404}
                      </div>
                      <div className="text-slate-500">404 Fixed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {stats.orphansReduced}
                      </div>
                      <div className="text-slate-500">Orphans ↓</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {stats.avgDepthReduced.toFixed(1)}
                      </div>
                      <div className="text-slate-500">Avg Depth ↓</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-600">
                      Exact: {stats.exactPercent}% | Partial: {stats.partialPercent}% | Generic: {stats.genericPercent}%
                    </div>
                  </div>

                  {run.status === 'running' && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center text-xs text-amber-600">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Processing in progress...
                      </div>
                    </div>
                  )}

                  {(run.status === 'published' || run.status === 'completed') && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center text-xs text-primary-600">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Click to view details
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {runs.length > 6 && (
          <div className="mt-6 text-center">
            <button className="text-sm text-primary-600 hover:text-primary-700">
              Load more runs
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
