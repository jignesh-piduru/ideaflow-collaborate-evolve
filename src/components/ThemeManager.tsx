import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';

interface ThemeManagerProps {
  userId: string;
}

interface ThemeOption {
  id: string;
  name: string;
  color: string;
  gradient: string;
}

const ThemeManager = ({ userId }: ThemeManagerProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('blue');
  const { toast } = useToast();

  // Predefined theme options matching the design
  const themeOptions: ThemeOption[] = [
    {
      id: 'blue',
      name: 'Blue',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
    },
    {
      id: 'purple',
      name: 'Purple',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
    },
    {
      id: 'green',
      name: 'Green',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    }
  ];

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themeOptions.find(theme => theme.id === savedTheme)) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);

    // Apply theme to the application
    const selectedThemeOption = themeOptions.find(theme => theme.id === themeId);
    if (selectedThemeOption) {
      // Store theme preference in localStorage
      localStorage.setItem('selectedTheme', themeId);

      // Apply CSS custom properties for theme
      document.documentElement.style.setProperty('--primary-color', selectedThemeOption.color);

      toast({
        title: "Theme Applied",
        description: `${selectedThemeOption.name} theme has been applied successfully!`,
      });
    }
  };



  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-purple-600" />
          <span>Theme Customization</span>
        </CardTitle>
        <CardDescription>Personalize your workspace appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          {themeOptions.map((theme) => (
            <div
              key={theme.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedTheme === theme.id
                  ? 'transform scale-105'
                  : 'hover:transform hover:scale-102'
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {/* Theme Color Swatch */}
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-transparent hover:border-gray-200 transition-colors">
                <div
                  className="w-full h-16 rounded-xl mb-4 shadow-sm"
                  style={{ background: theme.gradient }}
                />
                <div className="text-center">
                  <h3 className="font-medium text-gray-900">{theme.name}</h3>
                </div>
              </div>

              {/* Selected Indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeManager;
