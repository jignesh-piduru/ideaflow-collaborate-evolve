# Test Upvote and Comment Endpoints
# PowerShell script to test the Ideas API upvote and comment functionality

Write-Host "=== Testing Ideas API Upvote and Comment Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
}

# Function to make HTTP requests with error handling
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        [string]$Body = $null
    )
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -ErrorAction Stop
        }
        return @{ Success = $true; Data = $response; Error = $null }
    }
    catch {
        return @{ Success = $false; Data = $null; Error = $_.Exception.Message }
    }
}

# Step 1: Get all ideas to find a test idea
Write-Host "1. Fetching existing ideas..." -ForegroundColor Yellow
$getIdeasResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/ideas" -Headers $headers

if ($getIdeasResult.Success) {
    $ideas = $getIdeasResult.Data
    if ($ideas.content -and $ideas.content.Count -gt 0) {
        $testIdea = $ideas.content[0]
        $testIdeaId = $testIdea.id
        Write-Host "✅ Found test idea: '$($testIdea.title)' (ID: $testIdeaId)" -ForegroundColor Green
        Write-Host "   Current upvotes: $($testIdea.upvotes)" -ForegroundColor Gray
        Write-Host "   Current comments: $($testIdea.comments)" -ForegroundColor Gray
    } else {
        Write-Host "❌ No ideas found. Please create an idea first." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Failed to fetch ideas: $($getIdeasResult.Error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Test upvote endpoint
Write-Host "2. Testing upvote endpoint..." -ForegroundColor Yellow
$upvoteResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/ideas/$testIdeaId/upvote" -Headers $headers

if ($upvoteResult.Success) {
    Write-Host "✅ Upvote successful!" -ForegroundColor Green
    Write-Host "   New upvotes: $($upvoteResult.Data.upvotes)" -ForegroundColor Gray
} else {
    Write-Host "❌ Upvote failed: $($upvoteResult.Error)" -ForegroundColor Red
    
    # Try to get more details about the error
    try {
        $errorResponse = Invoke-WebRequest -Uri "$baseUrl/api/ideas/$testIdeaId/upvote" -Method POST -Headers $headers -ErrorAction Stop
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        Write-Host "   Status Description: $statusDescription" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Response Body: $responseBody" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Step 3: Test comment endpoint
Write-Host "3. Testing comment endpoint..." -ForegroundColor Yellow
$commentBody = @{
    comment = "This is a test comment from PowerShell script"
} | ConvertTo-Json

$commentResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/ideas/$testIdeaId/comment" -Headers $headers -Body $commentBody

if ($commentResult.Success) {
    Write-Host "✅ Comment successful!" -ForegroundColor Green
    Write-Host "   New comments: $($commentResult.Data.comments)" -ForegroundColor Gray
} else {
    Write-Host "❌ Comment failed: $($commentResult.Error)" -ForegroundColor Red
    
    # Try to get more details about the error
    try {
        $errorResponse = Invoke-WebRequest -Uri "$baseUrl/api/ideas/$testIdeaId/comment" -Method POST -Headers $headers -Body $commentBody -ErrorAction Stop
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        Write-Host "   Status Description: $statusDescription" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Response Body: $responseBody" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Step 4: Verify changes by fetching the idea again
Write-Host "4. Verifying changes..." -ForegroundColor Yellow
$verifyResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/ideas/$testIdeaId" -Headers $headers

if ($verifyResult.Success) {
    $updatedIdea = $verifyResult.Data
    Write-Host "✅ Verification successful!" -ForegroundColor Green
    Write-Host "   Final upvotes: $($updatedIdea.upvotes)" -ForegroundColor Gray
    Write-Host "   Final comments: $($updatedIdea.comments)" -ForegroundColor Gray
    Write-Host "   Last updated: $($updatedIdea.updatedAt)" -ForegroundColor Gray
} else {
    Write-Host "❌ Verification failed: $($verifyResult.Error)" -ForegroundColor Red
}

Write-Host ""

# Step 5: Test with curl commands for comparison
Write-Host "5. Alternative curl commands to test manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Upvote:" -ForegroundColor Cyan
Write-Host "curl -X POST http://localhost:8080/api/ideas/$testIdeaId/upvote -H 'Content-Type: application/json'" -ForegroundColor White
Write-Host ""
Write-Host "Comment:" -ForegroundColor Cyan
Write-Host "curl -X POST http://localhost:8080/api/ideas/$testIdeaId/comment -H 'Content-Type: application/json' -d '{\"comment\":\"Test comment\"}'" -ForegroundColor White
Write-Host ""
Write-Host "Get idea:" -ForegroundColor Cyan
Write-Host "curl -X GET http://localhost:8080/api/ideas/$testIdeaId -H 'Content-Type: application/json'" -ForegroundColor White

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
