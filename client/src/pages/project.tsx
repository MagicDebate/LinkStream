import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';

export default function ProjectPage() {
  const [, params] = useRoute('/project/:id');
  const [, setLocation] = useLocation();

  const projectId = params?.id;

  useEffect(() => {
    if (projectId) {
      // Redirect to first step
      setLocation(`/project/${projectId}/csv-import`);
    }
  }, [projectId, setLocation]);

  return null;
}
