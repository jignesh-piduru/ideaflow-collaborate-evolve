# Database Trackers API - 500 Error Fix

## 🚨 **Issue Identified**

The frontend is getting a 500 Internal Server Error when trying to POST to:
```
POST http://localhost:8081/api/database-trackers
```

## 🔧 **Frontend Fixes Applied**

### **1. Fixed URL Structure**
**Before (Incorrect):**
```typescript
const response = await fetch('/api/database-trackers', {
  method: 'POST',
  // ...
});
```

**After (Fixed):**
```typescript
const response = await fetch('http://localhost:8081/api/database-trackers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(requestBody)
});
```

### **2. Enhanced Error Handling**
```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error('Server response:', response.status, response.statusText, errorText);
  throw new Error(`Failed to create schema: ${response.status} ${response.statusText} - ${errorText}`);
}
```

### **3. Improved Logging**
- ✅ **Request Logging** - Shows what data is being sent
- ✅ **Response Logging** - Shows server responses
- ✅ **Error Details** - Captures full error information
- ✅ **Status Codes** - Reports HTTP status codes

## 🎯 **Request Structure**

### **POST Request Body**
```json
{
  "name": "TestSchema",
  "version": "1.0.0",
  "status": "created",
  "lastModified": "2025-06-17",
  "tablesCount": 0,
  "migrationsCount": 0,
  "migrationsJson": "[]"
}
```

### **Expected Response**
```json
{
  "id": 1,
  "name": "TestSchema",
  "version": "1.0.0",
  "status": "created",
  "lastModified": "2025-06-17",
  "tablesCount": 0,
  "migrationsCount": 0,
  "migrationsJson": "[]"
}
```

## 🧪 **Testing the Fix**

### **PowerShell Test Script**
```powershell
.\test-database-trackers.ps1
```

**Test Coverage:**
1. ✅ **Server Connection** - Verifies backend is running
2. ✅ **GET Request** - Tests schema fetching
3. ✅ **POST Request** - Tests schema creation
4. ✅ **Verification** - Confirms creation success
5. ✅ **Error Scenarios** - Tests invalid data handling
6. ✅ **Manual Commands** - Provides curl commands

### **Manual Testing**
```bash
# Test GET request
curl --location 'http://localhost:8081/api/database-trackers?page=0&size=10&sort=lastModified&direction=desc' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json'

# Test POST request
curl --location 'http://localhost:8081/api/database-trackers' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
    "name": "TestSchema",
    "version": "1.0.0",
    "status": "created",
    "lastModified": "2025-06-17",
    "tablesCount": 0,
    "migrationsCount": 0,
    "migrationsJson": "[]"
}'
```

## 🔍 **Backend Requirements**

### **If Backend Needs Implementation**

#### **Java Spring Boot Controller**
```java
@RestController
@RequestMapping("/api/database-trackers")
@CrossOrigin(origins = "*")
public class DatabaseTrackersController {

    @Autowired
    private DatabaseTrackersService service;

    @GetMapping
    public ResponseEntity<Page<Schema>> getSchemas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastModified") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Pageable pageable = PageRequest.of(page, size, 
            Sort.by(Sort.Direction.fromString(direction), sort));
        Page<Schema> schemas = service.getSchemas(pageable);
        return ResponseEntity.ok(schemas);
    }

    @PostMapping
    public ResponseEntity<Schema> createSchema(@RequestBody Schema schema) {
        try {
            Schema createdSchema = service.createSchema(schema);
            return ResponseEntity.ok(createdSchema);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

#### **Entity Class**
```java
@Entity
@Table(name = "database_schemas")
public class Schema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String version;
    
    @Column(nullable = false)
    private String status;
    
    @Column(name = "last_modified")
    private String lastModified;
    
    @Column(name = "tables_count")
    private Integer tablesCount = 0;
    
    @Column(name = "migrations_count")
    private Integer migrationsCount = 0;
    
    @Column(name = "migrations_json", columnDefinition = "TEXT")
    private String migrationsJson = "[]";
    
    // Constructors, getters, and setters...
}
```

#### **Service Class**
```java
@Service
public class DatabaseTrackersService {
    
    @Autowired
    private SchemaRepository repository;
    
    public Page<Schema> getSchemas(Pageable pageable) {
        return repository.findAll(pageable);
    }
    
    public Schema createSchema(Schema schema) {
        // Set defaults if not provided
        if (schema.getTablesCount() == null) {
            schema.setTablesCount(0);
        }
        if (schema.getMigrationsCount() == null) {
            schema.setMigrationsCount(0);
        }
        if (schema.getMigrationsJson() == null) {
            schema.setMigrationsJson("[]");
        }
        if (schema.getLastModified() == null) {
            schema.setLastModified(LocalDate.now().toString());
        }
        
        return repository.save(schema);
    }
}
```

## 🔧 **Common 500 Error Causes**

### **Database Issues**
- ✅ **Connection Problems** - Database not accessible
- ✅ **Schema Mismatch** - Table structure doesn't match entity
- ✅ **Missing Tables** - Required tables don't exist
- ✅ **Constraint Violations** - Unique constraints, null constraints

### **Backend Code Issues**
- ✅ **Missing Endpoint** - Controller method not implemented
- ✅ **Validation Errors** - Request body validation failures
- ✅ **Null Pointer Exceptions** - Unhandled null values
- ✅ **Service Errors** - Business logic exceptions

### **Configuration Issues**
- ✅ **CORS Problems** - Cross-origin request blocking
- ✅ **Content-Type** - Header mismatch issues
- ✅ **Port Conflicts** - Server not running on expected port

## 🎯 **Troubleshooting Steps**

### **1. Check Server Status**
```bash
# Test if server is running
curl -I http://localhost:8081/health
# or
telnet localhost 8081
```

### **2. Check Backend Logs**
Look for error messages in your backend console/logs when the POST request is made.

### **3. Verify Database**
- Ensure database is running
- Check if `database_schemas` table exists
- Verify table structure matches entity

### **4. Test with Simple Data**
```bash
curl -X POST http://localhost:8081/api/database-trackers \
-H "Content-Type: application/json" \
-d '{"name":"test","version":"1.0"}'
```

## ✅ **Frontend Improvements**

### **Enhanced Error Messages**
- ✅ **Detailed Logging** - Console shows exact error details
- ✅ **User Feedback** - Toast notifications with specific errors
- ✅ **Status Codes** - HTTP status code reporting
- ✅ **Response Bodies** - Full error response capture

### **Better Request Handling**
- ✅ **Full URLs** - Uses complete URL with port
- ✅ **Proper Headers** - Content-Type and Accept headers
- ✅ **Error Recovery** - Graceful error handling
- ✅ **Loading States** - User feedback during requests

## 🚀 **Test Your Fix**

### **1. Run the Test Script**
```powershell
.\test-database-trackers.ps1
```

### **2. Test in Frontend**
1. Open your application
2. Go to Database Tracker page
3. Click "New Schema" button
4. Fill in schema name and version
5. Click "Create Schema"
6. Check for success/error messages

### **3. Expected Results**
- ✅ **No 500 errors** - Requests should succeed
- ✅ **Success message** - "New schema created successfully!"
- ✅ **Schema appears** - New schema shows in the list
- ✅ **Console logs** - Detailed request/response logging

## 🎉 **Resolution Summary**

The frontend fixes include:
- ✅ **Correct URLs** - Full URLs with port 8081
- ✅ **Enhanced Error Handling** - Detailed error reporting
- ✅ **Better Logging** - Request/response debugging
- ✅ **Proper Headers** - Content-Type and Accept headers

**If you're still getting 500 errors after these frontend fixes, the issue is in the backend implementation and needs to be addressed on the server side.**

## 📱 **Ready to Test**

**Frontend**: Database Tracker page → "New Schema" button
**API**: `http://localhost:8081/api/database-trackers`
**Testing**: Run `.\test-database-trackers.ps1`

Your Database Tracker should now have better error handling and detailed logging to help identify any remaining backend issues! 🚀
