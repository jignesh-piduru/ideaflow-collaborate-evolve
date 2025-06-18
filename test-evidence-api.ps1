# Evidence API Test Script for PowerShell
# Tests all CRUD operations using curl commands
# Run with: .\test-evidence-api.ps1

$API_BASE_URL = "http://localhost:8080/api"
$PROJECT_ID = "3d18e9e7-959f-428c-92b5-f189d73a8301"
$UPLOADED_BY = "785f858a-b243-4756-8008-aa062292ef60"

Write-Host "🚀 Starting Evidence API Tests..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow

# Test 1: GET Evidence
Write-Host "`n📋 Testing GET Evidence..." -ForegroundColor Cyan
$getResult = curl --location "$API_BASE_URL/evidence?page=0&size=20&sort=uploadedAt&direction=desc" `
    --header "accept: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

if ($getResult -match "HTTPSTATUS:200") {
    Write-Host "✅ GET Evidence: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ GET Evidence: FAILED" -ForegroundColor Red
    Write-Host $getResult
}

# Test 2: GET Projects
Write-Host "`n📂 Testing GET Projects..." -ForegroundColor Cyan
$projectsResult = curl --location "$API_BASE_URL/projects?page=0&size=20" `
    --header "accept: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

if ($projectsResult -match "HTTPSTATUS:200") {
    Write-Host "✅ GET Projects: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ GET Projects: FAILED" -ForegroundColor Red
    Write-Host $projectsResult
}

# Test 3: GET Users
Write-Host "`n👥 Testing GET Users..." -ForegroundColor Cyan
$usersResult = curl --location "$API_BASE_URL/users?page=0&size=20" `
    --header "accept: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

if ($usersResult -match "HTTPSTATUS:200") {
    Write-Host "✅ GET Users: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ GET Users: FAILED" -ForegroundColor Red
    Write-Host $usersResult
}

# Test 4: CREATE Text Evidence
Write-Host "`n📝 Testing CREATE Text Evidence..." -ForegroundColor Cyan

# First, let's get a valid user ID from the users API
Write-Host "   Getting user ID from users API..." -ForegroundColor Gray
$usersResult = curl --location "$API_BASE_URL/users?page=0&size=1" `
    --header "accept: application/json" `
    --silent --show-error

if ($usersResult -match '"id":\s*"([^"]+)"') {
    $UPLOADED_BY = $matches[1]
    Write-Host "   Using user ID: $UPLOADED_BY" -ForegroundColor Gray
} else {
    Write-Host "   Could not get user ID, using default" -ForegroundColor Yellow
}

$textResult = curl --location "$API_BASE_URL/evidence" `
    --header "accept: application/json" `
    --form "title=`"Test Text Evidence`"" `
    --form "description=`"This is a test text evidence created via PowerShell`"" `
    --form "type=`"TEXT`"" `
    --form "category=`"Testing`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$UPLOADED_BY`"" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

if ($textResult -match "HTTPSTATUS:20[01]") {
    Write-Host "✅ CREATE Text Evidence: SUCCESS" -ForegroundColor Green
    # Extract ID from response for later tests
    $textEvidenceId = ($textResult -replace "HTTPSTATUS:.*", "" | ConvertFrom-Json).id
    Write-Host "   Created Evidence ID: $textEvidenceId" -ForegroundColor Gray
} else {
    Write-Host "❌ CREATE Text Evidence: FAILED" -ForegroundColor Red
    Write-Host $textResult
}

# Test 5: CREATE Link Evidence
Write-Host "`n🔗 Testing CREATE Link Evidence..." -ForegroundColor Cyan
$linkResult = curl --location "$API_BASE_URL/evidence" `
    --header "accept: application/json" `
    --form "title=`"Test Link Evidence`"" `
    --form "description=`"This is a test link evidence`"" `
    --form "type=`"LINK`"" `
    --form "category=`"Testing`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$UPLOADED_BY`"" `
    --form "url=`"https://example.com`"" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

if ($linkResult -match "HTTPSTATUS:20[01]") {
    Write-Host "✅ CREATE Link Evidence: SUCCESS" -ForegroundColor Green
    $linkEvidenceId = ($linkResult -replace "HTTPSTATUS:.*", "" | ConvertFrom-Json).id
    Write-Host "   Created Evidence ID: $linkEvidenceId" -ForegroundColor Gray
} else {
    Write-Host "❌ CREATE Link Evidence: FAILED" -ForegroundColor Red
    Write-Host $linkResult
}

# Test 6: CREATE File Evidence (create a temporary test file)
Write-Host "`n📁 Testing CREATE File Evidence..." -ForegroundColor Cyan
$tempFile = "$env:TEMP\test-evidence-file.txt"
"This is a test file for evidence API testing." | Out-File -FilePath $tempFile -Encoding UTF8

$fileResult = curl --location "$API_BASE_URL/evidence" `
    --header "accept: application/json" `
    --form "title=`"Test File Evidence`"" `
    --form "description=`"This is a test file evidence`"" `
    --form "type=`"FILE`"" `
    --form "category=`"Testing`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$UPLOADED_BY`"" `
    --form "file=@`"$tempFile`"" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

if ($fileResult -match "HTTPSTATUS:20[01]") {
    Write-Host "✅ CREATE File Evidence: SUCCESS" -ForegroundColor Green
    $fileEvidenceId = ($fileResult -replace "HTTPSTATUS:.*", "" | ConvertFrom-Json).id
    Write-Host "   Created Evidence ID: $fileEvidenceId" -ForegroundColor Gray
} else {
    Write-Host "❌ CREATE File Evidence: FAILED" -ForegroundColor Red
    Write-Host $fileResult
}

# Clean up temp file
Remove-Item $tempFile -ErrorAction SilentlyContinue

# Test 7: UPDATE Evidence (if we have a created evidence ID)
if ($textEvidenceId) {
    Write-Host "`n✏️ Testing UPDATE Evidence (ID: $textEvidenceId)..." -ForegroundColor Cyan
    $updateData = @{
        description = "Updated description via PowerShell test"
        category = "Updated Category"
    } | ConvertTo-Json
    
    $updateResult = curl --location "$API_BASE_URL/evidence/$textEvidenceId" `
        --header "Content-Type: application/json" `
        --header "accept: application/json" `
        --request PATCH `
        --data $updateData `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    if ($updateResult -match "HTTPSTATUS:200") {
        Write-Host "✅ UPDATE Evidence: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ UPDATE Evidence: FAILED" -ForegroundColor Red
        Write-Host $updateResult
    }
}

# Test 8: DELETE Evidence (clean up created evidence)
$createdIds = @($textEvidenceId, $linkEvidenceId, $fileEvidenceId) | Where-Object { $_ }

foreach ($evidenceId in $createdIds) {
    if ($evidenceId) {
        Write-Host "`n🗑️ Testing DELETE Evidence (ID: $evidenceId)..." -ForegroundColor Cyan
        $deleteResult = curl --location "$API_BASE_URL/evidence/$evidenceId" `
            --request DELETE `
            --header "accept: application/json" `
            --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
        
        if ($deleteResult -match "HTTPSTATUS:20[04]") {
            Write-Host "✅ DELETE Evidence: SUCCESS" -ForegroundColor Green
        } else {
            Write-Host "❌ DELETE Evidence: FAILED" -ForegroundColor Red
            Write-Host $deleteResult
        }
    }
}

Write-Host "`n=====================================" -ForegroundColor Yellow
Write-Host "🏁 Evidence API Tests Completed!" -ForegroundColor Green
Write-Host "`nNote: Check the output above for any failed tests." -ForegroundColor Yellow
Write-Host "If tests fail, ensure your backend server is running on http://localhost:8080" -ForegroundColor Yellow

# Test your specific working curl command
Write-Host "`n🔧 Testing your original working curl command..." -ForegroundColor Magenta
Write-Host "Note: Update the file path to an actual file on your system" -ForegroundColor Yellow

$workingCurlExample = @"
curl --location 'http://localhost:8080/api/evidence' \
--header 'accept: application/json' \
--form 'title="Test Evidence"' \
--form 'type="FILE"' \
--form 'category="Test"' \
--form 'projectId="$PROJECT_ID"' \
--form 'uploadedBy="$UPLOADED_BY"' \
--form 'file=@"C:/path/to/your/actual/file.pdf"'
"@

Write-Host $workingCurlExample -ForegroundColor Cyan
