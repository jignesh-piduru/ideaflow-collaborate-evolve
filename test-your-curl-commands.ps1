# Test script using your exact curl commands
# This script tests all CRUD operations with your exact API structure

$API_BASE_URL = "http://localhost:8080/api"
$PROJECT_ID = "a2f56d3c-852f-4618-9132-a9457f650c51"
$UPLOADED_BY = "afde270f-a1c4-4b75-a3d7-ba861609df0c"

Write-Host "🚀 Testing Evidence API with Your Exact Curl Commands" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Yellow

# Test 1: GET Evidence (your second curl command)
Write-Host "`n📋 Test 1: GET Evidence..." -ForegroundColor Cyan
$getResult = curl --location "$API_BASE_URL/evidence" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

Write-Host "GET Response:" -ForegroundColor Gray
$responseBody = $getResult -replace "HTTPSTATUS:.*", ""
$statusCode = if ($getResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host $responseBody
Write-Host "Status Code: $statusCode" -ForegroundColor Gray

if ($statusCode -eq "200") {
    Write-Host "✅ GET Evidence: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ GET Evidence: FAILED" -ForegroundColor Red
}

# Test 2: CREATE File Evidence (your first curl command - modified for testing)
Write-Host "`n📁 Test 2: CREATE File Evidence..." -ForegroundColor Cyan

# Create a temporary test file
$tempFile = "$env:TEMP\test-evidence-$(Get-Date -Format 'yyyyMMdd-HHmmss').png"
$testImageContent = @"
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
"@
[System.Convert]::FromBase64String($testImageContent) | Set-Content -Path $tempFile -Encoding Byte

Write-Host "   Created temporary test file: $tempFile" -ForegroundColor Gray

$createResult = curl --location "$API_BASE_URL/evidence" `
    --form "title=`"Test Evidence - PowerShell`"" `
    --form "description=`"This is a test evidence created via PowerShell`"" `
    --form "type=`"FILE`"" `
    --form "category=`"Test Category`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$UPLOADED_BY`"" `
    --form "file=@`"$tempFile`"" `
    --form "tags=`"powershell,test,automation`"" `
    --form "status=`"VALIDATED`"" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

Write-Host "CREATE Response:" -ForegroundColor Gray
$createResponseBody = $createResult -replace "HTTPSTATUS:.*", ""
$createStatusCode = if ($createResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host $createResponseBody
Write-Host "Status Code: $createStatusCode" -ForegroundColor Gray

# Extract created evidence ID for later tests
$createdEvidenceId = $null
if ($createResponseBody -match '"id":\s*"([^"]+)"') {
    $createdEvidenceId = $matches[1]
    Write-Host "   Created Evidence ID: $createdEvidenceId" -ForegroundColor Gray
}

if ($createStatusCode -match "20[01]") {
    Write-Host "✅ CREATE File Evidence: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ CREATE File Evidence: FAILED" -ForegroundColor Red
}

# Clean up temp file
Remove-Item $tempFile -ErrorAction SilentlyContinue

# Test 3: CREATE Text Evidence
Write-Host "`n📝 Test 3: CREATE Text Evidence..." -ForegroundColor Cyan
$textResult = curl --location "$API_BASE_URL/evidence" `
    --form "title=`"Test Text Evidence`"" `
    --form "description=`"This is a comprehensive text evidence for testing purposes`"" `
    --form "type=`"TEXT`"" `
    --form "category=`"Documentation`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$UPLOADED_BY`"" `
    --form "tags=`"text,documentation,test`"" `
    --form "status=`"PENDING`"" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$textResponseBody = $textResult -replace "HTTPSTATUS:.*", ""
$textStatusCode = if ($textResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Text Evidence Response:" -ForegroundColor Gray
Write-Host $textResponseBody
Write-Host "Status Code: $textStatusCode" -ForegroundColor Gray

$textEvidenceId = $null
if ($textResponseBody -match '"id":\s*"([^"]+)"') {
    $textEvidenceId = $matches[1]
    Write-Host "   Created Text Evidence ID: $textEvidenceId" -ForegroundColor Gray
}

if ($textStatusCode -match "20[01]") {
    Write-Host "✅ CREATE Text Evidence: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ CREATE Text Evidence: FAILED" -ForegroundColor Red
}

# Test 4: CREATE Link Evidence
Write-Host "`n🔗 Test 4: CREATE Link Evidence..." -ForegroundColor Cyan
$linkResult = curl --location "$API_BASE_URL/evidence" `
    --form "title=`"Test Link Evidence`"" `
    --form "description=`"This is a test link evidence`"" `
    --form "type=`"LINK`"" `
    --form "category=`"Reference`"" `
    --form "projectId=`"$PROJECT_ID`"" `
    --form "uploadedBy=`"$UPLOADED_BY`"" `
    --form "url=`"https://example.com/test-reference`"" `
    --form "tags=`"link,reference,external`"" `
    --form "status=`"VALIDATED`"" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$linkResponseBody = $linkResult -replace "HTTPSTATUS:.*", ""
$linkStatusCode = if ($linkResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Link Evidence Response:" -ForegroundColor Gray
Write-Host $linkResponseBody
Write-Host "Status Code: $linkStatusCode" -ForegroundColor Gray

$linkEvidenceId = $null
if ($linkResponseBody -match '"id":\s*"([^"]+)"') {
    $linkEvidenceId = $matches[1]
    Write-Host "   Created Link Evidence ID: $linkEvidenceId" -ForegroundColor Gray
}

if ($linkStatusCode -match "20[01]") {
    Write-Host "✅ CREATE Link Evidence: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ CREATE Link Evidence: FAILED" -ForegroundColor Red
}

# Test 5: UPDATE Evidence (if we have a created evidence ID)
if ($createdEvidenceId) {
    Write-Host "`n✏️ Test 5: UPDATE Evidence (ID: $createdEvidenceId)..." -ForegroundColor Cyan
    
    $updateData = @{
        description = "Updated description via PowerShell test"
        category = "Updated Category"
        status = "REJECTED"
        tags = @("updated", "modified", "test")
    } | ConvertTo-Json
    
    $updateResult = curl --location "$API_BASE_URL/evidence/$createdEvidenceId" `
        --header "Content-Type: application/json" `
        --header "accept: application/json" `
        --request PATCH `
        --data $updateData `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $updateResponseBody = $updateResult -replace "HTTPSTATUS:.*", ""
    $updateStatusCode = if ($updateResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    Write-Host "UPDATE Response:" -ForegroundColor Gray
    Write-Host $updateResponseBody
    Write-Host "Status Code: $updateStatusCode" -ForegroundColor Gray
    
    if ($updateStatusCode -eq "200") {
        Write-Host "✅ UPDATE Evidence: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ UPDATE Evidence: FAILED" -ForegroundColor Red
    }
}

# Test 6: GET Evidence by ID
if ($createdEvidenceId) {
    Write-Host "`n🔍 Test 6: GET Evidence by ID ($createdEvidenceId)..." -ForegroundColor Cyan
    
    $getByIdResult = curl --location "$API_BASE_URL/evidence/$createdEvidenceId" `
        --header "accept: application/json" `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $getByIdResponseBody = $getByIdResult -replace "HTTPSTATUS:.*", ""
    $getByIdStatusCode = if ($getByIdResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    Write-Host "GET by ID Response:" -ForegroundColor Gray
    Write-Host $getByIdResponseBody
    Write-Host "Status Code: $getByIdStatusCode" -ForegroundColor Gray
    
    if ($getByIdStatusCode -eq "200") {
        Write-Host "✅ GET Evidence by ID: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ GET Evidence by ID: FAILED" -ForegroundColor Red
    }
}

# Test 7: DELETE Evidence (clean up created evidence)
$createdIds = @($createdEvidenceId, $textEvidenceId, $linkEvidenceId) | Where-Object { $_ }

foreach ($evidenceId in $createdIds) {
    if ($evidenceId) {
        Write-Host "`n🗑️ Test 7: DELETE Evidence (ID: $evidenceId)..." -ForegroundColor Cyan
        
        $deleteResult = curl --location "$API_BASE_URL/evidence/$evidenceId" `
            --request DELETE `
            --header "accept: application/json" `
            --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
        
        $deleteStatusCode = if ($deleteResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
        
        Write-Host "DELETE Status Code: $deleteStatusCode" -ForegroundColor Gray
        
        if ($deleteStatusCode -match "20[04]") {
            Write-Host "✅ DELETE Evidence: SUCCESS" -ForegroundColor Green
        } else {
            Write-Host "❌ DELETE Evidence: FAILED" -ForegroundColor Red
        }
    }
}

# Final verification
Write-Host "`n📊 Final Verification: GET Evidence List..." -ForegroundColor Cyan
$finalGetResult = curl --location "$API_BASE_URL/evidence?page=0&size=10&sort=uploadedAt&direction=desc" `
    --header "accept: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$finalResponseBody = $finalGetResult -replace "HTTPSTATUS:.*", ""
$finalStatusCode = if ($finalGetResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

if ($finalStatusCode -eq "200") {
    $evidenceCount = ([regex]::Matches($finalResponseBody, '"id":')).Count
    Write-Host "✅ Final GET: SUCCESS - Found $evidenceCount evidence items" -ForegroundColor Green
} else {
    Write-Host "❌ Final GET: FAILED" -ForegroundColor Red
}

Write-Host "`n=====================================================" -ForegroundColor Yellow
Write-Host "🏁 All Tests Complete!" -ForegroundColor Green
Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "- GET Evidence List" -ForegroundColor White
Write-Host "- CREATE File Evidence (with file upload)" -ForegroundColor White
Write-Host "- CREATE Text Evidence" -ForegroundColor White
Write-Host "- CREATE Link Evidence" -ForegroundColor White
Write-Host "- UPDATE Evidence" -ForegroundColor White
Write-Host "- GET Evidence by ID" -ForegroundColor White
Write-Host "- DELETE Evidence" -ForegroundColor White
Write-Host "- Final Verification" -ForegroundColor White

Write-Host "`n💡 Your Working Curl Command Template:" -ForegroundColor Magenta
Write-Host @"
curl --location 'http://localhost:8080/api/evidence' \
--form 'title="Your Title"' \
--form 'description="Your Description"' \
--form 'type="FILE"' \
--form 'category="Your Category"' \
--form 'projectId="$PROJECT_ID"' \
--form 'uploadedBy="$UPLOADED_BY"' \
--form 'file=@"/path/to/your/file.ext"' \
--form 'tags="tag1,tag2,tag3"' \
--form 'status="VALIDATED"'
"@ -ForegroundColor Cyan
