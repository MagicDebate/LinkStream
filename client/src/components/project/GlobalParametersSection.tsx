import { useState, useEffect } from 'react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface GlobalSettings {
  maxLinksPerPage: number;
  priorities: string[];
  minGap: number;
  exactAnchorPercent: number;
  oldLinksAction: 'enrich' | 'regenerate' | 'audit';
  brokenLinksAction: 'delete' | 'replace' | 'ignore';
  htmlClass: string;
  linkMode: 'append' | 'replace';
  stopAnchors: string[];
  relAttributes: string[];
  targetBlank: boolean;
  urlPattern: string;
  newerThan: string;
  randomSample: number;
}

const DEFAULT_PRIORITIES = ['hubs', 'commerce', 'similar', 'deep', 'fresh', 'orphans'];
const PRIORITY_COLORS = {
  hubs: 'bg-blue-100 text-blue-800',
  commerce: 'bg-emerald-100 text-emerald-800',
  similar: 'bg-purple-100 text-purple-800',
  deep: 'bg-orange-100 text-orange-800',
  fresh: 'bg-green-100 text-green-800',
  orphans: 'bg-gray-100 text-gray-800',
};

export function GlobalParametersSection() {
  const [settings, setSettings] = useState<GlobalSettings>({
    maxLinksPerPage: 3,
    priorities: DEFAULT_PRIORITIES,
    minGap: 200,
    exactAnchorPercent: 20,
    oldLinksAction: 'enrich',
    brokenLinksAction: 'delete',
    htmlClass: 'internal-link',
    linkMode: 'append',
    stopAnchors: ['click here', 'read more', 'learn more'],
    relAttributes: [],
    targetBlank: false,
    urlPattern: '',
    newerThan: '',
    randomSample: 100,
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await mockApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await mockApi.updateSettings(settings);
      toast({
        title: "Settings saved",
        description: "Global parameters have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const movePriority = (fromIndex: number, toIndex: number) => {
    const newPriorities = [...settings.priorities];
    const [movedItem] = newPriorities.splice(fromIndex, 1);
    newPriorities.splice(toIndex, 0, movedItem);
    updateSetting('priorities', newPriorities);
  };

  const toggleRelAttribute = (attribute: string) => {
    const newAttributes = settings.relAttributes.includes(attribute)
      ? settings.relAttributes.filter(a => a !== attribute)
      : [...settings.relAttributes, attribute];
    updateSetting('relAttributes', newAttributes);
  };

  return (
    <Section title="Global Parameters" number={2} defaultOpen>
      <div className="p-6 space-y-6">
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Maximum new links per page
          </Label>
          <Input 
            type="number" 
            value={settings.maxLinksPerPage}
            onChange={(e) => updateSetting('maxLinksPerPage', parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Priority Order (drag to reorder)
          </Label>
          <div className="flex flex-wrap gap-2">
            {settings.priorities.map((priority, index) => (
              <div
                key={priority}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-move ${
                  PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-slate-100 text-slate-600'
                }`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  movePriority(fromIndex, index);
                }}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">Limits & Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="block text-xs font-medium text-slate-600 mb-1">
                Min gap (words)
              </Label>
              <Input 
                type="number" 
                value={settings.minGap}
                onChange={(e) => updateSetting('minGap', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-slate-600 mb-1">
                Exact anchor %
              </Label>
              <Input 
                type="number" 
                value={settings.exactAnchorPercent}
                onChange={(e) => updateSetting('exactAnchorPercent', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-slate-600 mb-1">
                Old links
              </Label>
              <Select 
                value={settings.oldLinksAction}
                onValueChange={(value) => updateSetting('oldLinksAction', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrich">Enrich</SelectItem>
                  <SelectItem value="regenerate">Regenerate</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs font-medium text-slate-600 mb-1">
                Broken links
              </Label>
              <Select 
                value={settings.brokenLinksAction}
                onValueChange={(value) => updateSetting('brokenLinksAction', value as any)}
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
            <div>
              <Label className="block text-xs font-medium text-slate-600 mb-1">
                HTML Class
              </Label>
              <Input 
                value={settings.htmlClass}
                onChange={(e) => updateSetting('htmlClass', e.target.value)}
                placeholder="internal-link"
              />
            </div>
            <div>
              <Label className="block text-xs font-medium text-slate-600 mb-1">
                Link mode
              </Label>
              <Select 
                value={settings.linkMode}
                onValueChange={(value) => updateSetting('linkMode', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="append">Append</SelectItem>
                  <SelectItem value="replace">Replace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Label className="block text-xs font-medium text-slate-600 mb-1">
              Stop-anchors (one per line)
            </Label>
            <Textarea 
              rows={3}
              value={settings.stopAnchors.join('\n')}
              onChange={(e) => updateSetting('stopAnchors', e.target.value.split('\n').filter(line => line.trim()))}
              placeholder="click here&#10;read more&#10;learn more"
              className="resize-none"
            />
          </div>

          <div className="mt-4 space-y-2">
            <Label className="block text-xs font-medium text-slate-600">Link attributes</Label>
            <div className="flex flex-wrap gap-4">
              {['noopener', 'noreferrer', 'nofollow'].map(attribute => (
                <label key={attribute} className="flex items-center">
                  <Checkbox 
                    checked={settings.relAttributes.includes(attribute)}
                    onCheckedChange={() => toggleRelAttribute(attribute)}
                  />
                  <span className="text-sm ml-2">rel="{attribute}"</span>
                </label>
              ))}
              <label className="flex items-center">
                <Checkbox 
                  checked={settings.targetBlank}
                  onCheckedChange={(checked) => updateSetting('targetBlank', !!checked)}
                />
                <span className="text-sm ml-2">target="_blank"</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-medium text-slate-600 mb-2">Scope</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="block text-xs text-slate-500 mb-1">URL pattern</Label>
                <Input 
                  value={settings.urlPattern}
                  onChange={(e) => updateSetting('urlPattern', e.target.value)}
                  placeholder="^/blog/"
                />
              </div>
              <div>
                <Label className="block text-xs text-slate-500 mb-1">Newer than</Label>
                <Input 
                  type="date" 
                  value={settings.newerThan}
                  onChange={(e) => updateSetting('newerThan', e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-xs text-slate-500 mb-1">Random sample %</Label>
                <Input 
                  type="number" 
                  max="100" 
                  value={settings.randomSample}
                  onChange={(e) => updateSetting('randomSample', parseInt(e.target.value) || 0)}
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Parameters'}
          </Button>
        </div>
      </div>
    </Section>
  );
}
