# Evidence Management System - Setup Guide

## 🔧 **ISSUE FIXED: Data Persistence**

### **Problem Solved:**
- **Issue**: Evidence created successfully but disappeared on browser refresh
- **Root Cause**: Mock API data stored in memory, reset on page reload
- **Solution**: Implemented localStorage persistence + Real API integration

## Overview

The Evidence Management System provides comprehensive functionality for uploading, managing, and organizing project evidence with integration to users, projects, and vault settings APIs.

### **✅ Key Fixes Implemented:**

1. **localStorage Persistence**: Mock data now persists across browser refreshes
2. **Real API Integration**: Complete integration with `http://localhost:8080/api/evidence`
3. **Seamless API Switching**: Easy toggle between mock and real API
4. **Error Handling**: Comprehensive error handling for both APIs
5. **Data Consistency**: Unified API interface for both mock and real implementations

## API Endpoints Integration

### Core APIs Used:
- **Users**: `http://localhost:8080/api/users?page=0&size=1&sort=string`
- **Projects**: `http://localhost:8080/api/projects?page=0&size=1&sort=string`
- **Vault Settings**: `http://localhost:8080/api/vault-settings`
- **Evidence**: `/api/evidence` (CRUD operations)

## Features Implemented

### ✅ **Complete Evidence Management (Evidence.tsx)**

1. **Evidence Dashboard**:
   - Search and filter functionality
   - Category-based organization
   - Real-time evidence listing
   - Status management (pending, validated, rejected)

2. **CRUD Operations**:
   - **Create**: Upload new evidence through modal
   - **Read**: Display evidence with metadata
   - **Update**: Admin can change evidence status
   - **Delete**: Admin can delete evidence with confirmation

3. **Advanced Features**:
   - File download functionality
   - Export evidence data to JSON
   - Import evidence data from JSON
   - Category analytics and statistics
   - Secure vault integration

### ✅ **Evidence Upload Component (EvidenceUpload.tsx)**

1. **Multi-Type Upload Support**:
   - **Document Upload**: PDF, DOC, TXT files
   - **Image Upload**: PNG, JPG, GIF files
   - **Link Evidence**: External URLs
   - **Drag & Drop**: Intuitive file upload

2. **Form Validation**:
   - Required field validation
   - File type validation
   - File size validation
   - URL validation for links

3. **Project Integration**:
   - Dynamic project selection from API
   - Category assignment
   - Metadata management

### ✅ **Mock API Service (mockEvidenceApi.ts)**

1. **Complete API Simulation**:
   - Evidence CRUD operations
   - Projects management
   - Users management
   - Vault settings
   - File upload simulation

2. **Data Structure**:
   - Evidence with metadata
   - Project associations
   - User tracking
   - Status management

## User Interface Features

### Evidence Dashboard
- **Search Bar**: Real-time search across title and description
- **Category Filter**: Filter by evidence categories
- **Status Badges**: Visual status indicators
- **Action Buttons**: Download, status update, delete
- **Loading States**: Skeleton loading for better UX
- **Empty States**: Helpful messages when no data

### Upload Modal
- **Type Selection**: Choose evidence type
- **Drag & Drop Zone**: Intuitive file upload
- **Form Fields**: Title, description, project, category
- **Progress Indication**: Upload progress feedback
- **Validation Messages**: Clear error feedback

### Categories Tab
- **Category Cards**: Visual category overview
- **Document Counts**: Evidence count per category
- **Browse Functionality**: Category-specific browsing

### Secure Vault Tab
- **Security Status**: Encryption and backup status
- **AI Features**: Auto-labeling and validation
- **Configuration Options**: Vault settings management

## Data Flow

```
User Upload → Evidence Upload Component → Mock/Real API → Evidence Dashboard
     ↓                    ↓                      ↓              ↓
File Selection → Form Validation → API Call → Database → UI Update
```

## API Integration Details

### Evidence API Structure:
```typescript
interface Evidence {
  id: string;
  title: string;
  description: string;
  type: 'file' | 'image' | 'link' | 'document';
  fileName?: string;
  fileSize?: string;
  url?: string;
  projectId: string;
  projectName: string;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  status: 'pending' | 'validated' | 'rejected';
  tags: string[];
  mimeType?: string;
  downloadUrl?: string;
}
```

### Projects API Integration:
- Fetches available projects for evidence assignment
- Dynamic project selection in upload form
- Project name display in evidence cards

### Users API Integration:
- User authentication and role management
- Upload tracking by user
- Permission-based UI elements

### Vault Settings Integration:
- File size limits
- Allowed file types
- Security configurations
- AI feature settings

## User Roles & Permissions

### Admin Users:
- ✅ Upload evidence
- ✅ View all evidence
- ✅ Update evidence status
- ✅ Delete evidence
- ✅ Export/Import data
- ✅ Manage vault settings

### Employee Users:
- ✅ Upload evidence
- ✅ View all evidence
- ✅ Download evidence
- ❌ Cannot update status
- ❌ Cannot delete evidence

## Configuration

### **API Mode Configuration:**

#### **Current Status**: Real API Mode (Ready for Backend)
- **File**: `src/services/mockEvidenceApi.ts`
- **Setting**: `USE_MOCK_EVIDENCE_API = false`
- **Backend URL**: `http://localhost:8080/api/evidence`

#### **Switch to Mock API** (for development without backend):
1. Open `src/services/mockEvidenceApi.ts`
2. Change `USE_MOCK_EVIDENCE_API = false` to `USE_MOCK_EVIDENCE_API = true`
3. Data will persist in localStorage across browser refreshes

#### **Switch to Real API** (for production):
1. Ensure `USE_MOCK_EVIDENCE_API = false` in `src/services/mockEvidenceApi.ts`
2. Ensure backend APIs are running on `http://localhost:8080`
3. Verify these endpoints are available:
   - `GET http://localhost:8080/api/evidence`
   - `POST http://localhost:8080/api/evidence`
   - `PATCH http://localhost:8080/api/evidence/{id}`
   - `DELETE http://localhost:8080/api/evidence/{id}`
   - `POST http://localhost:8080/api/evidence/upload`
   - `GET http://localhost:8080/api/projects`
   - `GET http://localhost:8080/api/users`
   - `GET http://localhost:8080/api/vault-settings`

#### **API Mode Indicator:**
- The Evidence page shows a badge indicating current API mode
- **"Mock API"** badge = Using localStorage persistence
- **"Real API"** badge = Using backend server

### Customize Categories:
Update categories array in `Evidence.tsx`:
```typescript
const categories = [
  'Database',
  'API Development',
  'Code Deployment',
  'Go Live',
  'Testing',
  'Documentation',
  'UI/UX',
  'Other'
];
```

### File Upload Limits:
Configure in vault settings or update validation:
```typescript
const maxFileSize = 50 * 1024 * 1024; // 50MB
const allowedTypes = ['pdf', 'png', 'jpg', 'doc', 'txt'];
```

## Testing the System

### 1. Evidence Upload:
- Navigate to Evidence page
- Click "Upload" button
- Select evidence type
- Fill required fields
- Upload file or provide URL
- Verify evidence appears in list

### 2. Evidence Management:
- Search for specific evidence
- Filter by category
- Update status (admin only)
- Download evidence files
- Delete evidence (admin only)

### 3. Data Export/Import:
- Click "Export" to download JSON
- Click "Import" to upload JSON
- Verify data integrity

## Troubleshooting

### Upload Issues:
- Check file size limits
- Verify file type is allowed
- Ensure all required fields are filled
- Check network connectivity

### API Issues:
- Verify backend is running on port 8080
- Check API endpoint availability
- Switch to mock API for testing
- Check browser console for errors

### Permission Issues:
- Verify user role is correctly set
- Check admin permissions for status updates
- Ensure proper authentication

## Benefits

### ✅ **Comprehensive Evidence Management**
- Complete CRUD operations
- Multi-type evidence support
- Advanced search and filtering

### ✅ **User-Friendly Interface**
- Intuitive upload process
- Visual status indicators
- Responsive design

### ✅ **Security & Compliance**
- Secure vault integration
- User tracking and audit trail
- Role-based permissions

### ✅ **Integration Ready**
- Real API integration prepared
- Mock API for development
- Scalable architecture

The Evidence Management System provides a complete solution for project evidence handling with modern UI, comprehensive functionality, and seamless API integration!
