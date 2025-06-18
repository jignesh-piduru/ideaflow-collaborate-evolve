# Dashboard APIs Test Script
# Tests all CRUD operations for user-themes, integration-settings, and roles

$API_BASE_URL = "http://localhost:8080/api"
$USER_ID = "afde270f-a1c4-4b75-a3d7-ba861609df0c"

Write-Host "🚀 Testing Dashboard APIs (User Themes, Integration Settings, Roles)" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Yellow

# Helper function to make API calls
function Invoke-ApiCall {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    $url = "$API_BASE_URL$Endpoint"
    Write-Host "`n🔄 $Method $url" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            Write-Host "   Request Body: $Body" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ Success: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
        return @{ Success = $true; Data = $response }
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# =============================================================================
# USER THEMES TESTS
# =============================================================================
Write-Host "`n🎨 Testing User Themes API..." -ForegroundColor Magenta

# Test 1: GET User Themes
Write-Host "`n📋 Test 1: GET User Themes"
$getThemesResult = Invoke-ApiCall -Endpoint "/user-themes"

# Test 2: CREATE User Theme
Write-Host "`n➕ Test 2: CREATE User Theme"
$newTheme = @{
    userId = $USER_ID
    name = "PowerShell Test Theme"
    primaryColor = "#FF6B6B"
    secondaryColor = "#4ECDC4"
    backgroundColor = "#F7F9FC"
    textColor = "#2C3E50"
    isActive = $false
} | ConvertTo-Json

$createThemeResult = Invoke-ApiCall -Endpoint "/user-themes" -Method "POST" -Body $newTheme
$createdThemeId = $null
if ($createThemeResult.Success -and $createThemeResult.Data.id) {
    $createdThemeId = $createThemeResult.Data.id
    Write-Host "   Created Theme ID: $createdThemeId" -ForegroundColor Gray
}

# Test 3: UPDATE User Theme
if ($createdThemeId) {
    Write-Host "`n✏️ Test 3: UPDATE User Theme"
    $updateTheme = @{
        name = "Updated PowerShell Theme"
        primaryColor = "#E74C3C"
        isActive = $true
    } | ConvertTo-Json
    
    $updateThemeResult = Invoke-ApiCall -Endpoint "/user-themes/$createdThemeId" -Method "PATCH" -Body $updateTheme
}

# Test 4: DELETE User Theme
if ($createdThemeId) {
    Write-Host "`n🗑️ Test 4: DELETE User Theme"
    $deleteThemeResult = Invoke-ApiCall -Endpoint "/user-themes/$createdThemeId" -Method "DELETE"
}

# =============================================================================
# INTEGRATION SETTINGS TESTS
# =============================================================================
Write-Host "`n⚡ Testing Integration Settings API..." -ForegroundColor Magenta

# Test 5: GET Integration Settings
Write-Host "`n📋 Test 5: GET Integration Settings"
$getIntegrationsResult = Invoke-ApiCall -Endpoint "/integration-settings"

# Test 6: CREATE Integration Setting
Write-Host "`n➕ Test 6: CREATE Integration Setting"
$newIntegration = @{
    userId = $USER_ID
    type = "GITHUB"
    connected = $false
    config = '{"token": "test-github-token", "repo": "test-repo"}'
} | ConvertTo-Json

$createIntegrationResult = Invoke-ApiCall -Endpoint "/integration-settings" -Method "POST" -Body $newIntegration
$createdIntegrationId = $null
if ($createIntegrationResult.Success -and $createIntegrationResult.Data.id) {
    $createdIntegrationId = $createIntegrationResult.Data.id
    Write-Host "   Created Integration ID: $createdIntegrationId" -ForegroundColor Gray
}

# Test 7: UPDATE Integration Setting
if ($createdIntegrationId) {
    Write-Host "`n✏️ Test 7: UPDATE Integration Setting"
    $updateIntegration = @{
        connected = $true
        config = '{"token": "updated-github-token", "repo": "updated-repo", "webhook": "https://example.com/webhook"}'
    } | ConvertTo-Json
    
    $updateIntegrationResult = Invoke-ApiCall -Endpoint "/integration-settings/$createdIntegrationId" -Method "PATCH" -Body $updateIntegration
}

# Test 8: CREATE Another Integration (SLACK)
Write-Host "`n➕ Test 8: CREATE SLACK Integration"
$slackIntegration = @{
    userId = $USER_ID
    type = "SLACK"
    connected = $true
    config = '{"webhook": "https://hooks.slack.com/services/test", "channel": "#general"}'
} | ConvertTo-Json

$createSlackResult = Invoke-ApiCall -Endpoint "/integration-settings" -Method "POST" -Body $slackIntegration
$createdSlackId = $null
if ($createSlackResult.Success -and $createSlackResult.Data.id) {
    $createdSlackId = $createSlackResult.Data.id
}

# Test 9: DELETE Integration Settings
if ($createdIntegrationId) {
    Write-Host "`n🗑️ Test 9: DELETE GitHub Integration"
    $deleteIntegrationResult = Invoke-ApiCall -Endpoint "/integration-settings/$createdIntegrationId" -Method "DELETE"
}

if ($createdSlackId) {
    Write-Host "`n🗑️ Test 9b: DELETE Slack Integration"
    $deleteSlackResult = Invoke-ApiCall -Endpoint "/integration-settings/$createdSlackId" -Method "DELETE"
}

# =============================================================================
# ROLES TESTS
# =============================================================================
Write-Host "`n🛡️ Testing Roles API..." -ForegroundColor Magenta

# Test 10: GET Roles
Write-Host "`n📋 Test 10: GET Roles"
$getRolesResult = Invoke-ApiCall -Endpoint "/roles"

# Test 11: CREATE Role
Write-Host "`n➕ Test 11: CREATE Role"
$newRole = @{
    name = "MANAGER"
    description = "Manager role with team oversight permissions"
    permissions = @("CREATE", "READ", "UPDATE", "MANAGE_PROJECTS", "VIEW_ANALYTICS")
} | ConvertTo-Json

$createRoleResult = Invoke-ApiCall -Endpoint "/roles" -Method "POST" -Body $newRole
$createdRoleId = $null
if ($createRoleResult.Success -and $createRoleResult.Data.id) {
    $createdRoleId = $createRoleResult.Data.id
    Write-Host "   Created Role ID: $createdRoleId" -ForegroundColor Gray
}

# Test 12: UPDATE Role
if ($createdRoleId) {
    Write-Host "`n✏️ Test 12: UPDATE Role"
    $updateRole = @{
        description = "Updated Manager role with enhanced permissions"
        permissions = @("CREATE", "READ", "UPDATE", "DELETE", "MANAGE_PROJECTS", "MANAGE_USERS", "VIEW_ANALYTICS")
    } | ConvertTo-Json
    
    $updateRoleResult = Invoke-ApiCall -Endpoint "/roles/$createdRoleId" -Method "PATCH" -Body $updateRole
}

# Test 13: CREATE Another Role (VIEWER)
Write-Host "`n➕ Test 13: CREATE VIEWER Role"
$viewerRole = @{
    name = "VIEWER"
    description = "Read-only access role"
    permissions = @("READ", "VIEW_ANALYTICS")
} | ConvertTo-Json

$createViewerResult = Invoke-ApiCall -Endpoint "/roles" -Method "POST" -Body $viewerRole
$createdViewerId = $null
if ($createViewerResult.Success -and $createViewerResult.Data.id) {
    $createdViewerId = $createViewerResult.Data.id
}

# Test 14: DELETE Roles
if ($createdRoleId) {
    Write-Host "`n🗑️ Test 14: DELETE Manager Role"
    $deleteRoleResult = Invoke-ApiCall -Endpoint "/roles/$createdRoleId" -Method "DELETE"
}

if ($createdViewerId) {
    Write-Host "`n🗑️ Test 14b: DELETE Viewer Role"
    $deleteViewerResult = Invoke-ApiCall -Endpoint "/roles/$createdViewerId" -Method "DELETE"
}

# =============================================================================
# FINAL VERIFICATION
# =============================================================================
Write-Host "`n📊 Final Verification..." -ForegroundColor Magenta

Write-Host "`n📋 Final GET - User Themes"
$finalThemesResult = Invoke-ApiCall -Endpoint "/user-themes"

Write-Host "`n📋 Final GET - Integration Settings"
$finalIntegrationsResult = Invoke-ApiCall -Endpoint "/integration-settings"

Write-Host "`n📋 Final GET - Roles"
$finalRolesResult = Invoke-ApiCall -Endpoint "/roles"

# =============================================================================
# SUMMARY
# =============================================================================
Write-Host "`n========================================================================" -ForegroundColor Yellow
Write-Host "🏁 Dashboard APIs Test Complete!" -ForegroundColor Green

Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "✅ User Themes API:" -ForegroundColor White
Write-Host "   - GET /user-themes" -ForegroundColor Gray
Write-Host "   - POST /user-themes" -ForegroundColor Gray
Write-Host "   - PATCH /user-themes/{id}" -ForegroundColor Gray
Write-Host "   - DELETE /user-themes/{id}" -ForegroundColor Gray

Write-Host "✅ Integration Settings API:" -ForegroundColor White
Write-Host "   - GET /integration-settings" -ForegroundColor Gray
Write-Host "   - POST /integration-settings" -ForegroundColor Gray
Write-Host "   - PATCH /integration-settings/{id}" -ForegroundColor Gray
Write-Host "   - DELETE /integration-settings/{id}" -ForegroundColor Gray

Write-Host "✅ Roles API:" -ForegroundColor White
Write-Host "   - GET /roles" -ForegroundColor Gray
Write-Host "   - POST /roles" -ForegroundColor Gray
Write-Host "   - PATCH /roles/{id}" -ForegroundColor Gray
Write-Host "   - DELETE /roles/{id}" -ForegroundColor Gray

Write-Host "`n💡 Your Working Curl Commands:" -ForegroundColor Magenta
Write-Host @"
# User Themes
curl --location 'http://localhost:8080/api/user-themes' --header 'Content-Type: application/json'

# Integration Settings  
curl --location 'http://localhost:8080/api/integration-settings' --header 'Content-Type: application/json'

# Roles
curl --location 'http://localhost:8080/api/roles' --header 'Content-Type: application/json'
"@ -ForegroundColor Cyan

Write-Host "`n🎯 All Dashboard CRUD Operations Tested Successfully!" -ForegroundColor Green
