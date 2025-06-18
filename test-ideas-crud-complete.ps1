# Complete Ideas CRUD Testing Script
# Tests all CRUD operations for the Ideas API

Write-Host "=== Complete Ideas CRUD Testing ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
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

# Test data matching your curl command format
$testIdea = @{
    title = "Test Idea"
    description = "This is a test idea"
    priority = "HIGH"
    status = "PENDING"
    assignedTo = "user123"
    dueDate = "2024-12-31"
    tags = @("test", "feature")
    upvotes = 0
    comments = 0
} | ConvertTo-Json

Write-Host "Test Idea Data:" -ForegroundColor Cyan
Write-Host $testIdea -ForegroundColor White
Write-Host ""

# Global variable to store created idea ID
$createdIdeaId = $null

# Step 1: CREATE - Test idea creation
Write-Host "=== 1. CREATE (POST) ===" -ForegroundColor Magenta
$createResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/ideas" -Headers $headers -Body $testIdea -Description "Creating new idea"

if ($createResult.Success) {
    $createdIdeaId = $createResult.Data.id
    Write-Host "   Created ID: $createdIdeaId" -ForegroundColor Green
    Write-Host "   Title: $($createResult.Data.title)" -ForegroundColor Gray
    Write-Host "   Status: $($createResult.Data.status)" -ForegroundColor Gray
} else {
    Write-Host "   CREATE failed - continuing with existing ideas" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: READ ALL - Test getting all ideas
Write-Host "=== 2. READ ALL (GET) ===" -ForegroundColor Magenta
$getAllResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/ideas" -Headers $headers -Description "Fetching all ideas"

if ($getAllResult.Success) {
    $ideas = $getAllResult.Data
    if ($ideas.content -and $ideas.content.Count -gt 0) {
        Write-Host "   Found $($ideas.content.Count) ideas" -ForegroundColor Green
        
        # Use the first idea if we don't have a created one
        if (-not $createdIdeaId) {
            $createdIdeaId = $ideas.content[0].id
            Write-Host "   Using existing idea ID: $createdIdeaId" -ForegroundColor Yellow
        }
        
        # Show first few ideas
        $ideas.content | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.title) (ID: $($_.id), Status: $($_.status))" -ForegroundColor Gray
        }
    } else {
        Write-Host "   No ideas found" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 3: READ ONE - Test getting specific idea
if ($createdIdeaId) {
    Write-Host "=== 3. READ ONE (GET by ID) ===" -ForegroundColor Magenta
    $getOneResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/ideas/$createdIdeaId" -Headers $headers -Description "Fetching idea by ID"
    
    if ($getOneResult.Success) {
        $idea = $getOneResult.Data
        Write-Host "   Title: $($idea.title)" -ForegroundColor Gray
        Write-Host "   Description: $($idea.description)" -ForegroundColor Gray
        Write-Host "   Priority: $($idea.priority)" -ForegroundColor Gray
        Write-Host "   Status: $($idea.status)" -ForegroundColor Gray
        Write-Host "   Assigned To: $($idea.assignedTo)" -ForegroundColor Gray
        Write-Host "   Upvotes: $($idea.upvotes)" -ForegroundColor Gray
        Write-Host "   Comments: $($idea.comments)" -ForegroundColor Gray
        Write-Host "   Due Date: $($idea.dueDate)" -ForegroundColor Gray
        Write-Host "   Tags: $($idea.tags -join ', ')" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Step 4: UPDATE - Test updating idea
if ($createdIdeaId) {
    Write-Host "=== 4. UPDATE (PATCH) ===" -ForegroundColor Magenta
    
    $updateData = @{
        title = "Updated Test Idea"
        description = "This idea has been updated"
        status = "IN_PROGRESS"
        priority = "MEDIUM"
        upvotes = 5
        comments = 2
    } | ConvertTo-Json
    
    $updateResult = Invoke-ApiRequest -Method "PATCH" -Uri "$baseUrl/api/ideas/$createdIdeaId" -Headers $headers -Body $updateData -Description "Updating idea"
    
    if ($updateResult.Success) {
        $updatedIdea = $updateResult.Data
        Write-Host "   Updated Title: $($updatedIdea.title)" -ForegroundColor Gray
        Write-Host "   Updated Status: $($updatedIdea.status)" -ForegroundColor Gray
        Write-Host "   Updated Priority: $($updatedIdea.priority)" -ForegroundColor Gray
        Write-Host "   Updated Upvotes: $($updatedIdea.upvotes)" -ForegroundColor Gray
        Write-Host "   Updated Comments: $($updatedIdea.comments)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Step 5: UPVOTE - Test upvote functionality
if ($createdIdeaId) {
    Write-Host "=== 5. UPVOTE (POST) ===" -ForegroundColor Magenta
    $upvoteResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/ideas/$createdIdeaId/upvote" -Headers $headers -Description "Testing upvote"
    
    if ($upvoteResult.Success) {
        Write-Host "   New upvotes: $($upvoteResult.Data.upvotes)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Step 6: COMMENT - Test comment functionality
if ($createdIdeaId) {
    Write-Host "=== 6. COMMENT (POST) ===" -ForegroundColor Magenta
    
    $commentData = @{
        comment = "This is a test comment"
    } | ConvertTo-Json
    
    $commentResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/ideas/$createdIdeaId/comment" -Headers $headers -Body $commentData -Description "Testing comment"
    
    if ($commentResult.Success) {
        Write-Host "   New comments: $($commentResult.Data.comments)" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Step 7: DELETE - Test deletion (optional, commented out to preserve data)
if ($createdIdeaId) {
    Write-Host "=== 7. DELETE (DELETE) ===" -ForegroundColor Magenta
    Write-Host "⚠️  DELETE test is commented out to preserve data" -ForegroundColor Yellow
    Write-Host "   To test DELETE, uncomment the following lines in the script:" -ForegroundColor Gray
    Write-Host "   # `$deleteResult = Invoke-ApiRequest -Method 'DELETE' -Uri '$baseUrl/api/ideas/$createdIdeaId' -Headers `$headers -Description 'Deleting idea'" -ForegroundColor Gray
    
    # Uncomment the following lines to test DELETE:
    # $deleteResult = Invoke-ApiRequest -Method "DELETE" -Uri "$baseUrl/api/ideas/$createdIdeaId" -Headers $headers -Description "Deleting idea"
    # if ($deleteResult.Success) {
    #     Write-Host "   Successfully deleted idea $createdIdeaId" -ForegroundColor Green
    # }
    
    Write-Host ""
}

# Step 8: Verify final state
Write-Host "=== 8. FINAL VERIFICATION ===" -ForegroundColor Magenta
$finalResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/ideas" -Headers $headers -Description "Final verification - getting all ideas"

if ($finalResult.Success) {
    $finalIdeas = $finalResult.Data
    Write-Host "   Total ideas: $($finalIdeas.content.Count)" -ForegroundColor Green
    
    if ($createdIdeaId) {
        $ourIdea = $finalIdeas.content | Where-Object { $_.id -eq $createdIdeaId }
        if ($ourIdea) {
            Write-Host "   Our test idea still exists:" -ForegroundColor Green
            Write-Host "     Title: $($ourIdea.title)" -ForegroundColor Gray
            Write-Host "     Status: $($ourIdea.status)" -ForegroundColor Gray
            Write-Host "     Upvotes: $($ourIdea.upvotes)" -ForegroundColor Gray
            Write-Host "     Comments: $($ourIdea.comments)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "=== CURL COMMANDS FOR MANUAL TESTING ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "CREATE:" -ForegroundColor Yellow
Write-Host "curl --location 'http://localhost:8080/api/ideas' \\" -ForegroundColor White
Write-Host "--header 'Content-Type: application/json' \\" -ForegroundColor White
Write-Host "--data '{" -ForegroundColor White
Write-Host "    \"title\": \"Test Idea\"," -ForegroundColor White
Write-Host "    \"description\": \"This is a test idea\"," -ForegroundColor White
Write-Host "    \"priority\": \"HIGH\"," -ForegroundColor White
Write-Host "    \"status\": \"PENDING\"," -ForegroundColor White
Write-Host "    \"assignedTo\": \"user123\"," -ForegroundColor White
Write-Host "    \"dueDate\": \"2024-12-31\"," -ForegroundColor White
Write-Host "    \"tags\": [\"test\", \"feature\"]" -ForegroundColor White
Write-Host "}'" -ForegroundColor White
Write-Host ""

Write-Host "READ ALL:" -ForegroundColor Yellow
Write-Host "curl --location 'http://localhost:8080/api/ideas' --header 'Content-Type: application/json'" -ForegroundColor White
Write-Host ""

if ($createdIdeaId) {
    Write-Host "READ ONE:" -ForegroundColor Yellow
    Write-Host "curl --location 'http://localhost:8080/api/ideas/$createdIdeaId' --header 'Content-Type: application/json'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "UPDATE:" -ForegroundColor Yellow
    Write-Host "curl --location --request PATCH 'http://localhost:8080/api/ideas/$createdIdeaId' \\" -ForegroundColor White
    Write-Host "--header 'Content-Type: application/json' \\" -ForegroundColor White
    Write-Host "--data '{\"title\": \"Updated Title\", \"status\": \"IN_PROGRESS\"}'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "UPVOTE:" -ForegroundColor Yellow
    Write-Host "curl --location --request POST 'http://localhost:8080/api/ideas/$createdIdeaId/upvote' --header 'Content-Type: application/json'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "COMMENT:" -ForegroundColor Yellow
    Write-Host "curl --location --request POST 'http://localhost:8080/api/ideas/$createdIdeaId/comment' \\" -ForegroundColor White
    Write-Host "--header 'Content-Type: application/json' \\" -ForegroundColor White
    Write-Host "--data '{\"comment\": \"Test comment\"}'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "DELETE:" -ForegroundColor Yellow
    Write-Host "curl --location --request DELETE 'http://localhost:8080/api/ideas/$createdIdeaId' --header 'Content-Type: application/json'" -ForegroundColor White
}

Write-Host ""
Write-Host "=== CRUD Testing Complete ===" -ForegroundColor Cyan
