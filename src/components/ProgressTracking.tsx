import { useState, useEffect } from 'react';
import ideasApi, { Idea } from '@/services/ideasApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  BarChart3,
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  Tag,
  FileText
} from 'lucide-react';

// Idea interface is now imported from the API service

interface ProgressTrackingProps {
  userRole: 'admin' | 'employee';
}

interface ProjectProgress {
  id: number | string;
  title: string;
  assignee: string;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  milestones: {
    name: string;
    completed: boolean;
    dueDate: string;
  }[];
}

const ProgressTracking = ({ userRole }: ProgressTrackingProps) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      console.log('Fetching ideas for progress tracking');

      const data = await ideasApi.getIdeas();
      console.log('Fetched ideas data for progress tracking:', data);
      setIdeas(data.content || []);
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
      setIdeas([]); // Ensure ideas is always an array
      toast({
        title: "Error",
        description: "Failed to fetch ideas data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform ideas into project progress format with safety check
  const safeIdeas = ideas || [];
  const projects: ProjectProgress[] = safeIdeas.map(idea => {
    // Calculate progress based on milestones and status
    const calculateProgress = (idea: Idea, milestones: any[]) => {
      const completedMilestones = milestones.filter(m => m.completed).length;
      const totalMilestones = milestones.length;

      // Base progress on milestone completion
      let progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      // Adjust based on status for more accurate representation
      switch (idea.status || 'PENDING') {
        case 'PENDING':
          progress = Math.min(progress, 20); // Cap at 20% for pending ideas
          break;
        case 'IN_PROGRESS':
          progress = Math.max(progress, 25); // Minimum 25% for in-progress
          progress = Math.min(progress, 80); // Cap at 80% until completed
          break;
        case 'COMPLETED':
          progress = 100; // Always 100% for completed
          break;
      }

      return progress;
    };

    let status: ProjectProgress['status'] = 'todo';
    switch (idea.status || 'PENDING') {
      case 'PENDING':
        status = 'todo';
        break;
      case 'IN_PROGRESS':
        status = 'in-progress';
        break;
      case 'COMPLETED':
        status = 'completed';
        break;
    }

    // Extract category from tags with safety checks
    const category = (idea.tags && idea.tags.length > 0) ? idea.tags[0] : 'General';

    // Convert priority with safety checks
    const priority = (idea.priority || 'MEDIUM').toLowerCase() as 'high' | 'medium' | 'low';

    // Generate intelligent milestones based on the idea and its tags
    const generateMilestones = (idea: Idea) => {
      const baseMilestones = [
        { name: 'Idea Submission', completed: true, dueDate: idea.createdDate || new Date().toISOString().split('T')[0] },
        { name: 'Planning & Analysis', completed: (idea.status || 'PENDING') !== 'PENDING', dueDate: idea.createdDate || new Date().toISOString().split('T')[0] },
        { name: 'Development', completed: (idea.status || 'PENDING') === 'IN_PROGRESS' || (idea.status || 'PENDING') === 'COMPLETED', dueDate: idea.dueDate || new Date().toISOString().split('T')[0] },
        { name: 'Testing & Review', completed: (idea.status || 'PENDING') === 'COMPLETED', dueDate: idea.dueDate || new Date().toISOString().split('T')[0] },
        { name: 'Deployment', completed: (idea.status || 'PENDING') === 'COMPLETED', dueDate: idea.dueDate || new Date().toISOString().split('T')[0] }
      ];

      // Add specific milestones based on tags
      const tags = idea.tags || [];
      const additionalMilestones = [];

      if (tags.includes('AI') || tags.includes('ai')) {
        additionalMilestones.push({ name: 'AI Model Training', completed: (idea.status || 'PENDING') === 'COMPLETED', dueDate: idea.dueDate || new Date().toISOString().split('T')[0] });
      }
      if (tags.includes('mobile') || tags.includes('Mobile')) {
        additionalMilestones.push({ name: 'Mobile Testing', completed: (idea.status || 'PENDING') === 'COMPLETED', dueDate: idea.dueDate || new Date().toISOString().split('T')[0] });
      }
      if (tags.includes('backend') || tags.includes('Backend')) {
        additionalMilestones.push({ name: 'API Development', completed: (idea.status || 'PENDING') === 'IN_PROGRESS' || (idea.status || 'PENDING') === 'COMPLETED', dueDate: idea.dueDate || new Date().toISOString().split('T')[0] });
      }
      if (tags.includes('frontend') || tags.includes('Frontend')) {
        additionalMilestones.push({ name: 'UI/UX Implementation', completed: (idea.status || 'PENDING') === 'IN_PROGRESS' || (idea.status || 'PENDING') === 'COMPLETED', dueDate: idea.dueDate || new Date().toISOString().split('T')[0] });
      }

      // Insert additional milestones before deployment
      const milestones = [...baseMilestones];
      if (additionalMilestones.length > 0) {
        milestones.splice(-1, 0, ...additionalMilestones);
      }

      return milestones;
    };

    const milestones = generateMilestones(idea);
    const progress = calculateProgress(idea, milestones);

    return {
      id: idea.id || 0,
      title: idea.title || 'Untitled',
      assignee: idea.assignedTo || 'Unassigned',
      startDate: idea.createdDate || new Date().toISOString().split('T')[0],
      estimatedEndDate: idea.dueDate || new Date().toISOString().split('T')[0],
      actualEndDate: (idea.status || 'PENDING') === 'COMPLETED' ? (idea.dueDate || new Date().toISOString().split('T')[0]) : undefined,
      status,
      progress,
      category,
      priority,
      milestones
    };
  });



  const filteredProjects = projects.filter(project => {
    const matchesFilter = selectedFilter === 'all' || project.category.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;

    return matchesFilter && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const updateProjectStatus = async (projectId: number | string, newStatus: ProjectProgress['status']) => {
    try {
      // Convert project status back to idea status
      let ideaStatus: Idea['status'] = 'PENDING';
      switch (newStatus) {
        case 'todo':
          ideaStatus = 'PENDING';
          break;
        case 'in-progress':
          ideaStatus = 'IN_PROGRESS';
          break;
        case 'completed':
          ideaStatus = 'COMPLETED';
          break;
        case 'on-hold':
          ideaStatus = 'PENDING'; // Map on-hold to pending for now
          break;
      }

      console.log('Updating project status via ideas API');
      await ideasApi.updateIdea(String(projectId), { status: ideaStatus });

      // Refresh the data
      await fetchIdeas();

      toast({
        title: "Success",
        description: "Project status updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Enhanced Summary stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
  const todoProjects = projects.filter(p => p.status === 'todo').length;
  const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;
  const overdueProjects = projects.filter(p => {
    const today = new Date();
    const endDate = new Date(p.estimatedEndDate);
    return p.status !== 'completed' && endDate < today;
  }).length;

  // Progress analytics
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
  const averageProgress = totalProjects > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects) : 0;

  // Priority distribution
  const highPriorityProjects = projects.filter(p => p.priority === 'high').length;
  const mediumPriorityProjects = projects.filter(p => p.priority === 'medium').length;
  const lowPriorityProjects = projects.filter(p => p.priority === 'low').length;

  // Category distribution
  const categories = [...new Set(projects.map(p => p.category))];
  const categoryStats = categories.map(category => ({
    name: category,
    count: projects.filter(p => p.category === category).length,
    completed: projects.filter(p => p.category === category && p.status === 'completed').length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor progress for all submitted ideas and their implementation status</p>
          <div className="flex items-center space-x-4 mt-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              📝 Based on Ideas System
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🔄 Real-time Updates
            </Badge>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIdeas}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="blockchain">Blockchain</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="payments">Payments</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Ideas</p>
                    <p className="text-2xl font-bold text-blue-900">{totalProjects}</p>
                    <p className="text-xs text-blue-600 mt-1">Based on idea submissions</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-900">{inProgressProjects}</p>
                    <p className="text-xs text-yellow-600 mt-1">{totalProjects > 0 ? Math.round((inProgressProjects / totalProjects) * 100) : 0}% of total</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{completedProjects}</p>
                    <p className="text-xs text-green-600 mt-1">{completionRate}% completion rate</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Overdue</p>
                    <p className="text-2xl font-bold text-red-900">{overdueProjects}</p>
                    <p className="text-xs text-red-600 mt-1">Need attention</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Average Progress</p>
                    <p className="text-2xl font-bold text-purple-900">{averageProgress}%</p>
                    <p className="text-xs text-purple-600 mt-1">Across all ideas</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">High Priority</p>
                    <p className="text-2xl font-bold text-orange-900">{highPriorityProjects}</p>
                    <p className="text-xs text-orange-600 mt-1">Critical ideas</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Categories</p>
                    <p className="text-2xl font-bold text-indigo-900">{categories.length}</p>
                    <p className="text-xs text-indigo-600 mt-1">Different types</p>
                  </div>
                  <Tag className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-700">Pending</p>
                    <p className="text-2xl font-bold text-teal-900">{todoProjects}</p>
                    <p className="text-xs text-teal-600 mt-1">Awaiting start</p>
                  </div>
                  <FileText className="w-8 h-8 text-teal-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Category Analytics */}
      {!loading && categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Category Progress Analytics</span>
            </CardTitle>
            <CardDescription>Progress breakdown by idea categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-600">
                        {category.completed}/{category.count} completed
                      </span>
                    </div>
                    <Progress
                      value={category.count > 0 ? (category.completed / category.count) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {category.count > 0 ? Math.round((category.completed / category.count) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-500">{category.count} ideas</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Cards */}
      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredProjects.map((project) => (
          <Card key={project.id} className="hover-lift">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {project.assignee.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{project.assignee}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{project.startDate} - {project.estimatedEndDate}</span>
                    </div>
                    {calculateDaysRemaining(project.estimatedEndDate) > 0 ? (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{calculateDaysRemaining(project.estimatedEndDate)} days remaining</span>
                      </div>
                    ) : project.status !== 'completed' ? (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Overdue</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {userRole === 'admin' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProjectStatus(project.id, 'in-progress')}
                        disabled={project.status === 'in-progress'}
                        title="Start Progress"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProjectStatus(project.id, 'on-hold')}
                        disabled={project.status === 'on-hold'}
                        title="Put on Hold"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProjectStatus(project.id, 'completed')}
                        disabled={project.status === 'completed'}
                        title="Mark Complete"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // Navigate to ideas tab with this idea highlighted
                      toast({
                        title: "Idea Details",
                        description: `View "${project.title}" in the Ideas section for full details and editing.`,
                      });
                    }}
                    title="View Idea Details"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Milestones</h4>
                  <div className="space-y-2">
                    {project.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {milestone.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={`text-sm ${milestone.completed ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {milestone.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{milestone.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      {!loading && filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new ideas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracking;
