// Mock API service for evidence management
interface MockEvidence {
  id: string;
  title: string;
  description?: string;
  type: 'FILE' | 'IMAGE' | 'LINK' | 'TEXT' | 'DOCUMENT';
  fileName?: string;
  fileSize?: string;
  url?: string;
  projectId: string;
  projectName: string;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  tags: string[];
  mimeType?: string;
  downloadUrl?: string;
}

interface MockProject {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface MockVaultSettings {
  id: string;
  encryptionEnabled: boolean;
  autoBackupEnabled: boolean;
  aiLabelingEnabled: boolean;
  maxFileSize: string;
  allowedFileTypes: string[];
  retentionPeriod: number;
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

// LocalStorage keys for persistence
const STORAGE_KEYS = {
  EVIDENCE: 'mockEvidence',
  PROJECTS: 'mockProjects',
  USERS: 'mockUsers',
  VAULT_SETTINGS: 'mockVaultSettings'
};

// Load data from localStorage or use defaults
const loadFromStorage = <T>(key: string, defaultData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultData;
  }
};

// Save data to localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

// Default mock data
const defaultMockEvidence: MockEvidence[] = [
  {
    id: '1',
    title: 'Database Schema Design',
    description: 'Updated database schema with new tables for user management',
    type: 'document',
    fileName: 'database_schema_v2.pdf',
    fileSize: '2.4 MB',
    projectId: '1',
    projectName: 'AI Customer Support',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-01-20',
    category: 'Database',
    status: 'validated',
    tags: ['database', 'schema', 'design'],
    mimeType: 'application/pdf',
    downloadUrl: '/files/database_schema_v2.pdf'
  },
  {
    id: '2',
    title: 'API Testing Results',
    description: 'Postman collection results showing successful API endpoints',
    type: 'image',
    fileName: 'api_test_results.png',
    fileSize: '1.8 MB',
    projectId: '1',
    projectName: 'AI Customer Support',
    uploadedBy: 'Sarah Smith',
    uploadedAt: '2024-01-18',
    category: 'API Development',
    status: 'pending',
    tags: ['api', 'testing', 'postman'],
    mimeType: 'image/png',
    downloadUrl: '/files/api_test_results.png'
  },
  {
    id: '3',
    title: 'Live Demo Link',
    description: 'Working prototype of the mobile app performance improvements',
    type: 'link',
    url: 'https://demo.example.com/mobile-app',
    projectId: '2',
    projectName: 'Mobile Optimization',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '2024-01-16',
    category: 'Go Live',
    status: 'validated',
    tags: ['demo', 'mobile', 'prototype']
  }
];

// Mock data storage with localStorage persistence
let mockEvidence: MockEvidence[] = loadFromStorage(STORAGE_KEYS.EVIDENCE, defaultMockEvidence);

const defaultMockProjects: MockProject[] = [
  {
    id: '1',
    name: 'AI Customer Support',
    description: 'AI-powered customer support system',
    status: 'IN_PROGRESS',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    name: 'Mobile Optimization',
    description: 'Mobile app performance improvements',
    status: 'COMPLETED',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-16'
  },
  {
    id: '3',
    name: 'Blockchain Payments',
    description: 'Blockchain-based payment system',
    status: 'PENDING',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

const defaultMockUsers: MockUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    department: 'Engineering'
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    role: 'employee',
    department: 'Development'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'employee',
    department: 'QA'
  }
];

const defaultMockVaultSettings: MockVaultSettings = {
  id: '1',
  encryptionEnabled: true,
  autoBackupEnabled: true,
  aiLabelingEnabled: false,
  maxFileSize: '50MB',
  allowedFileTypes: ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'txt'],
  retentionPeriod: 365
};

let mockProjects: MockProject[] = loadFromStorage(STORAGE_KEYS.PROJECTS, defaultMockProjects);
let mockUsers: MockUser[] = loadFromStorage(STORAGE_KEYS.USERS, defaultMockUsers);
let mockVaultSettings: MockVaultSettings = loadFromStorage(STORAGE_KEYS.VAULT_SETTINGS, defaultMockVaultSettings);

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
export const mockEvidenceApi = {
  // Evidence endpoints
  async getEvidence(): Promise<MockApiResponse<MockEvidence>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return createMockResponse(mockEvidence);
  },

  async createEvidence(data: Partial<MockEvidence>): Promise<MockEvidence> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newEvidence: MockEvidence = {
      id: Date.now().toString(),
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'DOCUMENT',
      fileName: data.fileName,
      fileSize: data.fileSize,
      url: data.url,
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      uploadedBy: data.uploadedBy || 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
      uploadedAt: new Date().toISOString().split('T')[0],
      category: data.category || 'Other',
      status: data.status || 'PENDING',
      tags: data.tags || [],
      mimeType: data.mimeType,
      downloadUrl: data.downloadUrl
    };
    mockEvidence.push(newEvidence);
    saveToStorage(STORAGE_KEYS.EVIDENCE, mockEvidence);
    return newEvidence;
  },

  async updateEvidence(id: string, data: Partial<MockEvidence>): Promise<MockEvidence> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockEvidence.findIndex(evidence => evidence.id === id);
    if (index === -1) throw new Error('Evidence not found');

    mockEvidence[index] = {
      ...mockEvidence[index],
      ...data
    };
    saveToStorage(STORAGE_KEYS.EVIDENCE, mockEvidence);
    return mockEvidence[index];
  },

  async deleteEvidence(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockEvidence.findIndex(evidence => evidence.id === id);
    if (index === -1) throw new Error('Evidence not found');
    mockEvidence.splice(index, 1);
    saveToStorage(STORAGE_KEYS.EVIDENCE, mockEvidence);
  },

  // Projects endpoints
  async getProjects(): Promise<MockApiResponse<MockProject>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return createMockResponse(mockProjects);
  },

  // Users endpoints
  async getUsers(): Promise<MockApiResponse<MockUser>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return createMockResponse(mockUsers);
  },

  // Vault settings endpoints
  async getVaultSettings(): Promise<MockVaultSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockVaultSettings;
  },

  async updateVaultSettings(data: Partial<MockVaultSettings>): Promise<MockVaultSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockVaultSettings = {
      ...mockVaultSettings,
      ...data
    };
    saveToStorage(STORAGE_KEYS.VAULT_SETTINGS, mockVaultSettings);
    return mockVaultSettings;
  },

  // File upload simulation
  async uploadFile(
    file: File,
    projectId: string,
    category: string,
    title: string,
    description: string,
    currentUserId?: string,
    tags?: string[],
    status?: string
  ): Promise<MockEvidence> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload time

    const fileType = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
    const project = mockProjects.find(p => p.id === projectId);

    // Use provided currentUserId or default
    const uploadedBy = currentUserId || 'afde270f-a1c4-4b75-a3d7-ba861609df0c';

    return this.createEvidence({
      title,
      description,
      type: fileType,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      projectId,
      projectName: project?.name || 'Unknown Project',
      category,
      mimeType: file.type,
      uploadedBy,
      tags: tags || [],
      status: status || 'PENDING',
      downloadUrl: `/files/${file.name}`
    });
  }
};

// Feature flag to enable/disable mock API
export const USE_MOCK_EVIDENCE_API = false; // Set to false when backend API is ready

// Real API service for evidence management
export const realEvidenceApi = {
  // Evidence endpoints
  async getEvidence(): Promise<MockApiResponse<MockEvidence>> {
    const response = await fetch('http://localhost:8080/api/evidence?page=0&size=20&sort=uploadedAt&direction=desc');
    if (!response.ok) {
      throw new Error(`Failed to fetch evidence: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  async createEvidence(data: Partial<MockEvidence>, currentUserId?: string): Promise<MockEvidence> {
    // For non-file evidence (LINK, TEXT), use multipart form data to match the API
    const formData = new FormData();
    formData.append('title', data.title || '');
    if (data.description) formData.append('description', data.description);
    formData.append('type', data.type || 'TEXT');
    formData.append('category', data.category || '');
    formData.append('projectId', data.projectId || '');

    // Use provided uploadedBy, currentUserId, or fetch current user
    let uploadedBy = data.uploadedBy || currentUserId;
    if (!uploadedBy) {
      try {
        const currentUser = await this.getCurrentUser();
        uploadedBy = currentUser.id;
      } catch (error) {
        console.warn('Could not get current user, using default:', error);
        uploadedBy = 'afde270f-a1c4-4b75-a3d7-ba861609df0c'; // Default user ID from your curl
      }
    }
    formData.append('uploadedBy', uploadedBy);

    // Add optional fields
    if (data.url) formData.append('url', data.url);
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', data.tags.join(','));
    }
    if (data.status) formData.append('status', data.status);

    const response = await fetch('http://localhost:8080/api/evidence', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create evidence: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  async updateEvidence(id: string, data: Partial<MockEvidence>): Promise<MockEvidence> {
    const response = await fetch(`http://localhost:8080/api/evidence/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update evidence: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  async deleteEvidence(id: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/evidence/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete evidence: ${response.status} ${response.statusText} - ${errorText}`);
    }
  },

  async getEvidenceById(id: string): Promise<MockEvidence> {
    const response = await fetch(`http://localhost:8080/api/evidence/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to get evidence: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Projects endpoints
  async getProjects(): Promise<MockApiResponse<MockProject>> {
    const response = await fetch('http://localhost:8080/api/projects?page=0&size=100&sort=name');
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Users endpoints
  async getUsers(): Promise<MockApiResponse<MockUser>> {
    const response = await fetch('http://localhost:8080/api/users?page=0&size=100&sort=name');
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Vault settings endpoints
  async getVaultSettings(): Promise<MockVaultSettings> {
    const response = await fetch('http://localhost:8080/api/vault-settings');
    if (!response.ok) {
      throw new Error(`Failed to fetch vault settings: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  async updateVaultSettings(data: Partial<MockVaultSettings>): Promise<MockVaultSettings> {
    const response = await fetch('http://localhost:8080/api/vault-settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to update vault settings: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // File upload - matches your working curl command
  async uploadFile(
    file: File,
    projectId: string,
    category: string,
    title: string,
    description: string,
    currentUserId?: string,
    tags?: string[],
    status?: string
  ): Promise<MockEvidence> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('projectId', projectId);
    formData.append('category', category);
    formData.append('type', file.type.startsWith('image/') ? 'IMAGE' : 'FILE');

    // Use provided currentUserId or fetch current user
    let uploadedBy = currentUserId;
    if (!uploadedBy) {
      try {
        const currentUser = await this.getCurrentUser();
        uploadedBy = currentUser.id;
      } catch (error) {
        console.warn('Could not get current user, using default:', error);
        uploadedBy = 'afde270f-a1c4-4b75-a3d7-ba861609df0c'; // Default user ID from your curl
      }
    }
    formData.append('uploadedBy', uploadedBy);

    // Add optional fields
    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }
    if (status) {
      formData.append('status', status);
    }

    const response = await fetch('http://localhost:8080/api/evidence', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  // Get current user
  async getCurrentUser(): Promise<MockUser> {
    try {
      // Try to get current user from API
      const response = await fetch('http://localhost:8080/api/users/current', {
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        return await response.json();
      }

      // Fallback: get first user from users list
      const usersResponse = await fetch('http://localhost:8080/api/users?page=0&size=1');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        if (usersData.content && usersData.content.length > 0) {
          return usersData.content[0];
        }
      }

      // Return default user if all else fails
      return {
        id: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
        name: 'Default User',
        email: 'user@company.com',
        role: 'admin',
        department: 'IT'
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Return default user on error
      return {
        id: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
        name: 'Default User',
        email: 'user@company.com',
        role: 'admin',
        department: 'IT'
      };
    }
  }
};


