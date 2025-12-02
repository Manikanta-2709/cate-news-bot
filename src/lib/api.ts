// API configuration for connecting to Flask backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface PredictionResponse {
  category: string;
  confidence?: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  examples: string[];
}

export const classifyNews = async (text: string): Promise<PredictionResponse> => {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to classify news article');
  }

  return response.json();
};

export const getCategories = async (): Promise<CategoryStats[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`);

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
};

// Category metadata for UI
export const categoryConfig = {
  Politics: {
    color: 'politics',
    icon: 'landmark',
    description: 'Government, elections, policy, and international relations',
    examples: [
      'Senate passes new infrastructure bill',
      'President announces climate initiative',
      'UN summit addresses global tensions',
    ],
  },
  Sports: {
    color: 'sports',
    icon: 'trophy',
    description: 'Athletic competitions, teams, and sporting events',
    examples: [
      'Championship finals set for Sunday',
      'Star player signs record contract',
      'Olympics committee announces host city',
    ],
  },
  Entertainment: {
    color: 'entertainment',
    icon: 'clapperboard',
    description: 'Movies, music, celebrities, and pop culture',
    examples: [
      'Blockbuster film breaks box office records',
      'Grammy nominations announced today',
      'Streaming service launches new series',
    ],
  },
  Technology: {
    color: 'technology',
    icon: 'cpu',
    description: 'Innovation, gadgets, software, and digital trends',
    examples: [
      'AI startup raises $500M in funding',
      'New smartphone features unveiled',
      'Cybersecurity breach affects millions',
    ],
  },
  Business: {
    color: 'business',
    icon: 'briefcase',
    description: 'Markets, finance, companies, and economic news',
    examples: [
      'Stock market reaches all-time high',
      'Major merger creates industry giant',
      'Central bank announces rate decision',
    ],
  },
  Health: {
    color: 'health',
    icon: 'heart-pulse',
    description: 'Medicine, wellness, healthcare, and research',
    examples: [
      'Breakthrough treatment shows promise',
      'WHO releases new health guidelines',
      'Research links diet to longevity',
    ],
  },
} as const;

export type CategoryName = keyof typeof categoryConfig;
