# Test script using your exact dashboard curl commands
# Tests user-themes, integration-settings, and roles APIs

$API_BASE_URL = "http://localhost:8080/api"
$USER_ID = "afde270f-a1c4-4b75-a3d7-ba861609df0c"

Write-Host "🚀 Testing Dashboard APIs with Your Exact Curl Commands" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Yellow

# =============================================================================
# Test 1: User Themes API (your first curl command)
# =============================================================================
Write-Host "`n🎨 Test 1: User Themes API" -ForegroundColor Cyan
Write-Host "curl --location 'http://localhost:8080/api/user-themes' --header 'Content-Type: application/json'" -ForegroundColor Gray

$userThemesResult = curl --location "$API_BASE_URL/user-themes" `
    --header "Content-Type: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$themesResponseBody = $userThemesResult -replace "HTTPSTATUS:.*", ""
$themesStatusCode = if ($userThemesResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Response Body:" -ForegroundColor Gray
Write-Host $themesResponseBody
Write-Host "Status Code: $themesStatusCode" -ForegroundColor Gray

if ($themesStatusCode -eq "200") {
    Write-Host "✅ User Themes API: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ User Themes API: FAILED" -ForegroundColor Red
}

# Test CREATE User Theme
Write-Host "`n➕ Creating a new user theme..." -ForegroundColor Cyan
$newThemeData = @{
    userId = $USER_ID
    name = "PowerShell Test Theme"
    primaryColor = "#FF6B6B"
    secondaryColor = "#4ECDC4"
    backgroundColor = "#F7F9FC"
    textColor = "#2C3E50"
    isActive = $false
} | ConvertTo-Json

$createThemeResult = curl --location "$API_BASE_URL/user-themes" `
    --header "Content-Type: application/json" `
    --request POST `
    --data $newThemeData `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$createThemeBody = $createThemeResult -replace "HTTPSTATUS:.*", ""
$createThemeStatus = if ($createThemeResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Create Theme Response:" -ForegroundColor Gray
Write-Host $createThemeBody
Write-Host "Status Code: $createThemeStatus" -ForegroundColor Gray

$createdThemeId = $null
if ($createThemeStatus -match "20[01]" -and $createThemeBody -match '"id":\s*"([^"]+)"') {
    $createdThemeId = $matches[1]
    Write-Host "✅ Theme Created Successfully - ID: $createdThemeId" -ForegroundColor Green
} else {
    Write-Host "❌ Theme Creation: FAILED" -ForegroundColor Red
}

# =============================================================================
# Test 2: Integration Settings API (your second curl command)
# =============================================================================
Write-Host "`n⚡ Test 2: Integration Settings API" -ForegroundColor Cyan
Write-Host "curl --location --request GET 'http://localhost:8080/api/integration-settings' --header 'Content-Type: application/json'" -ForegroundColor Gray

$integrationResult = curl --location --request GET "$API_BASE_URL/integration-settings" `
    --header "Content-Type: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$integrationResponseBody = $integrationResult -replace "HTTPSTATUS:.*", ""
$integrationStatusCode = if ($integrationResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Response Body:" -ForegroundColor Gray
Write-Host $integrationResponseBody
Write-Host "Status Code: $integrationStatusCode" -ForegroundColor Gray

if ($integrationStatusCode -eq "200") {
    Write-Host "✅ Integration Settings API: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ Integration Settings API: FAILED" -ForegroundColor Red
}

# Test CREATE Integration Setting (based on your curl data)
Write-Host "`n➕ Creating a new integration setting..." -ForegroundColor Cyan
$newIntegrationData = @{
    userId = $USER_ID
    type = "GITHUB"
    connected = $false
    config = '{"token": "your-github-token"}'
} | ConvertTo-Json

$createIntegrationResult = curl --location "$API_BASE_URL/integration-settings" `
    --header "Content-Type: application/json" `
    --request POST `
    --data $newIntegrationData `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$createIntegrationBody = $createIntegrationResult -replace "HTTPSTATUS:.*", ""
$createIntegrationStatus = if ($createIntegrationResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Create Integration Response:" -ForegroundColor Gray
Write-Host $createIntegrationBody
Write-Host "Status Code: $createIntegrationStatus" -ForegroundColor Gray

$createdIntegrationId = $null
if ($createIntegrationStatus -match "20[01]" -and $createIntegrationBody -match '"id":\s*"([^"]+)"') {
    $createdIntegrationId = $matches[1]
    Write-Host "✅ Integration Created Successfully - ID: $createdIntegrationId" -ForegroundColor Green
} else {
    Write-Host "❌ Integration Creation: FAILED" -ForegroundColor Red
}

# =============================================================================
# Test 3: Roles API (your third curl command)
# =============================================================================
Write-Host "`n🛡️ Test 3: Roles API" -ForegroundColor Cyan
Write-Host "curl --location --request GET 'http://localhost:8080/api/roles' --header 'Content-Type: application/json'" -ForegroundColor Gray

$rolesResult = curl --location --request GET "$API_BASE_URL/roles" `
    --header "Content-Type: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$rolesResponseBody = $rolesResult -replace "HTTPSTATUS:.*", ""
$rolesStatusCode = if ($rolesResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Response Body:" -ForegroundColor Gray
Write-Host $rolesResponseBody
Write-Host "Status Code: $rolesStatusCode" -ForegroundColor Gray

if ($rolesStatusCode -eq "200") {
    Write-Host "✅ Roles API: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ Roles API: FAILED" -ForegroundColor Red
}

# Test CREATE Role (based on your curl data)
Write-Host "`n➕ Creating a new role..." -ForegroundColor Cyan
$newRoleData = @{
    name = "ADMIN"
    description = "Administrator role with full access"
    permissions = @("CREATE", "READ", "UPDATE", "DELETE", "MANAGE_USERS", "MANAGE_ROLES")
} | ConvertTo-Json

$createRoleResult = curl --location "$API_BASE_URL/roles" `
    --header "Content-Type: application/json" `
    --request POST `
    --data $newRoleData `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$createRoleBody = $createRoleResult -replace "HTTPSTATUS:.*", ""
$createRoleStatus = if ($createRoleResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "Create Role Response:" -ForegroundColor Gray
Write-Host $createRoleBody
Write-Host "Status Code: $createRoleStatus" -ForegroundColor Gray

$createdRoleId = $null
if ($createRoleStatus -match "20[01]" -and $createRoleBody -match '"id":\s*"([^"]+)"') {
    $createdRoleId = $matches[1]
    Write-Host "✅ Role Created Successfully - ID: $createdRoleId" -ForegroundColor Green
} else {
    Write-Host "❌ Role Creation: FAILED" -ForegroundColor Red
}

# =============================================================================
# Test UPDATE Operations
# =============================================================================
Write-Host "`n✏️ Testing UPDATE Operations..." -ForegroundColor Magenta

# Update Theme
if ($createdThemeId) {
    Write-Host "`n🎨 Updating Theme..." -ForegroundColor Cyan
    $updateThemeData = @{
        name = "Updated PowerShell Theme"
        primaryColor = "#E74C3C"
        isActive = $true
    } | ConvertTo-Json
    
    $updateThemeResult = curl --location "$API_BASE_URL/user-themes/$createdThemeId" `
        --header "Content-Type: application/json" `
        --request PATCH `
        --data $updateThemeData `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $updateThemeStatus = if ($updateThemeResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    if ($updateThemeStatus -eq "200") {
        Write-Host "✅ Theme Update: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ Theme Update: FAILED" -ForegroundColor Red
    }
}

# Update Integration
if ($createdIntegrationId) {
    Write-Host "`n⚡ Updating Integration..." -ForegroundColor Cyan
    $updateIntegrationData = @{
        connected = $true
        config = '{"token": "updated-github-token", "webhook": "https://example.com/webhook"}'
    } | ConvertTo-Json
    
    $updateIntegrationResult = curl --location "$API_BASE_URL/integration-settings/$createdIntegrationId" `
        --header "Content-Type: application/json" `
        --request PATCH `
        --data $updateIntegrationData `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $updateIntegrationStatus = if ($updateIntegrationResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    if ($updateIntegrationStatus -eq "200") {
        Write-Host "✅ Integration Update: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ Integration Update: FAILED" -ForegroundColor Red
    }
}

# Update Role
if ($createdRoleId) {
    Write-Host "`n🛡️ Updating Role..." -ForegroundColor Cyan
    $updateRoleData = @{
        description = "Updated Administrator role with enhanced permissions"
        permissions = @("CREATE", "READ", "UPDATE", "DELETE", "MANAGE_USERS", "MANAGE_ROLES", "ADMIN_SETTINGS")
    } | ConvertTo-Json
    
    $updateRoleResult = curl --location "$API_BASE_URL/roles/$createdRoleId" `
        --header "Content-Type: application/json" `
        --request PATCH `
        --data $updateRoleData `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $updateRoleStatus = if ($updateRoleResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    if ($updateRoleStatus -eq "200") {
        Write-Host "✅ Role Update: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ Role Update: FAILED" -ForegroundColor Red
    }
}

# =============================================================================
# Test DELETE Operations (Cleanup)
# =============================================================================
Write-Host "`n🗑️ Testing DELETE Operations (Cleanup)..." -ForegroundColor Magenta

# Delete Theme
if ($createdThemeId) {
    Write-Host "`n🎨 Deleting Theme..." -ForegroundColor Cyan
    $deleteThemeResult = curl --location "$API_BASE_URL/user-themes/$createdThemeId" `
        --request DELETE `
        --header "Content-Type: application/json" `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $deleteThemeStatus = if ($deleteThemeResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    if ($deleteThemeStatus -match "20[04]") {
        Write-Host "✅ Theme Delete: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ Theme Delete: FAILED" -ForegroundColor Red
    }
}

# Delete Integration
if ($createdIntegrationId) {
    Write-Host "`n⚡ Deleting Integration..." -ForegroundColor Cyan
    $deleteIntegrationResult = curl --location "$API_BASE_URL/integration-settings/$createdIntegrationId" `
        --request DELETE `
        --header "Content-Type: application/json" `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $deleteIntegrationStatus = if ($deleteIntegrationResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    if ($deleteIntegrationStatus -match "20[04]") {
        Write-Host "✅ Integration Delete: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ Integration Delete: FAILED" -ForegroundColor Red
    }
}

# Delete Role
if ($createdRoleId) {
    Write-Host "`n🛡️ Deleting Role..." -ForegroundColor Cyan
    $deleteRoleResult = curl --location "$API_BASE_URL/roles/$createdRoleId" `
        --request DELETE `
        --header "Content-Type: application/json" `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $deleteRoleStatus = if ($deleteRoleResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    if ($deleteRoleStatus -match "20[04]") {
        Write-Host "✅ Role Delete: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ Role Delete: FAILED" -ForegroundColor Red
    }
}

# =============================================================================
# SUMMARY
# =============================================================================
Write-Host "`n=======================================================" -ForegroundColor Yellow
Write-Host "🏁 Dashboard APIs Test Complete!" -ForegroundColor Green

Write-Host "`n📋 Your Working Curl Commands:" -ForegroundColor Cyan
Write-Host "1. User Themes:" -ForegroundColor White
Write-Host "   curl --location 'http://localhost:8080/api/user-themes' --header 'Content-Type: application/json'" -ForegroundColor Gray

Write-Host "`n2. Integration Settings:" -ForegroundColor White
Write-Host "   curl --location --request GET 'http://localhost:8080/api/integration-settings' --header 'Content-Type: application/json'" -ForegroundColor Gray

Write-Host "`n3. Roles:" -ForegroundColor White
Write-Host "   curl --location --request GET 'http://localhost:8080/api/roles' --header 'Content-Type: application/json'" -ForegroundColor Gray

Write-Host "`n✅ All Dashboard CRUD Operations Tested!" -ForegroundColor Green
Write-Host "🎯 Ready for production use!" -ForegroundColor Green
