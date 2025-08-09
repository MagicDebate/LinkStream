import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { Project } from '@shared/schema';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    domain: '',
  });
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
    checkApi();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await mockApi.getProjects();
      setProjects(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: "Не удалось загрузить проекты",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkApi = async () => {
    try {
      const res = await apiClient.getHealth();
      setApiOnline(!!res.ok);
    } catch {
      setApiOnline(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.domain.trim()) return;

    setIsCreating(true);
    try {
      const project = await mockApi.createProject(createForm.name.trim(), createForm.domain.trim());
      setProjects(prev => [project, ...prev]);
      setCreateForm({ name: '', domain: '' });
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Projects</h1>
            <p className="text-slate-600">Manage your internal linking projects</p>
          </div>
          <div className="flex items-center space-x-2">
            {apiOnline === null ? (
              <Badge variant="secondary">Checking API...</Badge>
            ) : apiOnline ? (
              <Badge className="bg-emerald-100 text-emerald-800">API online</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">API offline</Badge>
            )}
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Tech Blog"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-domain">Domain</Label>
                    <Input
                      id="project-domain"
                      value={createForm.domain}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="e.g., techblog.com"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!showCreateForm && (
          <div className="mb-6">
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-slate-500">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-600 mb-4">Create your first project to get started with internal linking.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.domain}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-slate-500">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
