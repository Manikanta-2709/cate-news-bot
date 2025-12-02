import Header from '@/components/Header';
import CategoryCard from '@/components/CategoryCard';
import { categoryConfig, type CategoryName } from '@/lib/api';

const Dashboard = () => {
  const categories = Object.entries(categoryConfig) as [CategoryName, typeof categoryConfig[CategoryName]][];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="mb-10 text-center animate-fade-in">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            News Categories
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore the six news categories our ML model can classify. 
            Each card shows example headlines for that category.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(([name, config], idx) => (
            <CategoryCard
              key={name}
              name={name}
              color={config.color}
              icon={config.icon}
              description={config.description}
              examples={config.examples}
              delay={idx * 100}
            />
          ))}
        </div>

        {/* Model Info */}
        <div className="mt-12 rounded-xl border border-border bg-card p-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <h2 className="font-serif text-2xl font-bold">About the Model</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Algorithm</span>
              <p className="font-semibold">Multinomial Naive Bayes</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Feature Extraction</span>
              <p className="font-semibold">TF-IDF Vectorizer</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Preprocessing</span>
              <p className="font-semibold">NLTK + PorterStemmer</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Dataset</span>
              <p className="font-semibold">AG News</p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-muted p-6">
            <h3 className="font-medium mb-3">Flask Backend Setup</h3>
            <pre className="text-sm text-muted-foreground overflow-x-auto">
{`# Install dependencies
pip install flask scikit-learn numpy pandas nltk

# Train the model
python model_training.py

# Start the server
python app.py`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
