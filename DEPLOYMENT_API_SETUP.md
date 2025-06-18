# Deployment API Setup Guide

## CORS Issue Resolution

The deployment management feature has been updated to handle CORS issues when the backend API is not properly configured for cross-origin requests.

## Current Setup

### Mock API (Currently Active)
- **File**: `src/services/mockApi.ts`
- **Status**: Currently enabled (`USE_MOCK_API = true`)
- **Purpose**: Provides a fully functional deployment management system without requiring backend CORS configuration

### Features Working with Mock API:
✅ **Create Deployment** - All fields with enum dropdowns
✅ **Read Deployments** - Display with proper status indicators  
✅ **Update Deployment** - Edit dialog with all fields
✅ **Delete Deployment** - With confirmation dialog
✅ **Create Environment** - Full environment management
✅ **Update Environment** - Edit environment details
✅ **Delete Environment** - With confirmation dialog

### Form Fields Available:
- **Name**: Text input
- **Environment**: Dropdown (DEVELOPMENT, STAGING, PRODUCTION)
- **Version**: Text input  
- **Branch**: Text input
- **Commit Hash**: Text input
- **Description**: Textarea
- **Status**: Dropdown (PENDING, DEPLOYING, DEPLOYED, FAILED, MAINTENANCE)
- **Health**: Dropdown (UNKNOWN, HEALTHY, UNHEALTHY)

## How to Switch to Real API

When your backend CORS is properly configured:

1. **Open**: `src/services/mockApi.ts`
2. **Change**: `export const USE_MOCK_API = true;` to `export const USE_MOCK_API = false;`
3. **Save** the file

The application will automatically switch to using the real API endpoints:
- `GET /api/deployments` - Fetch deployments
- `POST /api/deployments` - Create deployment
- `PUT /api/deployments/{id}` - Update deployment  
- `DELETE /api/deployments/{id}` - Delete deployment
- `GET /api/environments` - Fetch environments
- `POST /api/environments` - Create environment
- `PUT /api/environments/{id}` - Update environment
- `DELETE /api/environments/{id}` - Delete environment

## Backend CORS Configuration Needed

Your backend needs to allow requests from `http://localhost:8082` (or your frontend URL).

### Example Spring Boot CORS Configuration:
```java
@CrossOrigin(origins = "http://localhost:8082")
@RestController
public class DeploymentController {
    // Your controller methods
}
```

### Or Global CORS Configuration:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:8082")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

## Testing the Application

1. **Navigate to Deployment page** in the application
2. **Click "New Deployment"** to test create functionality
3. **Fill out the form** with all required fields
4. **Select values from dropdowns** for Environment, Status, and Health
5. **Submit** to create a new deployment
6. **Test Edit/Delete** functionality on existing deployments
7. **Test Environment management** in the Environments tab

## Mock Data

The mock API comes with sample data:
- 2 sample deployments (Frontend Application, API Service)
- 2 sample environments (Production, Staging)

All CRUD operations work with persistent state during the session.

## Troubleshooting

### If you see CORS errors:
1. Ensure `USE_MOCK_API = true` in `src/services/mockApi.ts`
2. Refresh the browser
3. Check browser console for any remaining errors

### If real API doesn't work:
1. Verify backend server is running on `http://localhost:8080`
2. Check backend CORS configuration
3. Test API endpoints directly with tools like Postman
4. Switch back to mock API if needed for development

## Development Workflow

1. **Use Mock API** for frontend development and testing
2. **Switch to Real API** when backend is ready and CORS is configured
3. **Test thoroughly** with real API before deployment
4. **Keep mock API** as fallback for development

The mock API provides a complete development environment that matches the real API structure, allowing you to develop and test the frontend independently of backend availability.
