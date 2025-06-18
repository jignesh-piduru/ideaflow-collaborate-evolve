# Ideas Management API Setup Guide

## Overview

The Ideas Management system has been updated with comprehensive CRUD operations and proper like functionality. The system includes both mock API support for development and real API integration.

## Current Setup

### Mock API (Currently Active)
- **File**: `src/services/mockIdeasApi.ts`
- **Status**: Currently enabled (`USE_MOCK_IDEAS_API = true`)
- **Purpose**: Provides a fully functional ideas management system without requiring backend API

### Features Working with Mock API:

✅ **Create Idea** - Full form with all fields
✅ **Read Ideas** - Display with proper status indicators  
✅ **Update Idea** - Edit dialog with all fields including status
✅ **Delete Idea** - With confirmation dialog (admin only)
✅ **Like/Upvote Ideas** - Proper like functionality with count
✅ **Assign Ideas** - Assign to team members
✅ **View Details** - Navigate to detailed view
✅ **Search & Filter** - By title, description, and priority

### Form Fields Available:
- **Title**: Text input
- **Description**: Textarea
- **Priority**: Dropdown (HIGH, MEDIUM, LOW)
- **Status**: Dropdown (PENDING, IN_PROGRESS, COMPLETED)
- **Assigned To**: Dropdown (Team members)
- **Tags**: Comma-separated text input
- **Due Date**: Date picker

### Like Functionality:
- **Endpoint**: `/api/likes/ideas/{ideaId}?page=0&size=1&sort=string`
- **Add Like**: POST to add like for current user
- **Remove Like**: DELETE to remove like for current user
- **Get Likes**: GET to fetch all likes for an idea
- **Upvote Count**: Automatically updated in idea object

## API Endpoints

### Ideas CRUD:
- `GET /api/ideas` - Fetch ideas with pagination
- `POST /api/ideas` - Create new idea
- `PUT /api/ideas/{id}` - Update idea
- `DELETE /api/ideas/{id}` - Delete idea
- `PATCH /api/ideas/{id}` - Partial update (assign, status change)
- `POST /api/ideas/{id}/upvote` - Legacy upvote endpoint

### Likes Management:
- `GET /api/likes/ideas/{ideaId}` - Get all likes for an idea
- `POST /api/likes/ideas/{ideaId}` - Add like for current user
- `DELETE /api/likes/ideas/{ideaId}` - Remove like for current user

## How to Switch to Real API

When your backend API is properly configured:

1. **Open**: `src/services/mockIdeasApi.ts`
2. **Change**: `export const USE_MOCK_IDEAS_API = true;` to `export const USE_MOCK_IDEAS_API = false;`
3. **Save** the file

The application will automatically switch to using the real API endpoints.

## Mock Data

The mock API comes with sample data:
- 3 sample ideas with different statuses and priorities
- Sample likes data for testing like functionality
- Team members for assignment testing

All CRUD operations work with persistent state during the session.

## User Roles & Permissions

### Admin Users:
- ✅ Create, Read, Update, Delete ideas
- ✅ Assign ideas to team members
- ✅ Change idea status
- ✅ Delete any idea
- ✅ Like/unlike ideas

### Employee Users:
- ✅ Create, Read, Update own ideas
- ✅ Like/unlike ideas
- ✅ View all ideas
- ❌ Cannot delete ideas
- ❌ Cannot assign ideas (admin only)

## Testing the Application

1. **Navigate to Ideas page** in the application
2. **Click "Add New Idea"** to test create functionality
3. **Fill out the form** with all required fields
4. **Submit** to create a new idea
5. **Test Like functionality** by clicking the thumbs up button
6. **Test Edit** by clicking the edit icon on any idea card
7. **Test Delete** (admin only) by clicking the trash icon
8. **Test Assignment** (admin only) by clicking "Assign" on pending ideas
9. **Test Search & Filter** functionality

## Like Functionality Details

### Frontend Implementation:
- **Like Button**: ThumbsUp icon with count display
- **Click Handler**: `handleUpvote(ideaId)` function
- **Real-time Updates**: Upvote count updates immediately
- **Error Handling**: Proper error messages for failed operations

### Backend Expected Behavior:
- **Add Like**: Should increment upvotes count in idea object
- **Remove Like**: Should decrement upvotes count in idea object
- **Duplicate Prevention**: Should prevent same user from liking twice
- **User Tracking**: Should track which user liked which idea

### API Response Format:
```json
{
  "content": [
    {
      "id": "like-id",
      "ideaId": "idea-id",
      "userId": "user-id", 
      "userName": "User Name",
      "createdAt": "2024-01-11T10:00:00Z"
    }
  ],
  "pageable": { ... },
  "totalElements": 5
}
```

## Troubleshooting

### If you see API errors:
1. Ensure `USE_MOCK_IDEAS_API = true` in `src/services/mockIdeasApi.ts`
2. Refresh the browser
3. Check browser console for any remaining errors

### If real API doesn't work:
1. Verify backend server is running on `http://localhost:8080`
2. Test API endpoints directly with tools like Postman
3. Check CORS configuration for frontend origin
4. Switch back to mock API if needed for development

### If like functionality doesn't work:
1. Check the like endpoint URL format: `/api/likes/ideas/{ideaId}`
2. Verify pagination parameters are supported
3. Test with mock API first to ensure frontend logic works
4. Check backend like/unlike logic and user authentication

## Development Workflow

1. **Use Mock API** for frontend development and testing
2. **Test all CRUD operations** with mock data
3. **Verify like functionality** works correctly
4. **Switch to Real API** when backend is ready
5. **Test thoroughly** with real API before deployment
6. **Keep mock API** as fallback for development

The mock API provides a complete development environment that matches the real API structure, allowing you to develop and test the frontend independently of backend availability.
