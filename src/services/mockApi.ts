// Mock API service for development when backend CORS is not configured
interface MockDeployment {
  id: string;
  name: string;
  environment: string;
  status: string;
  version: string;
  deployedAt?: string;
  branch?: string;
  commitHash?: string;
  health?: string;
  progress?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MockEnvironment {
  id: string;
  name: string;
  status: string;
  deployments?: number;
  lastUpdate?: string;
  description?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
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
let mockDeployments: MockDeployment[] = [
  {
    id: '1',
    name: 'Frontend Application',
    environment: 'PRODUCTION',
    status: 'DEPLOYED',
    version: 'v1.2.0',
    branch: 'main',
    commitHash: 'abc123f',
    health: 'HEALTHY',
    description: 'Main frontend application deployment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deployedAt: '2 hours ago'
  },
  {
    id: '2',
    name: 'API Service',
    environment: 'STAGING',
    status: 'PENDING',
    version: 'v2.1.0',
    branch: 'develop',
    commitHash: 'def456g',
    health: 'UNKNOWN',
    description: 'Backend API service',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let mockEnvironments: MockEnvironment[] = [
  {
    id: '1',
    name: 'Production',
    status: 'ACTIVE',
    deployments: 5,
    lastUpdate: '1 hour ago',
    description: 'Production environment',
    url: 'https://app.example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Staging',
    status: 'ACTIVE',
    deployments: 3,
    lastUpdate: '30 minutes ago',
    description: 'Staging environment for testing',
    url: 'https://staging.example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
export const mockApi = {
  // Deployment endpoints
  async getDeployments(): Promise<MockApiResponse<MockDeployment>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return createMockResponse(mockDeployments);
  },

  async createDeployment(data: Partial<MockDeployment>): Promise<MockDeployment> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newDeployment: MockDeployment = {
      id: Date.now().toString(),
      name: data.name || '',
      environment: data.environment || 'DEVELOPMENT',
      status: data.status || 'PENDING',
      version: data.version || 'v1.0.0',
      branch: data.branch || 'main',
      commitHash: data.commitHash || '',
      health: data.health || 'UNKNOWN',
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockDeployments.push(newDeployment);
    return newDeployment;
  },

  async updateDeployment(id: string, data: Partial<MockDeployment>): Promise<MockDeployment> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockDeployments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deployment not found');
    
    mockDeployments[index] = {
      ...mockDeployments[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return mockDeployments[index];
  },

  async deleteDeployment(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockDeployments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Deployment not found');
    mockDeployments.splice(index, 1);
  },

  // Environment endpoints
  async getEnvironments(): Promise<MockApiResponse<MockEnvironment>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return createMockResponse(mockEnvironments);
  },

  async createEnvironment(data: Partial<MockEnvironment>): Promise<MockEnvironment> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newEnvironment: MockEnvironment = {
      id: Date.now().toString(),
      name: data.name || '',
      status: 'ACTIVE',
      deployments: 0,
      lastUpdate: 'Just now',
      description: data.description || '',
      url: data.url || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockEnvironments.push(newEnvironment);
    return newEnvironment;
  },

  async updateEnvironment(id: string, data: Partial<MockEnvironment>): Promise<MockEnvironment> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockEnvironments.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Environment not found');
    
    mockEnvironments[index] = {
      ...mockEnvironments[index],
      ...data,
      updatedAt: new Date().toISOString(),
      lastUpdate: 'Just now'
    };
    return mockEnvironments[index];
  },

  async deleteEnvironment(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockEnvironments.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Environment not found');
    mockEnvironments.splice(index, 1);
  }
};

// Feature flag to enable/disable mock API
export const USE_MOCK_API = true; // Set to false when backend CORS is fixed
