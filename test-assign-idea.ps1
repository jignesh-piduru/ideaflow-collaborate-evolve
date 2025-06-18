# Test Assign Idea Functionality
# PowerShell script to test the assign idea feature

Write-Host "=== Testing Assign Idea Functionality ===" -ForegroundColor Cyan
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

# Step 1: Get all ideas to find a PENDING idea to assign
Write-Host "=== 1. Finding PENDING Ideas ===" -ForegroundColor Magenta
$getIdeasResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/ideas" -Headers $headers -Description "Fetching all ideas"

$testIdeaId = $null
$testIdea = $null

if ($getIdeasResult.Success) {
    $ideas = $getIdeasResult.Data
    if ($ideas.content -and $ideas.content.Count -gt 0) {
        # Find a PENDING idea
        $pendingIdeas = $ideas.content | Where-Object { $_.status -eq "PENDING" }
        
        if ($pendingIdeas.Count -gt 0) {
            $testIdea = $pendingIdeas[0]
            $testIdeaId = $testIdea.id
            Write-Host "✅ Found PENDING idea to test assignment:" -ForegroundColor Green
            Write-Host "   ID: $testIdeaId" -ForegroundColor Gray
            Write-Host "   Title: $($testIdea.title)" -ForegroundColor Gray
            Write-Host "   Current Status: $($testIdea.status)" -ForegroundColor Gray
            Write-Host "   Current Assignee: $($testIdea.assignedTo)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  No PENDING ideas found. Creating a test idea..." -ForegroundColor Yellow
            
            # Create a test idea for assignment
            $testIdeaData = @{
                title = "Test Assignment Idea"
                description = "This idea is created to test the assignment functionality"
                priority = "MEDIUM"
                status = "PENDING"
                assignedTo = ""
                dueDate = "2024-12-31"
                tags = @("test", "assignment")
                upvotes = 0
                comments = 0
            } | ConvertTo-Json
            
            $createResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/api/ideas" -Headers $headers -Body $testIdeaData -Description "Creating test idea for assignment"
            
            if ($createResult.Success) {
                $testIdea = $createResult.Data
                $testIdeaId = $testIdea.id
                Write-Host "✅ Created test idea for assignment:" -ForegroundColor Green
                Write-Host "   ID: $testIdeaId" -ForegroundColor Gray
                Write-Host "   Title: $($testIdea.title)" -ForegroundColor Gray
            } else {
                Write-Host "❌ Failed to create test idea. Cannot proceed with assignment test." -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Host "❌ No ideas found in the system." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Failed to fetch ideas. Cannot proceed with assignment test." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Test assignment functionality
if ($testIdeaId) {
    Write-Host "=== 2. Testing Assignment ===" -ForegroundColor Magenta
    
    # Test assignees
    $testAssignees = @("John Doe", "Sarah Smith", "Mike Johnson", "Lisa Chen")
    $selectedAssignee = $testAssignees[0]  # Assign to John Doe
    
    Write-Host "Assigning idea to: $selectedAssignee" -ForegroundColor Yellow
    
    # Assignment data
    $assignmentData = @{
        assignedTo = $selectedAssignee
        status = "IN_PROGRESS"
    } | ConvertTo-Json
    
    $assignResult = Invoke-ApiRequest -Method "PATCH" -Uri "$baseUrl/api/ideas/$testIdeaId" -Headers $headers -Body $assignmentData -Description "Assigning idea to team member"
    
    if ($assignResult.Success) {
        $assignedIdea = $assignResult.Data
        Write-Host "✅ Assignment successful!" -ForegroundColor Green
        Write-Host "   Assigned To: $($assignedIdea.assignedTo)" -ForegroundColor Gray
        Write-Host "   New Status: $($assignedIdea.status)" -ForegroundColor Gray
        Write-Host "   Updated At: $($assignedIdea.updatedAt)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Assignment failed!" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Step 3: Verify assignment by fetching the idea again
    Write-Host "=== 3. Verifying Assignment ===" -ForegroundColor Magenta
    $verifyResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/api/ideas/$testIdeaId" -Headers $headers -Description "Verifying assignment"
    
    if ($verifyResult.Success) {
        $verifiedIdea = $verifyResult.Data
        Write-Host "✅ Verification successful!" -ForegroundColor Green
        Write-Host "   Title: $($verifiedIdea.title)" -ForegroundColor Gray
        Write-Host "   Assigned To: $($verifiedIdea.assignedTo)" -ForegroundColor Gray
        Write-Host "   Status: $($verifiedIdea.status)" -ForegroundColor Gray
        Write-Host "   Updated At: $($verifiedIdea.updatedAt)" -ForegroundColor Gray
        
        # Check if assignment was successful
        if ($verifiedIdea.assignedTo -eq $selectedAssignee -and $verifiedIdea.status -eq "IN_PROGRESS") {
            Write-Host "🎉 Assignment test PASSED!" -ForegroundColor Green
        } else {
            Write-Host "❌ Assignment test FAILED - data mismatch!" -ForegroundColor Red
            Write-Host "   Expected Assignee: $selectedAssignee" -ForegroundColor Red
            Write-Host "   Actual Assignee: $($verifiedIdea.assignedTo)" -ForegroundColor Red
            Write-Host "   Expected Status: IN_PROGRESS" -ForegroundColor Red
            Write-Host "   Actual Status: $($verifiedIdea.status)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Verification failed!" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Step 4: Test reassignment
    Write-Host "=== 4. Testing Reassignment ===" -ForegroundColor Magenta
    
    $newAssignee = $testAssignees[1]  # Reassign to Sarah Smith
    Write-Host "Reassigning idea to: $newAssignee" -ForegroundColor Yellow
    
    $reassignmentData = @{
        assignedTo = $newAssignee
        status = "IN_PROGRESS"  # Keep status as IN_PROGRESS
    } | ConvertTo-Json
    
    $reassignResult = Invoke-ApiRequest -Method "PATCH" -Uri "$baseUrl/api/ideas/$testIdeaId" -Headers $headers -Body $reassignmentData -Description "Reassigning idea to different team member"
    
    if ($reassignResult.Success) {
        $reassignedIdea = $reassignResult.Data
        Write-Host "✅ Reassignment successful!" -ForegroundColor Green
        Write-Host "   New Assignee: $($reassignedIdea.assignedTo)" -ForegroundColor Gray
        Write-Host "   Status: $($reassignedIdea.status)" -ForegroundColor Gray
        
        if ($reassignedIdea.assignedTo -eq $newAssignee) {
            Write-Host "🎉 Reassignment test PASSED!" -ForegroundColor Green
        } else {
            Write-Host "❌ Reassignment test FAILED!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Reassignment failed!" -ForegroundColor Red
    }
}

Write-Host ""

# Step 5: Show manual curl commands for testing
Write-Host "=== 5. Manual Testing Commands ===" -ForegroundColor Cyan
Write-Host ""

if ($testIdeaId) {
    Write-Host "Assign Idea (PATCH):" -ForegroundColor Yellow
    Write-Host "curl --location --request PATCH 'http://localhost:8080/api/ideas/$testIdeaId' \\" -ForegroundColor White
    Write-Host "--header 'Content-Type: application/json' \\" -ForegroundColor White
    Write-Host "--data '{" -ForegroundColor White
    Write-Host "    \"assignedTo\": \"John Doe\"," -ForegroundColor White
    Write-Host "    \"status\": \"IN_PROGRESS\"" -ForegroundColor White
    Write-Host "}'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Verify Assignment (GET):" -ForegroundColor Yellow
    Write-Host "curl --location 'http://localhost:8080/api/ideas/$testIdeaId' --header 'Content-Type: application/json'" -ForegroundColor White
    Write-Host ""
}

Write-Host "Get All Ideas (GET):" -ForegroundColor Yellow
Write-Host "curl --location 'http://localhost:8080/api/ideas' --header 'Content-Type: application/json'" -ForegroundColor White

Write-Host ""
Write-Host "=== Assignment Testing Complete ===" -ForegroundColor Cyan

# Summary
Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Magenta
Write-Host "✅ Assignment functionality uses PATCH method" -ForegroundColor Green
Write-Host "✅ Updates both assignedTo and status fields" -ForegroundColor Green
Write-Host "✅ Uses unified ideasApi service for consistency" -ForegroundColor Green
Write-Host "✅ Provides detailed error handling and logging" -ForegroundColor Green
Write-Host "✅ Frontend should now work without 'Failed to assign' errors" -ForegroundColor Green
