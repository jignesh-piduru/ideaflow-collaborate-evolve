
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Square
} from 'lucide-react';

interface ProgressTrackingProps {
  userRole: 'admin' | 'employee';
}

interface ProjectProgress {
  id: number;
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

  const [projects, setProjects] = useState<ProjectProgress[]>([
    {
      id: 1,
      title: 'AI-Powered Customer Support Chat',
      assignee: 'John Doe',
      startDate: '2024-01-15',
      estimatedEndDate: '2024-03-15',
      status: 'in-progress',
      progress: 65,
      category: 'AI/ML',
      priority: 'high',
      milestones: [
        { name: 'Requirements Analysis', completed: true, dueDate: '2024-01-20' },
        { name: 'Database Design', completed: true, dueDate: '2024-01-25' },
        { name: 'API Development', completed: false, dueDate: '2024-02-10' },
        { name: 'Frontend Integration', completed: false, dueDate: '2024-02-25' },
        { name: 'Testing & Deployment', completed: false, dueDate: '2024-03-10' }
      ]
    },
    {
      id: 2,
      title: 'Mobile App Performance Optimization',
      assignee: 'Sarah Smith',
      startDate: '2024-01-10',
      estimatedEndDate: '2024-02-28',
      status: 'in-progress',
      progress: 80,
      category: 'Mobile',
      priority: 'medium',
      milestones: [
        { name: 'Performance Audit', completed: true, dueDate: '2024-01-15' },
        { name: 'Code Optimization', completed: true, dueDate: '2024-02-01' },
        { name: 'Testing', completed: false, dueDate: '2024-02-20' },
        { name: 'Deployment', completed: false, dueDate: '2024-02-25' }
      ]
    },
    {
      id: 3,
      title: 'Blockchain Integration for Payments',
      assignee: 'Mike Johnson',
      startDate: '2024-01-08',
      estimatedEndDate: '2024-04-15',
      actualEndDate: '2024-01-30',
      status: 'completed',
      progress: 100,
      category: 'Blockchain',
      priority: 'high',
      milestones: [
        { name: 'Research & Planning', completed: true, dueDate: '2024-01-12' },
        { name: 'Integration Development', completed: true, dueDate: '2024-01-25' },
        { name: 'Security Testing', completed: true, dueDate: '2024-01-28' },
        { name: 'Go Live', completed: true, dueDate: '2024-01-30' }
      ]
    }
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesFilter = selectedFilter === 'all' || project.category.toLowerCase() === selectedFilter.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    if (userRole === 'employee') {
      return matchesFilter && matchesStatus && project.assignee === 'Current User';
    }
    
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

  const updateProjectStatus = (projectId: number, newStatus: ProjectProgress['status']) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, status: newStatus }
        : project
    ));
  };

  // Summary stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
  const overdueProjects = projects.filter(p => {
    const today = new Date();
    const endDate = new Date(p.estimatedEndDate);
    return p.status !== 'completed' && endDate < today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor project progress and milestones</p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ai/ml">AI/ML</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="blockchain">Blockchain</SelectItem>
              <SelectItem value="web">Web</SelectItem>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressProjects}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{overdueProjects}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="space-y-6">
        {filteredProjects.map((project) => (
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
                
                {userRole === 'admin' && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateProjectStatus(project.id, 'in-progress')}
                      disabled={project.status === 'in-progress'}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateProjectStatus(project.id, 'on-hold')}
                      disabled={project.status === 'on-hold'}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateProjectStatus(project.id, 'completed')}
                      disabled={project.status === 'completed'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your filters or start a new project.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracking;
