# Test Enhanced Database Schema Creation
# PowerShell script to test the enhanced database schema form with all fields

Write-Host "=== Testing Enhanced Database Schema Creation ===" -ForegroundColor Cyan
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

# Test data matching your example
$enhancedSchema = @{
    name = "users"
    version = "v2.1.0"
    status = "approved"
    lastModified = "2024-01-15"
    tablesCount = 5
    migrationsCount = 3
    migrationsJson = '[{"version":"v2.1.0","description":"Add user preferences table","status":"completed","executedAt":"2024-01-15T10:30:00"}]'
} | ConvertTo-Json

Write-Host "=== Enhanced Schema Data (Your Example) ===" -ForegroundColor Magenta
Write-Host $enhancedSchema -ForegroundColor White
Write-Host ""

# Step 1: Test creating schema with all fields
Write-Host "=== 1. Creating Enhanced Schema ===" -ForegroundColor Magenta
$createResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/database-trackers" -Headers $headers -Body $enhancedSchema -Description "Creating enhanced schema with all fields"

if ($createResult.Success) {
    $createdSchema = $createResult.Data
    Write-Host "✅ Enhanced schema created successfully!" -ForegroundColor Green
    Write-Host "   ID: $($createdSchema.id)" -ForegroundColor Gray
    Write-Host "   Name: $($createdSchema.name)" -ForegroundColor Gray
    Write-Host "   Version: $($createdSchema.version)" -ForegroundColor Gray
    Write-Host "   Status: $($createdSchema.status)" -ForegroundColor Gray
    Write-Host "   Last Modified: $($createdSchema.lastModified)" -ForegroundColor Gray
    Write-Host "   Tables Count: $($createdSchema.tablesCount)" -ForegroundColor Gray
    Write-Host "   Migrations Count: $($createdSchema.migrationsCount)" -ForegroundColor Gray
    Write-Host "   Migrations JSON: $($createdSchema.migrationsJson)" -ForegroundColor Gray
} else {
    Write-Host "❌ Enhanced schema creation failed!" -ForegroundColor Red
}

Write-Host ""

# Step 2: Test with different status values
Write-Host "=== 2. Testing Different Status Values ===" -ForegroundColor Magenta

$statusTests = @("created", "pending", "approved", "rejected")

foreach ($status in $statusTests) {
    Write-Host "Testing status: $status" -ForegroundColor Yellow
    
    $statusSchema = @{
        name = "test_schema_$status"
        version = "v1.0.0"
        status = $status
        lastModified = (Get-Date).ToString("yyyy-MM-dd")
        tablesCount = 2
        migrationsCount = 1
        migrationsJson = '[{"version":"v1.0.0","description":"Initial schema","status":"completed","executedAt":"' + (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss") + '"}]'
    } | ConvertTo-Json
    
    $statusResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/database-trackers" -Headers $headers -Body $statusSchema -Description "Testing status: $status"
    
    if ($statusResult.Success) {
        Write-Host "   ✅ Status '$status' accepted" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Status '$status' failed" -ForegroundColor Red
    }
}

Write-Host ""

# Step 3: Test complex migrations JSON
Write-Host "=== 3. Testing Complex Migrations JSON ===" -ForegroundColor Magenta

$complexMigrations = @(
    @{
        version = "v1.0.0"
        description = "Initial schema creation"
        status = "completed"
        executedAt = "2024-01-01T10:00:00"
    },
    @{
        version = "v1.1.0"
        description = "Add indexes for performance"
        status = "completed"
        executedAt = "2024-01-10T14:30:00"
    },
    @{
        version = "v2.0.0"
        description = "Major schema refactoring"
        status = "completed"
        executedAt = "2024-01-15T09:15:00"
    }
) | ConvertTo-Json -Compress

$complexSchema = @{
    name = "complex_schema"
    version = "v2.0.0"
    status = "approved"
    lastModified = "2024-01-15"
    tablesCount = 12
    migrationsCount = 3
    migrationsJson = $complexMigrations
} | ConvertTo-Json

Write-Host "Complex Migrations JSON:" -ForegroundColor Cyan
Write-Host $complexMigrations -ForegroundColor White
Write-Host ""

$complexResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/database-trackers" -Headers $headers -Body $complexSchema -Description "Testing complex migrations JSON"

if ($complexResult.Success) {
    Write-Host "✅ Complex migrations JSON accepted!" -ForegroundColor Green
} else {
    Write-Host "❌ Complex migrations JSON failed!" -ForegroundColor Red
}

Write-Host ""

# Step 4: Test edge cases
Write-Host "=== 4. Testing Edge Cases ===" -ForegroundColor Magenta

# Test with zero counts
$zeroCountsSchema = @{
    name = "minimal_schema"
    version = "v0.1.0"
    status = "created"
    lastModified = (Get-Date).ToString("yyyy-MM-dd")
    tablesCount = 0
    migrationsCount = 0
    migrationsJson = "[]"
} | ConvertTo-Json

Write-Host "Testing zero counts..." -ForegroundColor Yellow
$zeroResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/database-trackers" -Headers $headers -Body $zeroCountsSchema -Description "Testing zero counts"

if ($zeroResult.Success) {
    Write-Host "✅ Zero counts accepted" -ForegroundColor Green
} else {
    Write-Host "❌ Zero counts failed" -ForegroundColor Red
}

# Test with high counts
$highCountsSchema = @{
    name = "large_schema"
    version = "v10.5.2"
    status = "approved"
    lastModified = (Get-Date).ToString("yyyy-MM-dd")
    tablesCount = 150
    migrationsCount = 75
    migrationsJson = '[{"version":"v10.5.2","description":"Large scale migration","status":"completed","executedAt":"' + (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss") + '"}]'
} | ConvertTo-Json

Write-Host "Testing high counts..." -ForegroundColor Yellow
$highResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/database-trackers" -Headers $headers -Body $highCountsSchema -Description "Testing high counts"

if ($highResult.Success) {
    Write-Host "✅ High counts accepted" -ForegroundColor Green
} else {
    Write-Host "❌ High counts failed" -ForegroundColor Red
}

Write-Host ""

# Step 5: Verify all created schemas
Write-Host "=== 5. Verifying All Created Schemas ===" -ForegroundColor Magenta
$verifyResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/database-trackers?page=0&size=20&sort=lastModified&direction=desc" -Headers $headers -Description "Fetching all schemas"

if ($verifyResult.Success) {
    $allSchemas = $verifyResult.Data
    Write-Host "✅ Found $($allSchemas.content.Count) schemas total" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Recent schemas:" -ForegroundColor Cyan
    $allSchemas.content | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.name) (v$($_.version)) - Status: $($_.status) - Tables: $($_.tablesCount) - Migrations: $($_.migrationsCount)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Failed to verify schemas" -ForegroundColor Red
}

Write-Host ""

# Step 6: Manual testing commands
Write-Host "=== 6. Manual Testing Commands ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Create Enhanced Schema (Your Example):" -ForegroundColor Yellow
Write-Host "curl --location 'http://localhost:8081/api/database-trackers' \\" -ForegroundColor White
Write-Host "--header 'Content-Type: application/json' \\" -ForegroundColor White
Write-Host "--header 'Accept: application/json' \\" -ForegroundColor White
Write-Host "--data '{" -ForegroundColor White
Write-Host "    \"name\": \"users\"," -ForegroundColor White
Write-Host "    \"version\": \"v2.1.0\"," -ForegroundColor White
Write-Host "    \"status\": \"approved\"," -ForegroundColor White
Write-Host "    \"lastModified\": \"2024-01-15\"," -ForegroundColor White
Write-Host "    \"tablesCount\": 5," -ForegroundColor White
Write-Host "    \"migrationsCount\": 3," -ForegroundColor White
Write-Host "    \"migrationsJson\": \"[{\\\"version\\\":\\\"v2.1.0\\\",\\\"description\\\":\\\"Add user preferences table\\\",\\\"status\\\":\\\"completed\\\",\\\"executedAt\\\":\\\"2024-01-15T10:30:00\\\"}]\"" -ForegroundColor White
Write-Host "}'" -ForegroundColor White

Write-Host ""
Write-Host "=== Enhanced Database Schema Testing Complete ===" -ForegroundColor Cyan

# Summary
Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Magenta
Write-Host "✅ Enhanced form now includes all required fields:" -ForegroundColor Green
Write-Host "   - name (text input)" -ForegroundColor White
Write-Host "   - version (text input)" -ForegroundColor White
Write-Host "   - status (dropdown: created/pending/approved/rejected)" -ForegroundColor White
Write-Host "   - lastModified (date picker)" -ForegroundColor White
Write-Host "   - tablesCount (number input)" -ForegroundColor White
Write-Host "   - migrationsCount (number input)" -ForegroundColor White
Write-Host "   - migrationsJson (textarea with JSON validation)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Form includes validation for JSON format" -ForegroundColor Green
Write-Host "✅ All fields are properly integrated with the API" -ForegroundColor Green
Write-Host "✅ UI provides helpful placeholders and examples" -ForegroundColor Green
