import { useState, useRef } from 'react';
import { Upload, Download, CheckCircle } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CSVImportSectionProps {
  projectId: string;
}

interface CSVData {
  headers: string[];
  rows: any[][];
  mapping: Record<string, string>;
  stats?: {
    totalPages: number;
    avgDepth: number;
    orphaned: number;
    duplicates: number;
  };
}

declare global {
  interface Window {
    Papa: any;
  }
}

export function CSVImportSection({ projectId }: CSVImportSectionProps) {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhases, setProcessingPhases] = useState<Array<{
    name: string;
    status: 'pending' | 'running' | 'complete';
  }>>([]);
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const requiredFields = ['url', 'html_or_text'];
  const optionalFields = ['title', 'meta_title', 'meta_description', 'pub_date', 'lang'];

  const handleFileUpload = (file: File) => {
    if (!file || file.type !== 'text/csv') {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      
      if (!window.Papa) {
        // Fallback to simple CSV parsing if Papa Parse isn't available
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
        
        const parsedData = rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        }).filter(row => Object.values(row).some(val => val));

        const initialMapping: Record<string, string> = {};
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('url')) initialMapping.url = header;
          else if (lowerHeader.includes('title')) initialMapping.title = header;
          else if (lowerHeader.includes('content') || lowerHeader.includes('text') || lowerHeader.includes('html')) initialMapping.html_or_text = header;
        });

        setCsvData({
          headers,
          rows: parsedData,
          mapping: initialMapping
        });
        return;
      }

      const result = window.Papa.parse(csv, { header: true });
      
      if (result.errors.length > 0) {
        toast({
          title: "CSV Parse Error",
          description: result.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(result.data[0] || {});
      const mapping: Record<string, string> = {};
      
      // Auto-detect common field mappings
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('url') && !mapping.url) mapping.url = header;
        if (lowerHeader.includes('title') && !lowerHeader.includes('meta') && !mapping.title) mapping.title = header;
        if (lowerHeader.includes('content') || lowerHeader.includes('html') || lowerHeader.includes('text')) mapping.html_or_text = header;
        if (lowerHeader.includes('meta_title')) mapping.meta_title = header;
        if (lowerHeader.includes('meta_description')) mapping.meta_description = header;
        if (lowerHeader.includes('date') || lowerHeader.includes('published')) mapping.pub_date = header;
        if (lowerHeader.includes('lang') || lowerHeader.includes('language')) mapping.lang = header;
      });

      setCsvData({
        headers,
        rows: result.data.slice(0, 20), // Preview first 20 rows
        mapping,
        stats: {
          totalPages: result.data.length,
          avgDepth: 3.2 + Math.random() * 0.5,
          orphaned: Math.floor(result.data.length * 0.02),
          duplicates: Math.floor(Math.random() * 5),
        }
      });
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateMapping = (field: string, header: string) => {
    if (!csvData) return;
    setCsvData({
      ...csvData,
      mapping: { ...csvData.mapping, [field]: header }
    });
  };

  const startProcessing = async () => {
    if (!csvData) return;

    setIsProcessing(true);
    const phases = [
      { name: 'CSV → Parse', status: 'running' as const },
      { name: 'HTML Cleanup', status: 'pending' as const },
      { name: 'Text Segmentation', status: 'pending' as const },
      { name: 'Embeddings Generation', status: 'pending' as const },
    ];
    setProcessingPhases(phases);
    setProcessLogs([]);

    try {
      // Simulate processing phases
      for (let i = 0; i < phases.length; i++) {
        const updatedPhases = [...phases];
        updatedPhases[i].status = 'running';
        if (i > 0) updatedPhases[i - 1].status = 'complete';
        setProcessingPhases(updatedPhases);

        // Add log entries
        const timestamp = new Date().toLocaleTimeString();
        setProcessLogs(prev => [
          ...prev,
          `[${timestamp}] Starting ${phases[i].name}...`,
          `[${timestamp}] ${phases[i].name}: Processing ${csvData.stats?.totalPages || 0} pages`
        ]);

        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      }

      // Complete all phases
      setProcessingPhases(phases.map(p => ({ ...p, status: 'complete' })));
      
      // Upload processed data
      const mappedData = csvData.rows.map(row => {
        const mappedRow: any = {};
        Object.entries(csvData.mapping).forEach(([field, header]) => {
          if (header && row[csvData.headers.indexOf(header)]) {
            mappedRow[field] = row[csvData.headers.indexOf(header)];
          }
        });
        return mappedRow;
      });

      await mockApi.uploadCSV(projectId, mappedData);

      toast({
        title: "Processing complete",
        description: `Successfully processed ${csvData.stats?.totalPages || 0} pages.`,
      });

    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process CSV",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadLog = () => {
    const logText = processLogs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Section title="CSV Import" number={1} defaultOpen>
      <div className="p-6 space-y-4">
        {!csvData ? (
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer drag-zone"
          >
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">Drop your CSV file here</p>
            <p className="text-xs text-slate-500 mt-1">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-900">Preview (first 20 rows)</h3>
              <span className="text-xs text-slate-500">
                {csvData.stats?.totalPages.toLocaleString()} total rows detected
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {csvData.headers.slice(0, 4).map((header, index) => (
                      <th key={index} className="px-3 py-2 text-left font-medium text-slate-700">
                        {header}
                        <Select
                          value={Object.entries(csvData.mapping).find(([_, h]) => h === header)?.[0] || '--skip--'}
                          onValueChange={(value) => updateMapping(value === '--skip--' ? '' : value, header)}
                        >
                          <SelectTrigger className="w-full mt-1 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="--skip--">--skip--</SelectItem>
                            {requiredFields.map(field => (
                              <SelectItem key={field} value={field}>
                                {field} {csvData.mapping[field] === header && '✓'}
                              </SelectItem>
                            ))}
                            {optionalFields.map(field => (
                              <SelectItem key={field} value={field}>
                                {field} {csvData.mapping[field] === header && '✓'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {csvData.rows.slice(0, 3).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.slice(0, 4).map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 whitespace-nowrap">
                          <div className="truncate max-w-xs">
                            {String(cell).substring(0, 50)}
                            {String(cell).length > 50 && '...'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {csvData.stats && (
              <div className="flex space-x-6 mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">
                    {csvData.stats.totalPages.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">Total pages</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-emerald-600">
                    {csvData.stats.avgDepth.toFixed(1)}
                  </div>
                  <div className="text-xs text-slate-500">Avg depth</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-amber-600">
                    {csvData.stats.orphaned}
                  </div>
                  <div className="text-xs text-slate-500">Orphaned</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {csvData.stats.duplicates}
                  </div>
                  <div className="text-xs text-slate-500">Duplicates</div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button 
                onClick={startProcessing} 
                disabled={isProcessing || !requiredFields.every(field => csvData.mapping[field])}
              >
                {isProcessing ? 'Processing...' : 'Process Data'}
              </Button>
            </div>

            {processingPhases.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-slate-900">Processing Phases</h4>
                <div className="space-y-2">
                  {processingPhases.map((phase, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm">{phase.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        phase.status === 'complete' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : phase.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {phase.status === 'complete' ? 'Complete' : 
                         phase.status === 'running' ? 'Running' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>

                {processLogs.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-slate-900">Processing Logs</h5>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={downloadLog}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download Log
                      </Button>
                    </div>
                    <div className="bg-slate-900 text-green-400 p-3 rounded-md text-xs font-mono h-32 overflow-y-auto">
                      {processLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
