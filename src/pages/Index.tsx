import { useState } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import PredictionResult from '@/components/PredictionResult';
import { classifyNews, type PredictionResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: 'Empty Input',
        description: 'Please enter a news article to classify.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await classifyNews(text);
      setResult(prediction);
    } catch (err) {
      setError('Unable to connect to the classification server. Make sure your Flask API is running.');
      toast({
        title: 'Connection Error',
        description: 'Could not reach the Flask API. Check that the server is running on localhost:5000',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="mx-auto max-w-3xl">
          {/* Hero Section */}
          <div className="mb-10 text-center animate-fade-in">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Classify News Articles
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Powered by Machine Learning to categorize news into Politics, Sports, 
              Entertainment, Technology, Business, or Health.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="space-y-2">
              <label htmlFor="news-input" className="text-sm font-medium">
                News Article Text
              </label>
              <Textarea
                id="news-input"
                placeholder="Paste or type your news article here... (e.g., 'The Federal Reserve announced a 0.25% interest rate hike today, citing concerns about inflation.')"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] text-base"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{text.length} characters</span>
                <span>Minimum recommended: 50 characters</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                variant="hero" 
                size="xl" 
                className="flex-1"
                disabled={isLoading || !text.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Classifying...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Classify Article
                  </>
                )}
              </Button>
              {(text || result) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="xl"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="mt-8 animate-fade-in rounded-xl border border-destructive/20 bg-destructive/5 p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />
                <div>
                  <h3 className="font-medium text-destructive">Connection Error</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  <div className="mt-4 rounded-lg bg-muted p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">To start your Flask API:</p>
                    <code className="text-xs text-foreground">python app.py</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-8">
              <PredictionResult category={result.category} confidence={result.confidence} />
            </div>
          )}

          {/* API Info */}
          <div className="mt-12 rounded-xl border border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="font-serif text-lg font-semibold">API Configuration</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This frontend connects to a Flask API for predictions. Set the <code className="rounded bg-muted px-1.5 py-0.5 text-xs">VITE_API_URL</code> environment 
              variable to point to your backend, or it defaults to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">http://localhost:5000</code>.
            </p>
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Expected API Endpoint:</p>
              <code className="text-xs text-foreground">POST /predict {"{ text: string }"} → {"{ category: string, confidence?: number }"}</code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
