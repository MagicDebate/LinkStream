import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Project } from '@shared/schema';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CSVImportSection } from '@/components/project/CSVImportSection';
import { GlobalParametersSection } from '@/components/project/GlobalParametersSection';
import { QuickTasksSection } from '@/components/project/QuickTasksSection';
import { LaunchProgressSection } from '@/components/project/LaunchProgressSection';
import { DraftReviewSection } from '@/components/project/DraftReviewSection';
import { RunHistorySection } from '@/components/project/RunHistorySection';

export default function ProjectPage() {
  const [, params] = useRoute('/project/:id');
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (params?.id) {
      loadProject(params.id);
    }
  }, [params?.id]);

  const loadProject = async (id: string) => {
    try {
      const data = await mockApi.getProject(id);
      if (!data) {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        return;
      }
      setProject(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Project not found</h1>
          <p className="text-slate-600">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header projectName={project.name} projectDomain={project.domain} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CSVImportSection projectId={project.id} />
        <GlobalParametersSection />
        <QuickTasksSection />
        <LaunchProgressSection 
          projectId={project.id}
          className="sticky top-16 z-40"
        />
        <DraftReviewSection 
          projectId={project.id}
          className="sticky top-32 z-30"
        />
        <RunHistorySection projectId={project.id} />
      </main>

      <Footer />
    </div>
  );
}
