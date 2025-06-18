
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, Database, Settings, ArrowRight, CheckCircle, Star, Shield } from 'lucide-react';
import Dashboard from './Dashboard';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'employee'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo authentication
    if (email && password) {
      setUserRole('admin'); // Default to admin for testing
      setIsAuthenticated(true);
    }
  };

  if (isAuthenticated) {
    return <Dashboard userRole={userRole} onLogout={() => setIsAuthenticated(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">IdeaFlow</span>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Contact</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="fade-in">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-4 h-4 mr-1" />
              Trusted by 500+ Companies
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Transform Ideas Into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600"> Reality</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your innovation process with our comprehensive idea management platform. 
              From concept to deployment, track every step of your development journey.
            </p>
          </div>

          <div className="slide-up grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <Card className="hover-lift glass-card">
              <CardHeader>
                <Lightbulb className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
                <CardTitle>Idea Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Centralize and organize all your innovative ideas in one place</p>
              </CardContent>
            </Card>

            <Card className="hover-lift glass-card">
              <CardHeader>
                <Users className="w-12 h-12 text-indigo-500 mb-4 mx-auto" />
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Seamless collaboration with comments, assignments, and tracking</p>
              </CardContent>
            </Card>

            <Card className="hover-lift glass-card">
              <CardHeader>
                <Database className="w-12 h-12 text-purple-500 mb-4 mx-auto" />
                <CardTitle>Full Lifecycle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Track from database design to API development and deployment</p>
              </CardContent>
            </Card>
          </div>

          {/* Authentication Section */}
          <Card className="max-w-md mx-auto glass-card hover-lift">
            <CardHeader>
              <CardTitle className="text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your idea management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Email (try admin@company.com)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input type="text" placeholder="Full Name" />
                    <Input type="email" placeholder="Email" />
                    <Input type="password" placeholder="Password" />
                    <Input type="password" placeholder="Confirm Password" />
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle, title: "Progress Tracking", desc: "Monitor every stage from concept to deployment" },
              { icon: Shield, title: "Role-Based Access", desc: "Admin and employee roles with appropriate permissions" },
              { icon: Database, title: "Evidence Management", desc: "Upload and organize supporting documents and files" },
              { icon: Users, title: "Team Assignments", desc: "Assign ideas to team members and track progress" },
              { icon: Settings, title: "API Integration", desc: "Track API development and testing phases" },
              { icon: Star, title: "Go-Live Tracking", desc: "Monitor deployment and launch status" }
            ].map((feature, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-blue-500 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">IdeaFlow</span>
              </div>
              <p className="text-gray-400">Transforming innovative ideas into successful products.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API Documentation</li>
                <li>Integrations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="text-gray-400 space-y-2">
                <p>123 Innovation Street</p>
                <p>Tech Valley, CA 94000</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: hello@ideaflow.com</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IdeaFlow. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
