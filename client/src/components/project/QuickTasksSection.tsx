import { useState } from 'react';
import { Section } from '@/components/ui/section';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TaskConfig {
  enabled: boolean;
  config: Record<string, any>;
}

interface TasksState {
  hubs: TaskConfig;
  commerce: TaskConfig;
  similar: TaskConfig;
  deep: TaskConfig;
  fresh: TaskConfig;
  orphans: TaskConfig;
  broken: TaskConfig;
  regenerate: TaskConfig;
}

export function QuickTasksSection() {
  const [tasks, setTasks] = useState<TasksState>({
    hubs: {
      enabled: true,
      config: {
        topology: 'star',
        restrictPrefix: true,
      }
    },
    commerce: {
      enabled: false,
      config: {
        urlPattern: '/buy|product|service|pricing/',
        limitPrefix: '',
      }
    },
    similar: {
      enabled: true,
      config: {
        prefixes: '/blog/',
        kNeighbors: 2,
      }
    },
    deep: {
      enabled: false,
      config: {
        minDepth: 5,
        donorsFromLevels: true,
      }
    },
    fresh: {
      enabled: false,
      config: {
        daysFresh: 30,
        linksPerDonor: 1,
      }
    },
    orphans: {
      enabled: true,
      config: {
        scope: 'entire',
      }
    },
    broken: {
      enabled: false,
      config: {
        policy: 'delete',
      }
    },
    regenerate: {
      enabled: false,
      config: {
        mode: 'enrich',
      }
    },
  });

  const updateTaskEnabled = (taskKey: keyof TasksState, enabled: boolean) => {
    setTasks(prev => ({
      ...prev,
      [taskKey]: { ...prev[taskKey], enabled }
    }));
  };

  const updateTaskConfig = (taskKey: keyof TasksState, configKey: string, value: any) => {
    setTasks(prev => ({
      ...prev,
      [taskKey]: {
        ...prev[taskKey],
        config: { ...prev[taskKey].config, [configKey]: value }
      }
    }));
  };

  const getPreflightEstimate = () => {
    const enabledTasks = Object.entries(tasks).filter(([_, task]) => task.enabled);
    const estimates = {
      hubs: 142,
      commerce: 23,
      similar: 89,
      deep: 45,
      fresh: 32,
      orphans: 23,
      broken: 12,
      regenerate: 67,
    };
    
    const total = enabledTasks.reduce((sum, [key]) => sum + (estimates[key as keyof typeof estimates] || 0), 0);
    const breakdown = enabledTasks.map(([key]) => `${key.charAt(0).toUpperCase() + key.slice(1)} ~${estimates[key as keyof typeof estimates] || 0}`);
    
    return { total, breakdown };
  };

  const estimate = getPreflightEstimate();

  return (
    <Section title="Quick Tasks" number={3} defaultOpen>
      <div className="p-6 space-y-4">
        
        {/* Hub Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.hubs.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('hubs', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Hub Pages by Prefix</span>
              {tasks.hubs.enabled && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">Active</Badge>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <Label className="block text-xs text-slate-600 mb-1">Topology</Label>
              <Select 
                value={tasks.hubs.config.topology}
                onValueChange={(value) => updateTaskConfig('hubs', 'topology', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="star">Star</SelectItem>
                  <SelectItem value="ring">Ring</SelectItem>
                  <SelectItem value="wheel">Wheel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center text-xs">
                <Checkbox 
                  checked={tasks.hubs.config.restrictPrefix}
                  onCheckedChange={(checked) => updateTaskConfig('hubs', 'restrictPrefix', !!checked)}
                />
                <span className="ml-2">Restrict strictly within (sub)prefix</span>
              </label>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Preview: 3 prefixes, 142 pages
          </div>
        </div>

        {/* Commerce Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.commerce.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('commerce', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Money Page Routing</span>
              {tasks.commerce.enabled && (
                <Badge className="ml-2 bg-emerald-100 text-emerald-800">Active</Badge>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="block text-xs text-slate-600 mb-1">URL Pattern (regex)</Label>
              <Input 
                value={tasks.commerce.config.urlPattern}
                onChange={(e) => updateTaskConfig('commerce', 'urlPattern', e.target.value)}
              />
            </div>
            <div>
              <Label className="block text-xs text-slate-600 mb-1">Limit to prefix (optional)</Label>
              <Input 
                value={tasks.commerce.config.limitPrefix}
                onChange={(e) => updateTaskConfig('commerce', 'limitPrefix', e.target.value)}
                placeholder="/shop/"
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Preview: ≈ 23 money URLs found
          </div>
        </div>

        {/* Similar Section Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.similar.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('similar', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Similar in Section (Cross-linking)</span>
              {tasks.similar.enabled && (
                <Badge className="ml-2 bg-purple-100 text-purple-800">Active</Badge>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="block text-xs text-slate-600 mb-1">Prefix(es)</Label>
              <Input 
                value={tasks.similar.config.prefixes}
                onChange={(e) => updateTaskConfig('similar', 'prefixes', e.target.value)}
              />
            </div>
            <div>
              <Label className="block text-xs text-slate-600 mb-1">K neighbors</Label>
              <Select 
                value={tasks.similar.config.kNeighbors.toString()}
                onValueChange={(value) => updateTaskConfig('similar', 'kNeighbors', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (ring)</SelectItem>
                  <SelectItem value="2">2 (mesh)</SelectItem>
                  <SelectItem value="3">3 (dense)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Deep Pages Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.deep.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('deep', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Lift Deep Pages</span>
              {tasks.deep.enabled && (
                <Badge className="ml-2 bg-orange-100 text-orange-800">Active</Badge>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="block text-xs text-slate-600 mb-1">Min Depth</Label>
              <Input 
                type="number"
                value={tasks.deep.config.minDepth}
                onChange={(e) => updateTaskConfig('deep', 'minDepth', parseInt(e.target.value) || 5)}
              />
            </div>
            <div>
              <label className="flex items-center text-xs">
                <Checkbox 
                  checked={tasks.deep.config.donorsFromLevels}
                  onCheckedChange={(checked) => updateTaskConfig('deep', 'donorsFromLevels', !!checked)}
                />
                <span className="ml-2">Donors from levels ≤3</span>
              </label>
            </div>
          </div>
        </div>

        {/* Fresh Pages Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.fresh.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('fresh', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Boost Fresh Pages</span>
              {tasks.fresh.enabled && (
                <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="block text-xs text-slate-600 mb-1">Days fresh</Label>
              <Input 
                type="number"
                value={tasks.fresh.config.daysFresh}
                onChange={(e) => updateTaskConfig('fresh', 'daysFresh', parseInt(e.target.value) || 30)}
              />
            </div>
            <div>
              <Label className="block text-xs text-slate-600 mb-1">Links per donor</Label>
              <Input 
                type="number"
                value={tasks.fresh.config.linksPerDonor}
                onChange={(e) => updateTaskConfig('fresh', 'linksPerDonor', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        {/* Orphan Pages Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.orphans.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('orphans', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Connect Orphan Pages</span>
              {tasks.orphans.enabled && (
                <Badge className="ml-2 bg-gray-100 text-gray-800">Active</Badge>
              )}
            </label>
          </div>
          <div>
            <Label className="block text-xs text-slate-600 mb-1">Scope</Label>
            <Select 
              value={tasks.orphans.config.scope}
              onValueChange={(value) => updateTaskConfig('orphans', 'scope', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entire">Entire site</SelectItem>
                <SelectItem value="prefix">Specific prefix</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Broken Links Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.broken.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('broken', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Clean Broken Links</span>
              {tasks.broken.enabled && (
                <Badge className="ml-2 bg-red-100 text-red-800">Active</Badge>
              )}
            </label>
          </div>
          <div>
            <Label className="block text-xs text-slate-600 mb-1">404 Policy</Label>
            <Select 
              value={tasks.broken.config.policy}
              onValueChange={(value) => updateTaskConfig('broken', 'policy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="replace">Replace</SelectItem>
                <SelectItem value="ignore">Ignore</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Regeneration Task */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <Checkbox 
                checked={tasks.regenerate.enabled}
                onCheckedChange={(checked) => updateTaskEnabled('regenerate', !!checked)}
              />
              <span className="ml-3 font-medium text-slate-900">Regenerate/Enrich Links</span>
              {tasks.regenerate.enabled && (
                <Badge className="ml-2 bg-indigo-100 text-indigo-800">Active</Badge>
              )}
            </label>
          </div>
          <div>
            <Label className="block text-xs text-slate-600 mb-1">Mode</Label>
            <Select 
              value={tasks.regenerate.config.mode}
              onValueChange={(value) => updateTaskConfig('regenerate', 'mode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrich">Enrich (add to existing)</SelectItem>
                <SelectItem value="regenerate">Regenerate (replace all)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preflight Summary */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Preflight Estimate</h4>
          <p className="text-sm text-blue-800">
            Expected: ~{estimate.total} links ({estimate.breakdown.join(', ')})
          </p>
        </div>
      </div>
    </Section>
  );
}
