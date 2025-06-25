import React from 'react';
import type { Employee } from './EmployeeManagement';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface EmployeeOverviewProps {
  employee: Employee;
}

const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({ employee }) => {
  return (
    <div className="w-full p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-6 mb-2">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-3xl font-bold">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h3>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : employee.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{employee.status}</span>
              </div>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="mb-2 text-sm text-gray-500">Email</div>
                <div className="font-medium text-gray-900">{employee.email}</div>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-500">Phone</div>
                <div className="font-medium text-gray-900">{employee.phone}</div>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-500">Address</div>
                <div className="font-medium text-gray-900">{employee.address}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Professional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="mb-2 text-sm text-gray-500">Position</div>
                <div className="font-medium text-gray-900">{employee.position}</div>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-500">Department</div>
                <div className="font-medium text-gray-900">{employee.department}</div>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-500">Hire Date</div>
                <div className="font-medium text-gray-900">{new Date(employee.hireDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-500">Salary</div>
                <div className="font-medium text-gray-900">${employee.salary?.toLocaleString()}</div>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-500">Manager</div>
                <div className="font-medium text-gray-900">{employee.manager || 'Not assigned'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Card (spans both columns) */}
        {employee.skills && employee.skills.length > 0 && (
          <Card className="shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{skill}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeOverview; 