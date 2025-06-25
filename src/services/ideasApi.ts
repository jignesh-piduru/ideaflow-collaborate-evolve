// Ideas API service for idea management system
interface Idea {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo: string;
  upvotes: number;
  comments: number;
  dueDate: string;
  createdDate: string;
  tags: string[];
  updatedAt?: string;
}

interface ApiResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { empty: boolean; unsorted: boolean; sorted: boolean };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: { empty: boolean; unsorted: boolean; sorted: boolean };
  numberOfElements: number;
  empty: boolean;
}

// Mock data based on your curl command structure
const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Build Notification Center',
    description: 'Centralize email and in-app notifications for user events.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'David Lee',
    upvotes: 15,
    comments: 5,
    dueDate: '2025-07-20',
    createdDate: '2025-06-12',
    tags: ['notifications', 'backend', 'frontend']
  },
  {
    id: '2',
    title: 'AI-Powered Code Review Assistant',
    description: 'Develop an AI assistant that can automatically review code changes, suggest improvements, and detect potential bugs before deployment.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'John Doe',
    upvotes: 23,
    comments: 8,
    dueDate: '2025-08-15',
    createdDate: '2025-06-10',
    tags: ['AI', 'code-review', 'automation']
  },
  {
    id: '3',
    title: 'Mobile App Dark Mode',
    description: 'Implement dark mode theme for better user experience during night time usage.',
    priority: 'MEDIUM',
    status: 'PENDING',
    assignedTo: 'Sarah Smith',
    upvotes: 12,
    comments: 3,
    dueDate: '2025-07-30',
    createdDate: '2025-06-15',
    tags: ['mobile', 'ui', 'theme']
  }
];

// Storage keys for localStorage
const STORAGE_KEYS = {
  IDEAS: 'ideas_data'
};

// Helper functions
function loadFromStorage<T>(key: string, defaultData: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch {
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

function createMockResponse<T>(data: T[], page = 0, size = 20): ApiResponse<T> {
  return {
    content: data,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: { empty: false, unsorted: false, sorted: true },
      offset: page * size,
      unpaged: false,
      paged: true
    },
    last: true,
    totalElements: data.length,
    totalPages: 1,
    first: true,
    size: size,
    number: page,
    sort: { empty: false, unsorted: false, sorted: true },
    numberOfElements: data.length,
    empty: data.length === 0
  };
}

// Helper function to validate and normalize idea data
function validateIdea(idea: any): Idea {
  return {
    ...idea,
    id: idea.id || Date.now().toString(),
    title: idea.title || 'Untitled Idea',
    description: idea.description || '',
    priority: idea.priority || 'MEDIUM',
    status: idea.status || 'PENDING',
    assignedTo: idea.assignedTo || '',
    upvotes: typeof idea.upvotes === 'number' ? idea.upvotes : 0,
    comments: typeof idea.comments === 'number' ? idea.comments : 0,
    dueDate: idea.dueDate || new Date().toISOString().split('T')[0],
    createdDate: idea.createdDate || new Date().toISOString().split('T')[0],
    tags: Array.isArray(idea.tags) ? idea.tags : [],
    updatedAt: idea.updatedAt || new Date().toISOString()
  };
}

// Initialize mock data in localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
    saveToStorage(STORAGE_KEYS.IDEAS, mockIdeas);
  }
}

// Feature flag to enable/disable mock API
export const USE_MOCK_IDEAS_API = false; // Set to false to use real backend API at http://localhost:8080

// Mock API service
export const mockIdeasApi = {
  async getIdeas(employeeId?: string): Promise<ApiResponse<Idea>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let ideas = loadFromStorage(STORAGE_KEYS.IDEAS, mockIdeas);
    if (employeeId) {
      ideas = ideas.filter(idea => idea.assignedTo === employeeId);
    }
    const validatedIdeas = ideas.map(validateIdea);
    return createMockResponse(validatedIdeas);
  },

  async getIdeaById(id: string, employeeId?: string): Promise<Idea> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let ideas = loadFromStorage(STORAGE_KEYS.IDEAS, mockIdeas);
    let idea;
    if (employeeId) {
      idea = ideas.find(idea => idea.id === id && idea.assignedTo === employeeId);
    } else {
      idea = ideas.find(idea => idea.id === id);
    }
    if (!idea) throw new Error('Idea not found');
    return validateIdea(idea);
  },

  async createIdea(data: Partial<Idea>, employeeId?: string): Promise<Idea> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const ideas = loadFromStorage(STORAGE_KEYS.IDEAS, mockIdeas);
    const newIdea = validateIdea({
      ...data,
      id: Date.now().toString(),
      assignedTo: employeeId || data.assignedTo || '',
      createdDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    });
    ideas.push(newIdea);
    saveToStorage(STORAGE_KEYS.IDEAS, ideas);
    return newIdea;
  },

  async updateIdea(id: string, data: Partial<Idea>, employeeId?: string): Promise<Idea> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const ideas = loadFromStorage(STORAGE_KEYS.IDEAS, mockIdeas);
    const index = ideas.findIndex(idea => idea.id === id && (!employeeId || idea.assignedTo === employeeId));
    if (index === -1) throw new Error('Idea not found');
    ideas[index] = validateIdea({ ...ideas[index], ...data, assignedTo: employeeId || ideas[index].assignedTo, updatedAt: new Date().toISOString() });
    saveToStorage(STORAGE_KEYS.IDEAS, ideas);
    return ideas[index];
  },

  async deleteIdea(id: string, employeeId?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let ideas = loadFromStorage(STORAGE_KEYS.IDEAS, mockIdeas);
    if (employeeId) {
      ideas = ideas.filter(idea => !(idea.id === id && idea.assignedTo === employeeId));
    } else {
      ideas = ideas.filter(idea => idea.id !== id);
    }
    saveToStorage(STORAGE_KEYS.IDEAS, ideas);
  },

  async upvoteIdea(id: string, employeeId: string): Promise<Idea> {
    return this.updateIdea(id, {
      upvotes: (await this.getIdeaById(id)).upvotes + 1
    });
  },

  async addComment(id: string, comment: string): Promise<Idea> {
    return this.updateIdea(id, {
      comments: (await this.getIdeaById(id)).comments + 1
    });
  }
};

// Real API service for ideas management
export const realIdeasApi = {
  async getIdeas(employeeId?: string): Promise<ApiResponse<Idea>> {
    const url = employeeId
      ? `http://localhost:8080/api/ideas?employeeId=${employeeId}`
      : 'http://localhost:8080/api/ideas';
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) {
      throw new Error(`Failed to fetch ideas: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result.content) {
      result.content = result.content.map(validateIdea);
    }
    return result;
  },

  async getIdeaById(id: string, employeeId?: string): Promise<Idea> {
    let url = `http://localhost:8080/api/ideas/${id}`;
    if (employeeId) {
      url += `?employeeId=${employeeId}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to get idea: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return validateIdea(result);
  },

  async createIdea(data: Partial<Idea>, employeeId?: string): Promise<Idea> {
    const requestData = {
      ...data,
      ...(employeeId ? { employeeId } : {})
    };
    const response = await fetch('http://localhost:8080/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create idea: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    return validateIdea(result);
  },

  async updateIdea(id: string, data: Partial<Idea>, employeeId?: string): Promise<Idea> {
    let url = `http://localhost:8080/api/ideas/${id}`;
    if (employeeId) {
      url += `?employeeId=${employeeId}`;
    }
    const requestData = {
      ...data,
      ...(employeeId ? { employeeId } : {})
    };
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update idea: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    return validateIdea(result);
  },

  async deleteIdea(id: string, employeeId?: string): Promise<void> {
    let url = `http://localhost:8080/api/ideas/${id}`;
    if (employeeId) {
      url += `?employeeId=${employeeId}`;
    }
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete idea: ${response.status} ${response.statusText} - ${errorText}`);
    }
  },

  async upvoteIdea(id: string): Promise<Idea> {
    try {
      const response = await fetch(`http://localhost:8080/api/ideas/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.warn(`Upvote endpoint returned ${response.status}, falling back to PATCH method`);
        // Fallback: use PATCH to increment upvotes
        const currentIdea = await this.getIdeaById(id);
        return await this.updateIdea(id, {
          upvotes: (currentIdea.upvotes || 0) + 1
        });
      }

      const result = await response.json();
      return validateIdea(result);
    } catch (error) {
      console.warn('Upvote endpoint failed, falling back to PATCH method:', error);
      // Fallback: use PATCH to increment upvotes
      const currentIdea = await this.getIdeaById(id);
      return await this.updateIdea(id, {
        upvotes: (currentIdea.upvotes || 0) + 1
      });
    }
  },

  async addComment(id: string, comment: string): Promise<Idea> {
    try {
      const response = await fetch(`http://localhost:8080/api/ideas/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        console.warn(`Comment endpoint returned ${response.status}, falling back to PATCH method`);
        // Fallback: use PATCH to increment comments
        const currentIdea = await this.getIdeaById(id);
        return await this.updateIdea(id, {
          comments: (currentIdea.comments || 0) + 1
        });
      }

      const result = await response.json();
      return validateIdea(result);
    } catch (error) {
      console.warn('Comment endpoint failed, falling back to PATCH method:', error);
      // Fallback: use PATCH to increment comments
      const currentIdea = await this.getIdeaById(id);
      return await this.updateIdea(id, {
        comments: (currentIdea.comments || 0) + 1
      });
    }
  }
};

// Main API service that switches between mock and real API
const ideasApi = USE_MOCK_IDEAS_API ? mockIdeasApi : realIdeasApi;

// Export default API service for easy importing
export default ideasApi;

export type { Idea, ApiResponse };
