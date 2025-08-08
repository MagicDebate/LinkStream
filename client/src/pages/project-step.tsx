import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Project } from '@shared/schema';
import { mockApi } from '@/lib/mockApi';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CSVImportSection } from '@/components/project/CSVImportSection';
import { GlobalParametersSection } from '@/components/project/GlobalParametersSection';
import { QuickTasksSection } from '@/components/project/QuickTasksSection';
import { LaunchProgressSection } from '@/components/project/LaunchProgressSection';
import { DraftReviewSection } from '@/components/project/DraftReviewSection';
import { RunHistorySection } from '@/components/project/RunHistorySection';

const STEPS = [
  { id: 'csv-import', component: CSVImportSection, titleKey: 'csvImport' as const },
  { id: 'global-parameters', component: GlobalParametersSection, titleKey: 'globalParameters' as const },
  { id: 'quick-tasks', component: QuickTasksSection, titleKey: 'quickTasks' as const },
  { id: 'launch-progress', component: LaunchProgressSection, titleKey: 'launchProgress' as const },
  { id: 'draft-review', component: DraftReviewSection, titleKey: 'draftReview' as const },
  { id: 'run-history', component: RunHistorySection, titleKey: 'runHistory' as const },
];

export default function ProjectStepPage() {
  const [, params] = useRoute('/project/:id/:step');
  const [, setLocation] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { toast } = useToast();

  const projectId = params?.id;
  const stepId = params?.step;
  const currentStepIndex = STEPS.findIndex(step => step.id === stepId);
  const currentStep = STEPS[currentStepIndex];

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const loadProject = async (id: string) => {
    try {
      const data = await mockApi.getProject(id);
      if (!data) {
        toast({
          title: t('error'),
          description: 'Проект не найден',
          variant: "destructive",
        });
        setLocation('/projects');
        return;
      }
      setProject(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: 'Не удалось загрузить проект',
        variant: "destructive",
      });
      setLocation('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0 && projectId) {
      const prevStep = STEPS[currentStepIndex - 1];
      setLocation(`/project/${projectId}/${prevStep.id}`);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1 && projectId) {
      const nextStep = STEPS[currentStepIndex + 1];
      setLocation(`/project/${projectId}/${nextStep.id}`);
    }
  };

  const goToDashboard = () => {
    setLocation('/projects');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">{t('loading')}</div>
      </div>
    );
  }

  if (!project || !currentStep) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Страница не найдена</h1>
          <p className="text-slate-600">Запрошенная страница не может быть найдена.</p>
          <Button onClick={goToDashboard} className="mt-4">
            <Home className="w-4 h-4 mr-2" />
            {t('dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  const StepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header projectName={project.name} projectDomain={project.domain} />
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={goToDashboard}>
                <Home className="w-4 h-4 mr-2" />
                {t('dashboard')}
              </Button>
              <div className="text-slate-400">→</div>
              <h1 className="text-xl font-semibold text-slate-900">
                {t(currentStep.titleKey)}
              </h1>
            </div>
            <Badge variant="secondary">
              {t('step')} {currentStepIndex + 1} {t('of')} {STEPS.length}
            </Badge>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center space-x-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === currentStepIndex 
                    ? 'bg-primary text-white' 
                    : index < currentStepIndex 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <StepComponent projectId={project.id} />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('previousStep')}
          </Button>
          
          <div className="text-sm text-slate-500">
            {currentStepIndex + 1} {t('of')} {STEPS.length}
          </div>

          {currentStepIndex === STEPS.length - 1 ? (
            <Button onClick={goToDashboard}>
              {t('finish')}
            </Button>
          ) : (
            <Button onClick={goToNextStep}>
              {t('nextStep')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}