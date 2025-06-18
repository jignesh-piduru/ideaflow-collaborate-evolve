// Dashboard API service for user-themes, integration-settings, and roles
interface UserTheme {
  id: string;
  userId: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationSetting {
  id: string;
  userId: string;
  type: 'GITHUB' | 'SLACK' | 'JIRA' | 'TEAMS' | 'DISCORD';
  connected: boolean;
  config: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: 'ADMIN' | 'EMPLOYEE' | 'MANAGER' | 'VIEWER';
  description: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
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

// Mock data
const mockUserThemes: UserTheme[] = [
  {
    id: '1',
    userId: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
    name: 'Blue Theme',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#F8FAFC',
    textColor: '#1F2937',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    userId: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
    name: 'Dark Theme',
    primaryColor: '#6366F1',
    secondaryColor: '#4F46E5',
    backgroundColor: '#111827',
    textColor: '#F9FAFB',
    isActive: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const mockIntegrationSettings: IntegrationSetting[] = [
  {
    id: '1',
    userId: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
    type: 'GITHUB',
    connected: false,
    config: '{"token": "your-github-token"}',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    userId: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
    type: 'SLACK',
    connected: true,
    config: '{"webhook": "https://hooks.slack.com/services/..."}',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'ADMIN',
    description: 'Administrator role with full access',
    permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE_USERS', 'MANAGE_ROLES'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'EMPLOYEE',
    description: 'Standard employee role',
    permissions: ['CREATE', 'READ', 'UPDATE'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

// Storage keys for localStorage
const STORAGE_KEYS = {
  USER_THEMES: 'dashboard_user_themes',
  INTEGRATION_SETTINGS: 'dashboard_integration_settings',
  ROLES: 'dashboard_roles'
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

// Initialize mock data in localStorage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.USER_THEMES)) {
    saveToStorage(STORAGE_KEYS.USER_THEMES, mockUserThemes);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INTEGRATION_SETTINGS)) {
    saveToStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, mockIntegrationSettings);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    saveToStorage(STORAGE_KEYS.ROLES, mockRoles);
  }
}

// Feature flag to enable/disable mock API
export const USE_MOCK_DASHBOARD_API = false; // Set to false when backend API is ready

// Mock API service
export const mockDashboardApi = {
  // User Themes
  async getUserThemes(): Promise<ApiResponse<UserTheme>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const themes = loadFromStorage(STORAGE_KEYS.USER_THEMES, mockUserThemes);
    return createMockResponse(themes);
  },

  async createUserTheme(data: Partial<UserTheme>): Promise<UserTheme> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const themes = loadFromStorage(STORAGE_KEYS.USER_THEMES, mockUserThemes);
    const newTheme: UserTheme = {
      id: Date.now().toString(),
      userId: data.userId || 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
      name: data.name || 'New Theme',
      primaryColor: data.primaryColor || '#3B82F6',
      secondaryColor: data.secondaryColor || '#1E40AF',
      backgroundColor: data.backgroundColor || '#F8FAFC',
      textColor: data.textColor || '#1F2937',
      isActive: data.isActive || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    themes.push(newTheme);
    saveToStorage(STORAGE_KEYS.USER_THEMES, themes);
    return newTheme;
  },

  async updateUserTheme(id: string, data: Partial<UserTheme>): Promise<UserTheme> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const themes = loadFromStorage(STORAGE_KEYS.USER_THEMES, mockUserThemes);
    const index = themes.findIndex(theme => theme.id === id);
    if (index === -1) throw new Error('Theme not found');
    
    themes[index] = { ...themes[index], ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.USER_THEMES, themes);
    return themes[index];
  },

  async deleteUserTheme(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const themes = loadFromStorage(STORAGE_KEYS.USER_THEMES, mockUserThemes);
    const filteredThemes = themes.filter(theme => theme.id !== id);
    saveToStorage(STORAGE_KEYS.USER_THEMES, filteredThemes);
  },

  // Integration Settings
  async getIntegrationSettings(): Promise<ApiResponse<IntegrationSetting>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const settings = loadFromStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, mockIntegrationSettings);
    return createMockResponse(settings);
  },

  async createIntegrationSetting(data: Partial<IntegrationSetting>): Promise<IntegrationSetting> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const settings = loadFromStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, mockIntegrationSettings);
    const newSetting: IntegrationSetting = {
      id: Date.now().toString(),
      userId: data.userId || 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
      type: data.type || 'GITHUB',
      connected: data.connected || false,
      config: data.config || '{}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    settings.push(newSetting);
    saveToStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, settings);
    return newSetting;
  },

  async updateIntegrationSetting(id: string, data: Partial<IntegrationSetting>): Promise<IntegrationSetting> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const settings = loadFromStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, mockIntegrationSettings);
    const index = settings.findIndex(setting => setting.id === id);
    if (index === -1) throw new Error('Integration setting not found');
    
    settings[index] = { ...settings[index], ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, settings);
    return settings[index];
  },

  async deleteIntegrationSetting(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const settings = loadFromStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, mockIntegrationSettings);
    const filteredSettings = settings.filter(setting => setting.id !== id);
    saveToStorage(STORAGE_KEYS.INTEGRATION_SETTINGS, filteredSettings);
  },

  // Roles
  async getRoles(): Promise<ApiResponse<Role>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roles = loadFromStorage(STORAGE_KEYS.ROLES, mockRoles);
    return createMockResponse(roles);
  },

  async createRole(data: Partial<Role>): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roles = loadFromStorage(STORAGE_KEYS.ROLES, mockRoles);
    const newRole: Role = {
      id: Date.now().toString(),
      name: data.name || 'EMPLOYEE',
      description: data.description || 'New role',
      permissions: Array.isArray(data.permissions) ? data.permissions : ['READ'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    roles.push(newRole);
    saveToStorage(STORAGE_KEYS.ROLES, roles);
    return newRole;
  },

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roles = loadFromStorage(STORAGE_KEYS.ROLES, mockRoles);
    const index = roles.findIndex(role => role.id === id);
    if (index === -1) throw new Error('Role not found');
    
    roles[index] = { ...roles[index], ...data, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.ROLES, roles);
    return roles[index];
  },

  async deleteRole(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roles = loadFromStorage(STORAGE_KEYS.ROLES, mockRoles);
    const filteredRoles = roles.filter(role => role.id !== id);
    saveToStorage(STORAGE_KEYS.ROLES, filteredRoles);
  }
};

// Real API service for dashboard management
export const realDashboardApi = {
  // User Themes CRUD
  async getUserThemes(): Promise<ApiResponse<UserTheme>> {
    const response = await fetch('http://localhost:8080/api/user-themes', {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user themes: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  async createUserTheme(data: Partial<UserTheme>): Promise<UserTheme> {
    const response = await fetch('http://localhost:8080/api/user-themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user theme: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  async updateUserTheme(id: string, data: Partial<UserTheme>): Promise<UserTheme> {
    const response = await fetch(`http://localhost:8080/api/user-themes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update user theme: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  async deleteUserTheme(id: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/user-themes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete user theme: ${response.status} ${response.statusText} - ${errorText}`);
    }
  },

  // Integration Settings CRUD
  async getIntegrationSettings(): Promise<ApiResponse<IntegrationSetting>> {
    const response = await fetch('http://localhost:8080/api/integration-settings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch integration settings: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  async createIntegrationSetting(data: Partial<IntegrationSetting>): Promise<IntegrationSetting> {
    const response = await fetch('http://localhost:8080/api/integration-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create integration setting: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  async updateIntegrationSetting(id: string, data: Partial<IntegrationSetting>): Promise<IntegrationSetting> {
    const response = await fetch(`http://localhost:8080/api/integration-settings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update integration setting: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  async deleteIntegrationSetting(id: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/integration-settings/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete integration setting: ${response.status} ${response.statusText} - ${errorText}`);
    }
  },

  // Roles CRUD
  async getRoles(): Promise<ApiResponse<Role>> {
    const response = await fetch('http://localhost:8080/api/roles', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    // Ensure all roles have permissions as arrays
    if (result.content) {
      result.content = result.content.map((role: any) => ({
        ...role,
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      }));
    }
    return result;
  },

  async createRole(data: Partial<Role>): Promise<Role> {
    const requestData = {
      ...data,
      permissions: Array.isArray(data.permissions) ? data.permissions : ['READ']
    };

    const response = await fetch('http://localhost:8080/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create role: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    // Ensure permissions is always an array
    return {
      ...result,
      permissions: Array.isArray(result.permissions) ? result.permissions : []
    };
  },

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const response = await fetch(`http://localhost:8080/api/roles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update role: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  },

  async deleteRole(id: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/roles/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete role: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }
};

export type { UserTheme, IntegrationSetting, Role, ApiResponse };
