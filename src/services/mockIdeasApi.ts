// Mock API service for ideas management when backend API is not available
interface MockIdea {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  tags: string[];
  assignedTo: string;
  upvotes: number;
  comments: number;
  dueDate: string;
  createdDate: string;
}

interface MockLike {
  id: string;
  ideaId: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface MockApiResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
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
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// Mock data storage
let mockIdeas: MockIdea[] = [
  {
    id: '84f8a6f5-c3e3-4f12-9971-6857026c597c',
    title: 'AI-Powered Code Review Assistant',
    description: 'Develop an AI assistant that can automatically review code changes, suggest improvements, and detect potential bugs before deployment.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    tags: ['AI', 'Code Review', 'Automation'],
    assignedTo: 'John Doe',
    upvotes: 15,
    comments: 8,
    dueDate: '2024-02-15',
    createdDate: '2024-01-10'
  },
  {
    id: '92a1b2c3-d4e5-4f67-8901-234567890abc',
    title: 'Mobile App for Team Collaboration',
    description: 'Create a mobile application that allows team members to collaborate on projects, share files, and communicate in real-time.',
    priority: 'MEDIUM',
    status: 'PENDING',
    tags: ['Mobile', 'Collaboration', 'Communication'],
    assignedTo: 'Sarah Smith',
    upvotes: 12,
    comments: 5,
    dueDate: '2024-03-01',
    createdDate: '2024-01-12'
  },
  {
    id: '45e6f7g8-h9i0-4j12-3456-789012345def',
    title: 'Automated Testing Framework',
    description: 'Build a comprehensive automated testing framework that can handle unit tests, integration tests, and end-to-end testing.',
    priority: 'HIGH',
    status: 'COMPLETED',
    tags: ['Testing', 'Automation', 'Quality Assurance'],
    assignedTo: 'Mike Johnson',
    upvotes: 20,
    comments: 12,
    dueDate: '2024-01-30',
    createdDate: '2024-01-05'
  }
];

let mockLikes: MockLike[] = [
  {
    id: 'like-1',
    ideaId: '84f8a6f5-c3e3-4f12-9971-6857026c597c',
    userId: 'user-1',
    userName: 'Alice Johnson',
    createdAt: '2024-01-11T10:00:00Z'
  },
  {
    id: 'like-2',
    ideaId: '84f8a6f5-c3e3-4f12-9971-6857026c597c',
    userId: 'user-2',
    userName: 'Bob Smith',
    createdAt: '2024-01-11T11:00:00Z'
  }
];

// Helper function to create mock API response
function createMockResponse<T>(data: T[], page = 0, size = 20): MockApiResponse<T> {
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

// Mock API functions
export const mockIdeasApi = {
  // Ideas endpoints
  async getIdeas(): Promise<MockApiResponse<MockIdea>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return createMockResponse(mockIdeas);
  },

  async createIdea(data: Partial<MockIdea>): Promise<MockIdea> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newIdea: MockIdea = {
      id: Date.now().toString(),
      title: data.title || '',
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      status: data.status || 'PENDING',
      tags: data.tags || [],
      assignedTo: data.assignedTo || '',
      upvotes: 0,
      comments: 0,
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0]
    };
    mockIdeas.push(newIdea);
    return newIdea;
  },

  async updateIdea(id: string, data: Partial<MockIdea>): Promise<MockIdea> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockIdeas.findIndex(idea => idea.id === id);
    if (index === -1) throw new Error('Idea not found');
    
    mockIdeas[index] = {
      ...mockIdeas[index],
      ...data
    };
    return mockIdeas[index];
  },

  async deleteIdea(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockIdeas.findIndex(idea => idea.id === id);
    if (index === -1) throw new Error('Idea not found');
    mockIdeas.splice(index, 1);
  },

  // Like endpoints
  async getLikes(ideaId: string): Promise<MockApiResponse<MockLike>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const likes = mockLikes.filter(like => like.ideaId === ideaId);
    return createMockResponse(likes);
  },

  async addLike(ideaId: string, userId: string = 'current-user', userName: string = 'Current User'): Promise<MockLike> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if user already liked this idea
    const existingLike = mockLikes.find(like => like.ideaId === ideaId && like.userId === userId);
    if (existingLike) {
      throw new Error('User already liked this idea');
    }

    const newLike: MockLike = {
      id: Date.now().toString(),
      ideaId,
      userId,
      userName,
      createdAt: new Date().toISOString()
    };
    
    mockLikes.push(newLike);
    
    // Update upvotes count in the idea
    const ideaIndex = mockIdeas.findIndex(idea => idea.id === ideaId);
    if (ideaIndex !== -1) {
      mockIdeas[ideaIndex].upvotes += 1;
    }
    
    return newLike;
  },

  async removeLike(ideaId: string, userId: string = 'current-user'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const likeIndex = mockLikes.findIndex(like => like.ideaId === ideaId && like.userId === userId);
    if (likeIndex === -1) {
      throw new Error('Like not found');
    }
    
    mockLikes.splice(likeIndex, 1);
    
    // Update upvotes count in the idea
    const ideaIndex = mockIdeas.findIndex(idea => idea.id === ideaId);
    if (ideaIndex !== -1) {
      mockIdeas[ideaIndex].upvotes = Math.max(0, mockIdeas[ideaIndex].upvotes - 1);
    }
  },

  // Upvote endpoint (legacy support)
  async upvoteIdea(ideaId: string): Promise<void> {
    await this.addLike(ideaId);
  }
};

// Feature flag to enable/disable mock API
export const USE_MOCK_IDEAS_API = true; // Set to false when backend API is fixed
