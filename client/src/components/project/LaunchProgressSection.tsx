import { useState } from 'react';
import { Play } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LaunchProgressSectionProps {
  projectId: string;
  className?: string;
}

interface TaskStatus {
  name: string;
  status: 'pending' | 'running' | 'done' | 'skipped';
  progress?: number;
}

interface GenerationStats {
  added: number;
  rejected: number;
  processed: number;
  timeElapsed: number;
}

export function LaunchProgressSection({ projectId, className }: LaunchProgressSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState<TaskStatus[]>([
    { name: 'Hubs', status: 'pending' },
    { name: 'Similar', status: 'pending' },
    { name: 'Orphans', status: 'pending' },
  ]);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<GenerationStats>({
    added: 0,
    rejected: 0,
    processed: 0,
    timeElapsed: 0,
  });
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedTasks = tasks.map(t => t.name.toLowerCase());

  const launchGeneration = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setLogs([]);
    setStats({ added: 0, rejected: 0, processed: 0, timeElapsed: 0 });

    try {
      // Create run
      const run = await mockApi.createRun(projectId, {
        tasks: selectedTasks,
        timestamp: new Date().toISOString(),
      });
      setCurrentRunId(run.id);

      // Start simulation
      await simulateGeneration(run.id);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start generation",
        variant: "destructive",
      });
      setIsRunning(false);
    }
  };

  const simulateGeneration = async (runId: string) => {
    const startTime = Date.now();
    let currentProgress = 0;
    let added = 0, rejected = 0, processed = 0;

    const interval = setInterval(() => {
      currentProgress += Math.random() * 8 + 2;
      added += Math.floor(Math.random() * 3);
      rejected += Math.floor(Math.random() * 1);
      processed += Math.floor(Math.random() * 5) + 1;

      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      setProgress(Math.min(currentProgress, 100));
      setStats({ added, rejected, processed, timeElapsed: elapsed });

      // Update task status based on progress
      if (currentProgress > 20 && currentProgress < 50) {
        setTasks(prev => prev.map((task, i) => 
          i === 0 ? { ...task, status: 'running' } : task
        ));
      } else if (currentProgress >= 50 && currentProgress < 80) {
        setTasks(prev => prev.map((task, i) => 
          i === 0 ? { ...task, status: 'done' } : 
          i === 1 ? { ...task, status: 'running' } : task
        ));
      } else if (currentProgress >= 80) {
        setTasks(prev => prev.map((task, i) => 
          i <= 1 ? { ...task, status: 'done' } : 
          i === 2 ? { ...task, status: 'running' } : task
        ));
      }

      // Add log entries
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [
        ...prev.slice(-20), // Keep only last 20 logs
        `[${timestamp}] Processing: ${processed} pages, Added: ${added} links, Rejected: ${rejected}`
      ]);

      if (currentProgress >= 100) {
        clearInterval(interval);
        completeGeneration(runId, { added, rejected, processed });
      }
    }, 800);
  };

  const completeGeneration = async (runId: string, finalStats: Omit<GenerationStats, 'timeElapsed'>) => {
    try {
      // Mark all tasks as done
      setTasks(prev => prev.map(task => ({ ...task, status: 'done' })));
      
      // Update run status
      await mockApi.updateRun(runId, projectId, {
        status: 'completed',
        stats: finalStats,
        completedAt: new Date(),
      });

      // Generate link candidates
      await mockApi.simulateGeneration(projectId, runId, selectedTasks);

      toast({
        title: "Generation complete",
        description: `Generated ${finalStats.added} link candidates`,
      });

      // Auto-scroll to draft section after a delay
      setTimeout(() => {
        const draftSection = document.querySelector('[data-section="draft"]');
        if (draftSection) {
          draftSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete generation",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TaskStatus['status']) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-emerald-100 text-emerald-800';
      case 'skipped': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Section 
      title="Launch & Progress" 
      number={4} 
      defaultOpen 
      className={className}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-slate-600 mb-2">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected for execution
            </p>
            <div className="flex space-x-2">
              {selectedTasks.map(task => (
                <Badge key={task} variant="secondary">
                  {task.charAt(0).toUpperCase() + task.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
          <Button 
            onClick={launchGeneration} 
            disabled={isRunning || selectedTasks.length === 0}
            className="font-medium"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Processing...' : 'Launch Generation'}
          </Button>
        </div>

        {isRunning && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            {/* Task Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tasks.map((task) => (
                <div key={task.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium">{task.name}</span>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === 'running' ? 'Running' : 
                     task.status === 'done' ? 'Done' :
                     task.status === 'skipped' ? 'Skipped' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Live Logs */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Live Processing Log</h4>
              <div className="bg-slate-900 text-green-400 p-3 rounded-md text-xs font-mono h-40 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
                {logs.length === 0 && (
                  <div className="text-slate-500">Initializing generation process...</div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-semibold text-emerald-600">{stats.added}</div>
                <div className="text-xs text-slate-500">Links Added</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-semibold text-red-600">{stats.rejected}</div>
                <div className="text-xs text-slate-500">Rejected</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">{stats.processed}</div>
                <div className="text-xs text-slate-500">Pages Processed</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-lg font-semibold text-slate-700">{formatTime(stats.timeElapsed)}</div>
                <div className="text-xs text-slate-500">Elapsed Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
