import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { classifyNews, type PredictionResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CSVRow {
  text: string;
  category?: string;
  confidence?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}

const CSVUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header if it looks like one
      const startIndex = lines[0].toLowerCase().includes('text') ? 1 : 0;
      
      const parsedRows: CSVRow[] = lines.slice(startIndex).map(line => ({
        text: line.replace(/^["']|["']$/g, '').trim(),
        status: 'pending' as const,
      }));

      setRows(parsedRows);
      setProgress(0);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
    }
  };

  const classifyAll = async () => {
    setIsProcessing(true);
    const totalRows = rows.length;
    let completed = 0;

    const updatedRows = [...rows];

    for (let i = 0; i < updatedRows.length; i++) {
      updatedRows[i].status = 'processing';
      setRows([...updatedRows]);

      try {
        const result = await classifyNews(updatedRows[i].text);
        updatedRows[i].category = result.category;
        updatedRows[i].confidence = result.confidence;
        updatedRows[i].status = 'done';
      } catch (err) {
        updatedRows[i].status = 'error';
      }

      completed++;
      setProgress(Math.round((completed / totalRows) * 100));
      setRows([...updatedRows]);
    }

    setIsProcessing(false);
    toast({
      title: 'Classification Complete',
      description: `Processed ${totalRows} articles.`,
    });
  };

  const downloadResults = () => {
    const headers = 'Text,Category,Confidence\n';
    const csvContent = rows
      .map(row => `"${row.text.replace(/"/g, '""')}","${row.category || ''}","${row.confidence ? (row.confidence * 100).toFixed(1) : ''}%"`)
      .join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classification_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setRows([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const statusColors = {
    pending: 'bg-muted text-muted-foreground',
    processing: 'bg-primary/10 text-primary',
    done: 'bg-sports/10 text-sports',
    error: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Drop your CSV file here</p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            CSV should have one news article per row
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {rows.length} articles to classify
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile} disabled={isProcessing}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="hero"
              onClick={classifyAll}
              disabled={isProcessing || rows.every(r => r.status === 'done')}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Classify All'
              )}
            </Button>
            {rows.some(r => r.status === 'done') && (
              <Button variant="outline" onClick={downloadResults}>
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </Button>
            )}
          </div>

          {/* Results Table */}
          {rows.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Text Preview</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="p-3 text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 max-w-xs truncate" title={row.text}>
                          {row.text.substring(0, 60)}...
                        </td>
                        <td className="p-3">
                          {row.category && (
                            <span className={cn(
                              'px-2 py-1 rounded-md text-xs font-medium',
                              row.category === 'Politics' && 'bg-politics/10 text-politics',
                              row.category === 'Sports' && 'bg-sports/10 text-sports',
                              row.category === 'Entertainment' && 'bg-entertainment/10 text-entertainment',
                              row.category === 'Technology' && 'bg-technology/10 text-technology',
                              row.category === 'Business' && 'bg-business/10 text-business',
                              row.category === 'Health' && 'bg-health/10 text-health',
                            )}>
                              {row.category}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            'px-2 py-1 rounded-md text-xs font-medium capitalize',
                            statusColors[row.status]
                          )}>
                            {row.status === 'processing' && (
                              <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                            )}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
