
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Star,
  MessageSquare,
  ThumbsUp,
  Eye,
  Clock,
  Lightbulb
} from 'lucide-react';

interface IdeaManagementProps {
  userRole: 'admin' | 'employee';
}

interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'on-hold';
  assignee?: string;
  createdBy: string;
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
}

const IdeaManagement = ({ userRole }: IdeaManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: 1,
      title: 'AI-Powered Customer Support Chat',
      description: 'Implement an intelligent chatbot system that can handle customer queries automatically and escalate complex issues to human agents.',
      category: 'AI/ML',
      priority: 'high',
      status: 'in-progress',
      assignee: 'John Doe',
      createdBy: 'Bhakta Sir',
      createdAt: '2024-01-15',
      likes: 8,
      comments: 3,
      tags: ['AI', 'Customer Service', 'Automation']
    },
    {
      id: 2,
      title: 'Mobile App Performance Optimization',
      description: 'Optimize the mobile application for better performance and reduced load times across different devices.',
      category: 'Mobile',
      priority: 'medium',
      status: 'pending',
      createdBy: 'Sarah Smith',
      createdAt: '2024-01-14',
      likes: 5,
      comments: 2,
      tags: ['Mobile', 'Performance', 'Optimization']
    },
    {
      id: 3,
      title: 'Blockchain Integration for Payments',
      description: 'Research and implement blockchain technology for secure and transparent payment processing.',
      category: 'Blockchain',
      priority: 'high',
      status: 'assigned',
      assignee: 'Mike Johnson',
      createdBy: 'Project Manager',
      createdAt: '2024-01-13',
      likes: 12,
      comments: 7,
      tags: ['Blockchain', 'Payments', 'Security']
    }
  ]);

  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    tags: ''
  });

  const categories = ['All', 'AI/ML', 'Mobile', 'Web', 'Blockchain', 'Database', 'Security', 'UI/UX'];
  const priorities = ['All', 'High', 'Medium', 'Low'];
  const statuses = ['pending', 'assigned', 'in-progress', 'completed', 'on-hold'];

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || idea.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPriority = selectedPriority === 'all' || idea.priority.toLowerCase() === selectedPriority.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleAddIdea = () => {
    if (newIdea.title && newIdea.description) {
      const idea: Idea = {
        id: ideas.length + 1,
        title: newIdea.title,
        description: newIdea.description,
        category: newIdea.category,
        priority: newIdea.priority,
        status: 'pending',
        createdBy: userRole === 'admin' ? 'Admin User' : 'Employee',
        createdAt: new Date().toISOString().split('T')[0],
        likes: 0,
        comments: 0,
        tags: newIdea.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };
      setIdeas([...ideas, idea]);
      setNewIdea({ title: '', description: '', category: '', priority: 'medium', tags: '' });
      setShowAddModal(false);
    }
  };

  const handleAssignIdea = (assignee: string) => {
    if (selectedIdea) {
      setIdeas(ideas.map(idea => 
        idea.id === selectedIdea.id 
          ? { ...idea, assignee, status: 'assigned' as const }
          : idea
      ));
      setShowAssignModal(false);
      setSelectedIdea(null);
    }
  };

  const handleLike = (ideaId: number) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId 
        ? { ...idea, likes: idea.likes + 1 }
        : idea
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Idea Management</h1>
          <p className="text-gray-600 mt-2">Collect, organize, and track innovative ideas</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Add New Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Idea</DialogTitle>
              <DialogDescription>
                Share your innovative idea with the team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Idea Title"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              />
              <Textarea
                placeholder="Describe your idea in detail..."
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                rows={4}
              />
              <Select value={newIdea.category} onValueChange={(value) => setNewIdea({ ...newIdea, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newIdea.priority} onValueChange={(value: any) => setNewIdea({ ...newIdea, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Tags (comma-separated)"
                value={newIdea.tags}
                onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
              />
              <div className="flex space-x-2">
                <Button onClick={handleAddIdea} className="flex-1">Create Idea</Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search ideas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority.toLowerCase()}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => (
          <Card key={idea.id} className="hover-lift cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-3">{idea.description}</CardDescription>
                </div>
                {userRole === 'admin' && (
                  <div className="flex space-x-1 ml-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getPriorityColor(idea.priority)}>
                  {idea.priority.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(idea.status)}>
                  {idea.status.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline">{idea.category}</Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleLike(idea.id)}
                      className="flex items-center space-x-1 hover:text-blue-500"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{idea.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{idea.comments}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{idea.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {idea.createdBy.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{idea.createdBy}</span>
                  </div>
                  
                  {userRole === 'admin' && idea.status === 'pending' && (
                    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedIdea(idea)}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Idea</DialogTitle>
                          <DialogDescription>
                            Assign this idea to a team member
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {['John Doe', 'Sarah Smith', 'Mike Johnson', 'Lisa Chen'].map((person) => (
                              <Button
                                key={person}
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => handleAssignIdea(person)}
                              >
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="text-xs">
                                    {person.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {person}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {idea.assignee && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {idea.assignee.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{idea.assignee}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-600">Try adjusting your search or filters, or create a new idea.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IdeaManagement;
