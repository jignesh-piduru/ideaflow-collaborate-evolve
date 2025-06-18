# Test Database Trackers API
# PowerShell script to test the database-trackers endpoint

Write-Host "=== Testing Database Trackers API ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8081"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Function to make HTTP requests with detailed error handling
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        [string]$Body = $null,
        [string]$Description = ""
    )
    
    Write-Host "🔄 $Description" -ForegroundColor Yellow
    Write-Host "   Method: $Method" -ForegroundColor Gray
    Write-Host "   URI: $Uri" -ForegroundColor Gray
    if ($Body) {
        Write-Host "   Body: $Body" -ForegroundColor Gray
    }
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -ErrorAction Stop
        }
        Write-Host "✅ Success!" -ForegroundColor Green
        return @{ Success = $true; Data = $response; Error = $null }
    }
    catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get more detailed error information
        try {
            if ($Body) {
                $errorResponse = Invoke-WebRequest -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ErrorAction Stop
            } else {
                $errorResponse = Invoke-WebRequest -Uri $Uri -Method $Method -Headers $Headers -ErrorAction Stop
            }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $statusDescription = $_.Exception.Response.StatusDescription
            Write-Host "   Status: $statusCode $statusDescription" -ForegroundColor Red
            
            if ($_.Exception.Response) {
                try {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $responseBody = $reader.ReadToEnd()
                    Write-Host "   Response: $responseBody" -ForegroundColor Red
                }
                catch {
                    Write-Host "   Could not read response body" -ForegroundColor Red
                }
            }
        }
        
        return @{ Success = $false; Data = $null; Error = $_.Exception.Message }
    }
}

# Step 1: Test if the server is running
Write-Host "=== 1. Testing Server Connection ===" -ForegroundColor Magenta
try {
    $testConnection = Test-NetConnection -ComputerName "localhost" -Port 8081 -WarningAction SilentlyContinue
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "✅ Server is running on localhost:8081" -ForegroundColor Green
    } else {
        Write-Host "❌ Server is not running on localhost:8081" -ForegroundColor Red
        Write-Host "   Please start your backend server first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "⚠️  Could not test connection, proceeding anyway..." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Test GET request (fetch schemas)
Write-Host "=== 2. Testing GET Request ===" -ForegroundColor Magenta
$getResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/database-trackers?page=0&size=10&sort=lastModified&direction=desc" -Headers $headers -Description "Fetching database schemas"

if ($getResult.Success) {
    $schemas = $getResult.Data
    if ($schemas.content) {
        Write-Host "   Found $($schemas.content.Count) schemas" -ForegroundColor Green
        $schemas.content | ForEach-Object {
            Write-Host "   - $($_.name) (v$($_.version), Status: $($_.status))" -ForegroundColor Gray
        }
    } else {
        Write-Host "   No schemas found (empty database)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   GET request failed - this might indicate server issues" -ForegroundColor Red
}

Write-Host ""

# Step 3: Test POST request (create schema)
Write-Host "=== 3. Testing POST Request ===" -ForegroundColor Magenta

$testSchema = @{
    name = "TestSchema_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    version = "1.0.0"
    status = "created"
    lastModified = (Get-Date).ToString("yyyy-MM-dd")
    tablesCount = 0
    migrationsCount = 0
    migrationsJson = "[]"
} | ConvertTo-Json

Write-Host "Test Schema Data:" -ForegroundColor Cyan
Write-Host $testSchema -ForegroundColor White
Write-Host ""

$postResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/database-trackers" -Headers $headers -Body $testSchema -Description "Creating new database schema"

if ($postResult.Success) {
    $createdSchema = $postResult.Data
    Write-Host "   Created Schema ID: $($createdSchema.id)" -ForegroundColor Green
    Write-Host "   Name: $($createdSchema.name)" -ForegroundColor Gray
    Write-Host "   Version: $($createdSchema.version)" -ForegroundColor Gray
    Write-Host "   Status: $($createdSchema.status)" -ForegroundColor Gray
} else {
    Write-Host "   POST request failed - this is the issue you're experiencing" -ForegroundColor Red
}

Write-Host ""

# Step 4: Verify creation by fetching again
if ($postResult.Success) {
    Write-Host "=== 4. Verifying Creation ===" -ForegroundColor Magenta
    $verifyResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/database-trackers?page=0&size=10&sort=lastModified&direction=desc" -Headers $headers -Description "Verifying schema creation"
    
    if ($verifyResult.Success) {
        $updatedSchemas = $verifyResult.Data
        $newSchema = $updatedSchemas.content | Where-Object { $_.name -eq $createdSchema.name }
        if ($newSchema) {
            Write-Host "✅ Schema creation verified!" -ForegroundColor Green
            Write-Host "   Found created schema in the list" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Schema created but not found in list" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# Step 5: Test different error scenarios
Write-Host "=== 5. Testing Error Scenarios ===" -ForegroundColor Magenta

# Test with invalid data
Write-Host "Testing with invalid data..." -ForegroundColor Yellow
$invalidSchema = @{
    # Missing required fields
    invalidField = "test"
} | ConvertTo-Json

$invalidResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/database-trackers" -Headers $headers -Body $invalidSchema -Description "Testing with invalid data"

if (-not $invalidResult.Success) {
    Write-Host "✅ Server properly rejects invalid data" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server accepted invalid data" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Show manual curl commands
Write-Host "=== 6. Manual Testing Commands ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "GET Request:" -ForegroundColor Yellow
Write-Host "curl --location 'http://localhost:8081/api/database-trackers?page=0&size=10&sort=lastModified&direction=desc' \\" -ForegroundColor White
Write-Host "--header 'Content-Type: application/json' \\" -ForegroundColor White
Write-Host "--header 'Accept: application/json'" -ForegroundColor White
Write-Host ""

Write-Host "POST Request:" -ForegroundColor Yellow
Write-Host "curl --location 'http://localhost:8081/api/database-trackers' \\" -ForegroundColor White
Write-Host "--header 'Content-Type: application/json' \\" -ForegroundColor White
Write-Host "--header 'Accept: application/json' \\" -ForegroundColor White
Write-Host "--data '{" -ForegroundColor White
Write-Host "    \"name\": \"TestSchema\"," -ForegroundColor White
Write-Host "    \"version\": \"1.0.0\"," -ForegroundColor White
Write-Host "    \"status\": \"created\"," -ForegroundColor White
Write-Host "    \"lastModified\": \"2025-06-17\"," -ForegroundColor White
Write-Host "    \"tablesCount\": 0," -ForegroundColor White
Write-Host "    \"migrationsCount\": 0," -ForegroundColor White
Write-Host "    \"migrationsJson\": \"[]\"" -ForegroundColor White
Write-Host "}'" -ForegroundColor White

Write-Host ""

# Step 7: Troubleshooting guide
Write-Host "=== 7. Troubleshooting Guide ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "If POST requests are failing with 500 errors:" -ForegroundColor Yellow
Write-Host "1. ✅ Check if backend server is running on port 8081" -ForegroundColor White
Write-Host "2. ✅ Verify the /api/database-trackers endpoint exists" -ForegroundColor White
Write-Host "3. ✅ Check backend logs for specific error messages" -ForegroundColor White
Write-Host "4. ✅ Ensure database connection is working" -ForegroundColor White
Write-Host "5. ✅ Verify request body format matches expected schema" -ForegroundColor White
Write-Host "6. ✅ Check CORS configuration for cross-origin requests" -ForegroundColor White

Write-Host ""
Write-Host "Common 500 error causes:" -ForegroundColor Yellow
Write-Host "- Database connection issues" -ForegroundColor White
Write-Host "- Missing required fields in entity/model" -ForegroundColor White
Write-Host "- Validation errors in backend" -ForegroundColor White
Write-Host "- Unhandled exceptions in controller/service" -ForegroundColor White
Write-Host "- Database schema mismatch" -ForegroundColor White

Write-Host ""
Write-Host "=== Database Trackers API Testing Complete ===" -ForegroundColor Cyan

# Summary
Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Magenta
if ($getResult.Success) {
    Write-Host "✅ GET requests working" -ForegroundColor Green
} else {
    Write-Host "❌ GET requests failing" -ForegroundColor Red
}

if ($postResult.Success) {
    Write-Host "✅ POST requests working" -ForegroundColor Green
    Write-Host "🎉 Database Trackers API is fully functional!" -ForegroundColor Green
} else {
    Write-Host "❌ POST requests failing (500 error)" -ForegroundColor Red
    Write-Host "🔧 Backend implementation needs to be fixed" -ForegroundColor Yellow
}
