import { useState, useEffect } from 'react';
import ideasApi, { Idea } from '@/services/ideasApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 

  Edit, 
  Trash2, 
  Users, 
  Calendar, 

  MessageSquare,
  ThumbsUp,

  Clock,
  Lightbulb,
  LayoutGrid,
  List,
  X
} from 'lucide-react';


interface IdeaManagementProps {
  userRole: 'admin' | 'employee';
  employeeId?: string;
}

// Idea interface is now imported from the API service

const IdeaManagement = ({ userRole, employeeId }: IdeaManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    tags: '',
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    upvotes: 0,
    comments: 0
  });

  const priorities = ['All', 'HIGH', 'MEDIUM', 'LOW'];


  // Add team members array
  const teamMembers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Sarah Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Lisa Chen' }
  ];

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      console.log('Fetching ideas from API');

      const data = await ideasApi.getIdeas(employeeId);
      console.log('Fetched ideas data:', data);
      setIdeas(data.content || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setIdeas([]); // Ensure ideas is always an array
      toast({
        title: "Error",
        description: "Failed to fetch ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdea = async () => {
    if (newIdea.title && newIdea.description) {
      try {
        const ideaData = {
          title: newIdea.title,
          description: newIdea.description,
          priority: newIdea.priority,
          status: 'PENDING' as const,
          tags: newIdea.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          assignedTo: newIdea.assignedTo,
          dueDate: newIdea.dueDate,
          upvotes: newIdea.upvotes,
          comments: newIdea.comments,
          ...(employeeId ? { employeeId } : {})
        };

        console.log('Creating idea:', ideaData);
        const result = await ideasApi.createIdea(ideaData, employeeId);
        console.log('Idea created successfully:', result);

        await fetchIdeas();
        setNewIdea({
          title: '',
          description: '',
          priority: 'MEDIUM',
          tags: '',
          assignedTo: '',
          dueDate: new Date().toISOString().split('T')[0],
          upvotes: 0,
          comments: 0
        });
        setShowAddModal(false);
        toast({
          title: "Success",
          description: "Idea created successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create idea. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAssignIdea = async (assignee: string) => {
    if (selectedIdea) {
      try {
        console.log('Assigning idea:', selectedIdea.id, 'to:', assignee);

        // Use the unified ideasApi service for consistency
        await ideasApi.updateIdea(String(selectedIdea.id), {
          assignedTo: assignee,
          status: 'IN_PROGRESS'
        }, employeeId);

        await fetchIdeas();
        setShowAssignModal(false);
        setSelectedIdea(null);
        toast({
          title: "Success",
          description: `Idea assigned to ${assignee} successfully!`,
        });
      } catch (error) {
        console.error('Error assigning idea:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to assign idea. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpvote = async (ideaId: number | string) => {
    try {
      console.log('Upvoting idea:', ideaId);
      await ideasApi.upvoteIdea(String(ideaId), employeeId);

      await fetchIdeas();
      toast({
        title: "Success",
        description: "Idea liked successfully!",
      });
    } catch (error) {
      console.error('Error upvoting idea:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upvote idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditIdea = async (ideaData: Partial<Idea>) => {
    if (selectedIdea) {
      try {
        console.log('Updating idea:', selectedIdea.id, ideaData);
        await ideasApi.updateIdea(String(selectedIdea.id), { ...ideaData, ...(employeeId ? { employeeId } : {}) }, employeeId);

        await fetchIdeas();
        setShowEditModal(false);
        setSelectedIdea(null);
        toast({
          title: "Success",
          description: "Idea updated successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update idea. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteIdea = async (ideaId: number | string) => {
    try {
      console.log('Deleting idea:', ideaId);
      await ideasApi.deleteIdea(String(ideaId), employeeId);

      await fetchIdeas();
      toast({
        title: "Success",
        description: "Idea deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGetLikes = async (ideaId: number | string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/likes/ideas/${ideaId}?page=0&size=100&sort=createdAt`);
      if (!response.ok) {
        throw new Error('Failed to fetch likes');
      }
      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
  };



  const safeIdeas = ideas || [];
  const filteredIdeas = safeIdeas.filter(idea => {
    const matchesSearch = (idea.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idea.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || idea.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredIdeas.map((idea) => (
        <Card 
          key={idea.id} 
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">{idea.title || 'Untitled'}</CardTitle>
                <CardDescription className="mt-2 line-clamp-3">{idea.description || 'No description'}</CardDescription>
              </div>
              <div className="flex space-x-1">
                {(userRole === 'admin' || userRole === 'employee') && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedIdea(idea);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {(userRole === 'admin'  || userRole === 'employee') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this idea?')) {
                            handleDeleteIdea(idea.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={getPriorityColor(idea.priority || 'MEDIUM')}>
                {idea.priority || 'MEDIUM'}
              </Badge>
              <Badge className={getStatusColor(idea.status || 'PENDING')}>
                {idea.status || 'PENDING'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {(idea.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(idea.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleUpvote(idea.id)}
                    className="flex items-center space-x-1 hover:text-blue-500"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{idea.upvotes || 0}</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{idea.comments || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{idea.createdDate || 'No date'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {idea.assignedTo ? idea.assignedTo.split(' ').map(n => n[0]).join('') : 'NA'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{idea.assignedTo || 'Unassigned'}</span>
                </div>
                
                {userRole === 'admin' && idea.status === 'PENDING' && (
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
                          {teamMembers.map((member) => (
                            <Button
                              key={member.id}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => handleAssignIdea(member.name)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback>
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {member.name}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredIdeas.map((idea) => (
        <Card key={idea.id} className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-start p-4 gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{idea.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{idea.description}</p>
                </div>
                <div className="flex space-x-1">
                  {(userRole === 'admin' || userRole === 'employee') && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedIdea(idea);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {userRole === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this idea?')) {
                              handleDeleteIdea(idea.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getPriorityColor(idea.priority)}>
                  {idea.priority}
                </Badge>
                <Badge className={getStatusColor(idea.status)}>
                  {idea.status}
                </Badge>
                {idea.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleUpvote(idea.id)}
                  className="flex items-center space-x-1 hover:text-blue-500"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{idea.upvotes}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{idea.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{idea.createdDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {idea.assignedTo ? idea.assignedTo.split(' ').map(n => n[0]).join('') : 'NA'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{idea.assignedTo || 'Unassigned'}</span>
                </div>
                
                {userRole === 'admin' && idea.status === 'PENDING' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedIdea(idea);
                      setShowAssignModal(true);
                    }}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Idea Management</h1>
          <p className="text-gray-600 mt-2">Collect, organize, and track innovative ideas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <List className="w-4 h-4" />
            </Button>
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
              <Select value={newIdea.priority} onValueChange={(value: any) => setNewIdea({ ...newIdea, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newIdea.assignedTo} onValueChange={(value: string) => setNewIdea({ ...newIdea, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to Team Member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Tags (comma-separated)"
                value={newIdea.tags}
                onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
              />
              <Input
                type="date"
                value={newIdea.dueDate}
                onChange={(e) => setNewIdea({ ...newIdea, dueDate: e.target.value })}
              />

              {/* Upvotes and Comments Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Initial Upvotes</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newIdea.upvotes}
                    onChange={(e) => setNewIdea({ ...newIdea, upvotes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Initial Comments</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newIdea.comments}
                    onChange={(e) => setNewIdea({ ...newIdea, comments: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddIdea} className="flex-1">Create Idea</Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Idea Dialog */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Idea</DialogTitle>
              <DialogDescription>
                Update your idea details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Idea Title"
                value={selectedIdea?.title || ''}
                onChange={(e) => setSelectedIdea(selectedIdea ? { ...selectedIdea, title: e.target.value } : null)}
              />
              <Textarea
                placeholder="Describe your idea in detail..."
                value={selectedIdea?.description || ''}
                onChange={(e) => setSelectedIdea(selectedIdea ? { ...selectedIdea, description: e.target.value } : null)}
                rows={4}
              />
              <Select
                value={selectedIdea?.priority || 'MEDIUM'}
                onValueChange={(value: any) => setSelectedIdea(selectedIdea ? { ...selectedIdea, priority: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedIdea?.status || 'PENDING'}
                onValueChange={(value: any) => setSelectedIdea(selectedIdea ? { ...selectedIdea, status: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedIdea?.assignedTo || ''}
                onValueChange={(value: string) => setSelectedIdea(selectedIdea ? { ...selectedIdea, assignedTo: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to Team Member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Tags (comma-separated)"
                value={selectedIdea?.tags?.join(', ') || ''}
                onChange={(e) => setSelectedIdea(selectedIdea ? {
                  ...selectedIdea,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                } : null)}
              />
              <Input
                type="date"
                value={selectedIdea?.dueDate || ''}
                onChange={(e) => setSelectedIdea(selectedIdea ? { ...selectedIdea, dueDate: e.target.value } : null)}
              />

              {/* Upvotes and Comments Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Upvotes</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={selectedIdea?.upvotes || 0}
                    onChange={(e) => setSelectedIdea(selectedIdea ? {
                      ...selectedIdea,
                      upvotes: parseInt(e.target.value) || 0
                    } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Comments</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={selectedIdea?.comments || 0}
                    onChange={(e) => setSelectedIdea(selectedIdea ? {
                      ...selectedIdea,
                      comments: parseInt(e.target.value) || 0
                    } : null)}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => selectedIdea && handleEditIdea(selectedIdea)}
                  className="flex-1"
                >
                  Update Idea
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedIdea(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
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
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority.toUpperCase()}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ideas View */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}



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
