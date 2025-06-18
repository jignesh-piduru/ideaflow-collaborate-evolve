# Test script using your exact working curl command structure
# This script tests the evidence API with the exact format that works

$API_BASE_URL = "http://localhost:8080/api"

Write-Host "🧪 Testing Evidence API with Working Curl Format" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow

# Step 1: Get a valid user ID from the API
Write-Host "`n👤 Step 1: Getting valid user ID..." -ForegroundColor Cyan
$usersResponse = curl --location "$API_BASE_URL/users?page=0&size=1" `
    --header "accept: application/json" `
    --silent --show-error

Write-Host "Users API Response:" -ForegroundColor Gray
Write-Host $usersResponse

# Extract user ID from response
$USER_ID = "785f858a-b243-4756-8008-aa062292ef60"  # Default fallback
if ($usersResponse -match '"id":\s*"([^"]+)"') {
    $USER_ID = $matches[1]
    Write-Host "✅ Found user ID: $USER_ID" -ForegroundColor Green
} else {
    Write-Host "⚠️ Could not extract user ID, using default: $USER_ID" -ForegroundColor Yellow
}

# Step 2: Get a valid project ID from the API
Write-Host "`n📂 Step 2: Getting valid project ID..." -ForegroundColor Cyan
$projectsResponse = curl --location "$API_BASE_URL/projects?page=0&size=1" `
    --header "accept: application/json" `
    --silent --show-error

Write-Host "Projects API Response:" -ForegroundColor Gray
Write-Host $projectsResponse

# Extract project ID from response
$PROJECT_ID = "3d18e9e7-959f-428c-92b5-f189d73a8301"  # Default fallback
if ($projectsResponse -match '"id":\s*"([^"]+)"') {
    $PROJECT_ID = $matches[1]
    Write-Host "✅ Found project ID: $PROJECT_ID" -ForegroundColor Green
} else {
    Write-Host "⚠️ Could not extract project ID, using default: $PROJECT_ID" -ForegroundColor Yellow
}

# Step 3: Test TEXT evidence creation (no file required)
Write-Host "`n📝 Step 3: Testing TEXT Evidence Creation..." -ForegroundColor Cyan
$textResult = curl --location "$API_BASE_URL/evidence" `
    --header "accept: application/json" `
    --form "title=`"Test Text Evidence - PowerShell`"" `
    --form "description=`"This is a test text evidence created via PowerShell script`"" `
    --form "type=`"TEXT`"" `
    --form "category=`"Testing`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$USER_ID`"" `
    --write-out "HTTPSTATUS:%{http_code}" `
    --silent --show-error

Write-Host "TEXT Evidence Response:" -ForegroundColor Gray
Write-Host $textResult

if ($textResult -match "HTTPSTATUS:20[01]") {
    Write-Host "✅ TEXT Evidence Creation: SUCCESS" -ForegroundColor Green
    
    # Try to extract the created evidence ID
    if ($textResult -match '"id":\s*"([^"]+)"') {
        $createdTextId = $matches[1]
        Write-Host "   Created Evidence ID: $createdTextId" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ TEXT Evidence Creation: FAILED" -ForegroundColor Red
}

# Step 4: Test LINK evidence creation
Write-Host "`n🔗 Step 4: Testing LINK Evidence Creation..." -ForegroundColor Cyan
$linkResult = curl --location "$API_BASE_URL/evidence" `
    --header "accept: application/json" `
    --form "title=`"Test Link Evidence - PowerShell`"" `
    --form "description=`"This is a test link evidence`"" `
    --form "type=`"LINK`"" `
    --form "category=`"Testing`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$USER_ID`"" `
    --form "url=`"https://example.com/test-link`"" `
    --write-out "HTTPSTATUS:%{http_code}" `
    --silent --show-error

Write-Host "LINK Evidence Response:" -ForegroundColor Gray
Write-Host $linkResult

if ($linkResult -match "HTTPSTATUS:20[01]") {
    Write-Host "✅ LINK Evidence Creation: SUCCESS" -ForegroundColor Green
    
    # Try to extract the created evidence ID
    if ($linkResult -match '"id":\s*"([^"]+)"') {
        $createdLinkId = $matches[1]
        Write-Host "   Created Evidence ID: $createdLinkId" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ LINK Evidence Creation: FAILED" -ForegroundColor Red
}

# Step 5: Test FILE evidence creation (create a temporary file)
Write-Host "`n📁 Step 5: Testing FILE Evidence Creation..." -ForegroundColor Cyan
$tempFile = "$env:TEMP\test-evidence-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
"This is a test file created by PowerShell script for evidence API testing.`nCreated at: $(Get-Date)" | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "   Created temporary file: $tempFile" -ForegroundColor Gray

$fileResult = curl --location "$API_BASE_URL/evidence" `
    --header "accept: application/json" `
    --form "title=`"Test File Evidence - PowerShell`"" `
    --form "description=`"This is a test file evidence created via PowerShell`"" `
    --form "type=`"FILE`"" `
    --form "category=`"Testing`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$USER_ID`"" `
    --form "file=@`"$tempFile`"" `
    --write-out "HTTPSTATUS:%{http_code}" `
    --silent --show-error

Write-Host "FILE Evidence Response:" -ForegroundColor Gray
Write-Host $fileResult

if ($fileResult -match "HTTPSTATUS:20[01]") {
    Write-Host "✅ FILE Evidence Creation: SUCCESS" -ForegroundColor Green
    
    # Try to extract the created evidence ID
    if ($fileResult -match '"id":\s*"([^"]+)"') {
        $createdFileId = $matches[1]
        Write-Host "   Created Evidence ID: $createdFileId" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ FILE Evidence Creation: FAILED" -ForegroundColor Red
}

# Clean up temporary file
Remove-Item $tempFile -ErrorAction SilentlyContinue
Write-Host "   Cleaned up temporary file" -ForegroundColor Gray

# Step 6: Test GET evidence to verify creations
Write-Host "`n📋 Step 6: Verifying Evidence List..." -ForegroundColor Cyan
$getResult = curl --location "$API_BASE_URL/evidence?page=0&size=10&sort=uploadedAt&direction=desc" `
    --header "accept: application/json" `
    --write-out "HTTPSTATUS:%{http_code}" `
    --silent --show-error

if ($getResult -match "HTTPSTATUS:200") {
    Write-Host "✅ GET Evidence List: SUCCESS" -ForegroundColor Green
    
    # Count how many evidence items we have
    $evidenceCount = ([regex]::Matches($getResult, '"id":')).Count
    Write-Host "   Found $evidenceCount evidence items" -ForegroundColor Gray
} else {
    Write-Host "❌ GET Evidence List: FAILED" -ForegroundColor Red
}

Write-Host "`n=================================================" -ForegroundColor Yellow
Write-Host "🏁 Test Complete!" -ForegroundColor Green
Write-Host "`nIf you see SUCCESS messages above, your Evidence API is working correctly!" -ForegroundColor Green
Write-Host "If you see FAILED messages, check your backend server and database." -ForegroundColor Yellow

# Show the exact curl command format that works
Write-Host "`n💡 Your Working Curl Command Format:" -ForegroundColor Magenta
Write-Host @"
curl --location 'http://localhost:8080/api/evidence' \
--header 'accept: application/json' \
--form 'title="Your Evidence Title"' \
--form 'type="FILE"' \
--form 'category="Your Category"' \
--form 'projectId="$PROJECT_ID"' \
--form 'uploadedBy="$USER_ID"' \
--form 'file=@"/path/to/your/file.pdf"'
"@ -ForegroundColor Cyan
