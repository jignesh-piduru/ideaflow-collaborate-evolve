import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  fetchCurrentUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      
      // Try to get current user from API
      const response = await fetch('http://localhost:8080/api/users/current', {
        headers: {
          'Accept': 'application/json',
          // Add authorization header if you have authentication
          // 'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        // Fallback: get first user from users list
        const usersResponse = await fetch('http://localhost:8080/api/users?page=0&size=1');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData.content && usersData.content.length > 0) {
            const firstUser = usersData.content[0];
            setCurrentUser({
              id: firstUser.id,
              name: firstUser.name,
              email: firstUser.email,
              role: firstUser.role || 'employee',
              department: firstUser.department || 'General'
            });
          } else {
            // Create a default user if no users exist
            setCurrentUser({
              id: '785f858a-b243-4756-8008-aa062292ef60', // Default user ID
              name: 'Default User',
              email: 'user@company.com',
              role: 'admin',
              department: 'IT'
            });
          }
        } else {
          // Fallback to default user
          setCurrentUser({
            id: '785f858a-b243-4756-8008-aa062292ef60',
            name: 'Default User',
            email: 'user@company.com',
            role: 'admin',
            department: 'IT'
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Set default user on error
      setCurrentUser({
        id: '785f858a-b243-4756-8008-aa062292ef60',
        name: 'Default User',
        email: 'user@company.com',
        role: 'admin',
        department: 'IT'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value: UserContextType = {
    currentUser,
    setCurrentUser,
    isLoading,
    fetchCurrentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
