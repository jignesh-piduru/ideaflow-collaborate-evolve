
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import {
  Users,
  Calendar,
  Building2,
  UserCheck,
  TrendingUp,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import ideasApi from '@/services/ideasApi';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  joinDate: string;
  tenureDays: number;
  isActive: boolean;
  taskCount: number;
  completedTasks: number;
}

interface DepartmentData {
  name: string;
  count: number;
  color: string;
}

interface EmployeesProps {
  userRole: 'admin' | 'employee';
}

const Employees = ({ userRole }: EmployeesProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalEmployees: 0,
    averageTenure: 0,
    departmentCount: 0,
    activeEmployees: 0,
    avgTasksPerEmployee: 0,
    tasksCompletedToday: 0,
    upcomingDueTasks: 0
  });
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const { toast } = useToast();

  // Mock employee data - in a real app, this would come from an API
  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Marketing Manager',
      department: 'Marketing',
      email: 'sarah.johnson@company.com',
      joinDate: '2023-03-20',
      tenureDays: 450,
      isActive: true,
      taskCount: 8,
      completedTasks: 12
    },
    {
      id: '2',
      name: 'John Admin',
      role: 'Administrator',
      department: 'Management',
      email: 'john.admin@company.com',
      joinDate: '2022-01-15',
      tenureDays: 680,
      isActive: true,
      taskCount: 15,
      completedTasks: 25
    },
    {
      id: '3',
      name: 'Michael Chen',
      role: 'Software Engineer',
      department: 'Engineering',
      email: 'michael.chen@company.com',
      joinDate: '2023-06-10',
      tenureDays: 370,
      isActive: true,
      taskCount: 12,
      completedTasks: 18
    },
    {
      id: '4',
      name: 'Emma Davis',
      role: 'Product Designer',
      department: 'Design',
      email: 'emma.davis@company.com',
      joinDate: '2023-09-01',
      tenureDays: 290,
      isActive: false,
      taskCount: 6,
      completedTasks: 9
    },
    {
      id: '5',
      name: 'David Wilson',
      role: 'Sales Representative',
      department: 'Sales',
      email: 'david.wilson@company.com',
      joinDate: '2023-11-15',
      tenureDays: 215,
      isActive: true,
      taskCount: 10,
      completedTasks: 14
    }
  ];

  const departmentColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Set mock employee data
      setEmployees(mockEmployees);

      // Calculate analytics
      const totalEmployees = mockEmployees.length;
      const averageTenure = Math.round(mockEmployees.reduce((sum, emp) => sum + emp.tenureDays, 0) / totalEmployees);
      const activeEmployees = mockEmployees.filter(emp => emp.isActive && emp.taskCount > 0).length;
      const totalTasks = mockEmployees.reduce((sum, emp) => sum + emp.taskCount, 0);
      const avgTasksPerEmployee = Math.round(totalTasks / totalEmployees);

      // Get unique departments
      const uniqueDepartments = [...new Set(mockEmployees.map(emp => emp.department))];
      const departmentData = uniqueDepartments.map((dept, index) => ({
        name: dept,
        count: mockEmployees.filter(emp => emp.department === dept).length,
        color: departmentColors[index % departmentColors.length]
      }));

      setDepartments(departmentData);
      
      // Simulate tasks completed today and upcoming due tasks
      const tasksCompletedToday = 3;
      const upcomingDueTasks = 7;

      setAnalytics({
        totalEmployees,
        averageTenure,
        departmentCount: uniqueDepartments.length,
        activeEmployees,
        avgTasksPerEmployee,
        tasksCompletedToday,
        upcomingDueTasks
      });

    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employee data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeAction = (action: string, employeeId: string) => {
    toast({
      title: `${action} Employee`,
      description: `${action} action for employee ${employeeId}`,
    });
  };

  const statsCards = [
    {
      title: 'Active Employees',
      value: analytics.activeEmployees.toString(),
      description: 'Employees with open tasks',
      icon: UserCheck,
      color: 'text-green-500'
    },
    {
      title: 'Avg Tasks per Employee',
      value: analytics.avgTasksPerEmployee.toString(),
      description: 'Total tasks ÷ total employees',
      icon: TrendingUp,
      color: 'text-blue-500'
    },
    {
      title: 'Tasks Completed Today',
      value: analytics.tasksCompletedToday.toString(),
      description: 'Completed in last 24 hrs',
      icon: CheckCircle,
      color: 'text-purple-500'
    },
    {
      title: 'Upcoming Due Tasks',
      value: analytics.upcomingDueTasks.toString(),
      description: 'Due within next 7 days',
      icon: Clock,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Management</h1>
          <p className="text-lg text-gray-600">Manage your team and track performance</p>
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {analytics.totalEmployees} Total Employees
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                {analytics.averageTenure} Days Avg Tenure
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">
                {analytics.departmentCount} Departments
              </span>
            </div>
          </div>
        </div>
        <Button className="rounded-xl">
          <Users className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsCards.map((stat, index) => (
            <Card key={index} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Department Breakdown and Employee List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Breakdown */}
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Department Breakdown</CardTitle>
            <CardDescription>Employee distribution by department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.map((dept, index) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${dept.color}`}></div>
                  <span className="font-medium text-gray-900">{dept.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{dept.count}</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${dept.color}`}
                      style={{ width: `${(dept.count / analytics.totalEmployees) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employee List */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Employee Directory</CardTitle>
                  <CardDescription>Search and manage your team members</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Tenure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">{employee.role}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
                          {employee.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{employee.tenureDays} days</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.isActive ? "default" : "secondary"}
                          className="rounded-full"
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEmployeeAction('View', employee.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmployeeAction('Edit', employee.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEmployeeAction('Delete', employee.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Employees;
