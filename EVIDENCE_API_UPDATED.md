# Evidence API - Updated Implementation

## Overview
The Evidence API has been updated to match your working curl command structure. All evidence creation now uses multipart/form-data with uppercase type values.

## API Endpoints

### Base URL
```
http://localhost:8080/api/evidence
```

## Evidence Types
- `FILE` - File uploads (documents, PDFs, etc.)
- `IMAGE` - Image uploads (PNG, JPG, GIF, etc.)
- `LINK` - External URLs
- `TEXT` - Text-based evidence

## CRUD Operations

### 1. CREATE Evidence (POST /api/evidence)

All evidence creation uses **multipart/form-data** format:

#### FILE Type Evidence (Your Working Command)
```bash
curl --location 'http://localhost:8080/api/evidence' \
--form 'title="Test Evidence"' \
--form 'description="This is a test evidence"' \
--form 'type="FILE"' \
--form 'category="Test Category"' \
--form 'projectId="a2f56d3c-852f-4618-9132-a9457f650c51"' \
--form 'uploadedBy="afde270f-a1c4-4b75-a3d7-ba861609df0c"' \
--form 'file=@"/C:/Users/Lakshmi Sai/Pictures/Screenshots/detection.png"' \
--form 'tags="tag1,tag2,tag3"' \
--form 'status="VALIDATED"'
```

#### IMAGE Type Evidence
```bash
curl --location 'http://localhost:8080/api/evidence' \
--header 'accept: application/json' \
--form 'title="Test Image Evidence"' \
--form 'description="Optional description"' \
--form 'type="IMAGE"' \
--form 'category="Test"' \
--form 'projectId="3d18e9e7-959f-428c-92b5-f189d73a8301"' \
--form 'uploadedBy="785f858a-b243-4756-8008-aa062292ef60"' \
--form 'file=@"/path/to/your/image.png"'
```

#### LINK Type Evidence
```bash
curl --location 'http://localhost:8080/api/evidence' \
--header 'accept: application/json' \
--form 'title="Test Link Evidence"' \
--form 'description="Optional description"' \
--form 'type="LINK"' \
--form 'category="Test"' \
--form 'projectId="3d18e9e7-959f-428c-92b5-f189d73a8301"' \
--form 'uploadedBy="785f858a-b243-4756-8008-aa062292ef60"' \
--form 'url="https://example.com"'
```

#### TEXT Type Evidence
```bash
curl --location 'http://localhost:8080/api/evidence' \
--header 'accept: application/json' \
--form 'title="Test Text Evidence"' \
--form 'description="This is the text content"' \
--form 'type="TEXT"' \
--form 'category="Test"' \
--form 'projectId="3d18e9e7-959f-428c-92b5-f189d73a8301"' \
--form 'uploadedBy="785f858a-b243-4756-8008-aa062292ef60"'
```

### 2. READ Evidence (GET /api/evidence)

#### Get All Evidence
```bash
curl --location 'http://localhost:8080/api/evidence?page=0&size=20&sort=uploadedAt&direction=desc' \
--header 'accept: application/json'
```

#### Get Evidence by ID
```bash
curl --location 'http://localhost:8080/api/evidence/{id}' \
--header 'accept: application/json'
```

### 3. UPDATE Evidence (PATCH /api/evidence/{id})

```bash
curl --location 'http://localhost:8080/api/evidence/{id}' \
--header 'Content-Type: application/json' \
--header 'accept: application/json' \
--request PATCH \
--data '{
  "description": "Updated description",
  "category": "Updated Category",
  "status": "validated"
}'
```

### 4. DELETE Evidence (DELETE /api/evidence/{id})

```bash
curl --location 'http://localhost:8080/api/evidence/{id}' \
--request DELETE \
--header 'accept: application/json'
```

## Required Fields

### All Evidence Types
- `title` (string, required)
- `type` (string, required) - One of: FILE, IMAGE, LINK, TEXT
- `category` (string, required)
- `projectId` (string, required) - UUID format
- `uploadedBy` (string, required) - UUID format

### Optional Fields
- `description` (string, optional)
- `tags` (string, optional) - Comma-separated tags: "tag1,tag2,tag3"
- `status` (string, optional) - One of: PENDING, VALIDATED, REJECTED (default: PENDING)

### Type-Specific Fields
- **FILE/IMAGE**: `file` (file upload, required)
- **LINK**: `url` (string, required)
- **TEXT**: Uses `description` field for content

## Getting Valid IDs

### Get User ID
```bash
curl --location 'http://localhost:8080/api/users?page=0&size=1' \
--header 'accept: application/json'
```

### Get Project ID
```bash
curl --location 'http://localhost:8080/api/projects?page=0&size=1' \
--header 'accept: application/json'
```

## Response Format

### Success Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Test Evidence",
  "description": "Optional description",
  "type": "FILE",
  "fileName": "document.pdf",
  "fileSize": "2.5 MB",
  "url": null,
  "projectId": "3d18e9e7-959f-428c-92b5-f189d73a8301",
  "projectName": "Test Project",
  "uploadedBy": "785f858a-b243-4756-8008-aa062292ef60",
  "uploadedAt": "2024-01-15",
  "category": "Test",
  "status": "pending",
  "tags": [],
  "mimeType": "application/pdf",
  "downloadUrl": "/files/document.pdf"
}
```

### Paginated Response (GET /api/evidence)
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "empty": false, "unsorted": false, "sorted": true },
    "offset": 0,
    "unpaged": false,
    "paged": true
  },
  "last": true,
  "totalElements": 5,
  "totalPages": 1,
  "first": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 5,
  "empty": false
}
```

## Frontend Integration

### API Mode Configuration
In `src/services/mockEvidenceApi.ts`:
- Set `USE_MOCK_EVIDENCE_API = false` for real API
- Set `USE_MOCK_EVIDENCE_API = true` for mock API (development)

### Updated Evidence Interface
```typescript
interface Evidence {
  id: string;
  title: string;
  description?: string;
  type: 'FILE' | 'IMAGE' | 'LINK' | 'TEXT' | 'DOCUMENT';
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

## Testing

### Automated Tests
1. **JavaScript Test**: `node test-evidence-api.js`
2. **PowerShell Test**: `.\test-evidence-api.ps1`

### Manual Testing
Use the provided curl commands above with your actual:
- Project IDs from your database
- User IDs from your database
- File paths on your system

## Error Handling

### Common HTTP Status Codes
- `200` - Success (GET, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `404` - Not Found (invalid ID)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Validation failed",
  "message": "Title is required",
  "status": 400
}
```

## File Upload Limits
- **Images**: Up to 10MB (PNG, JPG, GIF)
- **Files**: Up to 50MB (any file type)
- Configure limits in your backend or vault settings

## Security Considerations
- Validate file types and sizes
- Sanitize file names
- Implement proper authentication
- Use HTTPS in production
- Validate UUIDs for projectId and uploadedBy
