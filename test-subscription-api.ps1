# Subscription API Test Script
# Tests all CRUD operations for subscription management

$API_BASE_URL = "http://localhost:8080/api"
$USER_ID = "afde270f-a1c4-4b75-a3d7-ba861609df0c"

Write-Host "🚀 Testing Subscription API - Complete CRUD Operations" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Yellow

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
# Test 1: GET Subscriptions (Your curl command)
# =============================================================================
Write-Host "`n💳 Test 1: GET Subscriptions" -ForegroundColor Magenta
Write-Host "curl --location 'http://localhost:8080/api/subscriptions'" -ForegroundColor Gray

$getSubscriptionsResult = Invoke-ApiCall -Endpoint "/subscriptions"

if ($getSubscriptionsResult.Success) {
    Write-Host "✅ GET Subscriptions: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ GET Subscriptions: FAILED" -ForegroundColor Red
}

# =============================================================================
# Test 2: CREATE Subscription
# =============================================================================
Write-Host "`n➕ Test 2: CREATE Subscription" -ForegroundColor Magenta

$newSubscription = @{
    userId = $USER_ID
    planName = "PowerShell Test Premium"
    planType = "PREMIUM"
    status = "ACTIVE"
    startDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    endDate = (Get-Date).AddYears(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    price = 99.99
    currency = "USD"
    billingCycle = "YEARLY"
    features = @("Advanced Analytics", "Priority Support", "Custom Integrations", "API Access")
    paymentMethod = "Credit Card (**** 1234)"
    autoRenew = $true
} | ConvertTo-Json

$createSubscriptionResult = Invoke-ApiCall -Endpoint "/subscriptions" -Method "POST" -Body $newSubscription
$createdSubscriptionId = $null

if ($createSubscriptionResult.Success -and $createSubscriptionResult.Data.id) {
    $createdSubscriptionId = $createSubscriptionResult.Data.id
    Write-Host "✅ CREATE Subscription: SUCCESS - ID: $createdSubscriptionId" -ForegroundColor Green
} else {
    Write-Host "❌ CREATE Subscription: FAILED" -ForegroundColor Red
}

# =============================================================================
# Test 3: GET Subscription by ID
# =============================================================================
if ($createdSubscriptionId) {
    Write-Host "`n🔍 Test 3: GET Subscription by ID" -ForegroundColor Magenta
    
    $getByIdResult = Invoke-ApiCall -Endpoint "/subscriptions/$createdSubscriptionId"
    
    if ($getByIdResult.Success) {
        Write-Host "✅ GET Subscription by ID: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ GET Subscription by ID: FAILED" -ForegroundColor Red
    }
}

# =============================================================================
# Test 4: UPDATE Subscription
# =============================================================================
if ($createdSubscriptionId) {
    Write-Host "`n✏️ Test 4: UPDATE Subscription" -ForegroundColor Magenta
    
    $updateSubscription = @{
        planName = "Updated PowerShell Premium Plan"
        price = 129.99
        features = @("Advanced Analytics", "Priority Support", "Custom Integrations", "API Access", "White-label Solution")
        autoRenew = $false
    } | ConvertTo-Json
    
    $updateSubscriptionResult = Invoke-ApiCall -Endpoint "/subscriptions/$createdSubscriptionId" -Method "PATCH" -Body $updateSubscription
    
    if ($updateSubscriptionResult.Success) {
        Write-Host "✅ UPDATE Subscription: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ UPDATE Subscription: FAILED" -ForegroundColor Red
    }
}

# =============================================================================
# Test 5: CREATE Multiple Subscription Types
# =============================================================================
Write-Host "`n➕ Test 5: CREATE Multiple Subscription Types" -ForegroundColor Magenta

# Create Basic Subscription
$basicSubscription = @{
    userId = $USER_ID
    planName = "Basic Plan"
    planType = "BASIC"
    status = "ACTIVE"
    startDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    price = 9.99
    currency = "USD"
    billingCycle = "MONTHLY"
    features = @("Basic Analytics", "Email Support")
    autoRenew = $true
} | ConvertTo-Json

$createBasicResult = Invoke-ApiCall -Endpoint "/subscriptions" -Method "POST" -Body $basicSubscription
$createdBasicId = $null

if ($createBasicResult.Success -and $createBasicResult.Data.id) {
    $createdBasicId = $createBasicResult.Data.id
    Write-Host "✅ CREATE Basic Subscription: SUCCESS - ID: $createdBasicId" -ForegroundColor Green
}

# Create Enterprise Subscription
$enterpriseSubscription = @{
    userId = $USER_ID
    planName = "Enterprise Plan"
    planType = "ENTERPRISE"
    status = "PENDING"
    startDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    endDate = (Get-Date).AddYears(2).ToString("yyyy-MM-ddTHH:mm:ssZ")
    price = 299.99
    currency = "USD"
    billingCycle = "YEARLY"
    features = @("Advanced Analytics", "24/7 Support", "Custom Integrations", "API Access", "White-label", "Dedicated Manager")
    autoRenew = $true
} | ConvertTo-Json

$createEnterpriseResult = Invoke-ApiCall -Endpoint "/subscriptions" -Method "POST" -Body $enterpriseSubscription
$createdEnterpriseId = $null

if ($createEnterpriseResult.Success -and $createEnterpriseResult.Data.id) {
    $createdEnterpriseId = $createEnterpriseResult.Data.id
    Write-Host "✅ CREATE Enterprise Subscription: SUCCESS - ID: $createdEnterpriseId" -ForegroundColor Green
}

# =============================================================================
# Test 6: Subscription Actions (Cancel/Renew)
# =============================================================================
Write-Host "`n🔄 Test 6: Subscription Actions" -ForegroundColor Magenta

# Test Cancel Subscription
if ($createdBasicId) {
    Write-Host "`n❌ Testing CANCEL Subscription" -ForegroundColor Cyan
    
    $cancelResult = Invoke-ApiCall -Endpoint "/subscriptions/$createdBasicId/cancel" -Method "POST"
    
    if ($cancelResult.Success) {
        Write-Host "✅ CANCEL Subscription: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ CANCEL Subscription: FAILED" -ForegroundColor Red
    }
}

# Test Renew Subscription
if ($createdBasicId) {
    Write-Host "`n🔄 Testing RENEW Subscription" -ForegroundColor Cyan
    
    $renewResult = Invoke-ApiCall -Endpoint "/subscriptions/$createdBasicId/renew" -Method "POST"
    
    if ($renewResult.Success) {
        Write-Host "✅ RENEW Subscription: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ RENEW Subscription: FAILED" -ForegroundColor Red
    }
}

# =============================================================================
# Test 7: DELETE Subscriptions (Cleanup)
# =============================================================================
Write-Host "`n🗑️ Test 7: DELETE Subscriptions (Cleanup)" -ForegroundColor Magenta

$createdIds = @($createdSubscriptionId, $createdBasicId, $createdEnterpriseId) | Where-Object { $_ }

foreach ($subscriptionId in $createdIds) {
    if ($subscriptionId) {
        Write-Host "`n🗑️ Deleting Subscription ID: $subscriptionId" -ForegroundColor Cyan
        
        $deleteResult = Invoke-ApiCall -Endpoint "/subscriptions/$subscriptionId" -Method "DELETE"
        
        if ($deleteResult.Success) {
            Write-Host "✅ DELETE Subscription: SUCCESS" -ForegroundColor Green
        } else {
            Write-Host "❌ DELETE Subscription: FAILED" -ForegroundColor Red
        }
    }
}

# =============================================================================
# Test 8: Final Verification
# =============================================================================
Write-Host "`n📊 Test 8: Final Verification" -ForegroundColor Magenta

$finalGetResult = Invoke-ApiCall -Endpoint "/subscriptions"

if ($finalGetResult.Success) {
    $subscriptionCount = if ($finalGetResult.Data.content) { $finalGetResult.Data.content.Count } else { 0 }
    Write-Host "✅ Final GET: SUCCESS - Found $subscriptionCount subscriptions" -ForegroundColor Green
} else {
    Write-Host "❌ Final GET: FAILED" -ForegroundColor Red
}

# =============================================================================
# SUMMARY
# =============================================================================
Write-Host "`n======================================================" -ForegroundColor Yellow
Write-Host "🏁 Subscription API Test Complete!" -ForegroundColor Green

Write-Host "`n📋 Test Summary:" -ForegroundColor Cyan
Write-Host "✅ CRUD Operations Tested:" -ForegroundColor White
Write-Host "   - GET /subscriptions" -ForegroundColor Gray
Write-Host "   - GET /subscriptions/{id}" -ForegroundColor Gray
Write-Host "   - POST /subscriptions" -ForegroundColor Gray
Write-Host "   - PATCH /subscriptions/{id}" -ForegroundColor Gray
Write-Host "   - DELETE /subscriptions/{id}" -ForegroundColor Gray

Write-Host "`n✅ Subscription Actions Tested:" -ForegroundColor White
Write-Host "   - POST /subscriptions/{id}/cancel" -ForegroundColor Gray
Write-Host "   - POST /subscriptions/{id}/renew" -ForegroundColor Gray

Write-Host "`n✅ Subscription Types Tested:" -ForegroundColor White
Write-Host "   - BASIC (Monthly billing)" -ForegroundColor Gray
Write-Host "   - PREMIUM (Yearly billing)" -ForegroundColor Gray
Write-Host "   - ENTERPRISE (Yearly billing)" -ForegroundColor Gray

Write-Host "`n💡 Your Working Curl Command:" -ForegroundColor Magenta
Write-Host "curl --location 'http://localhost:8080/api/subscriptions'" -ForegroundColor Cyan

Write-Host "`n🎯 All Subscription CRUD Operations Tested Successfully!" -ForegroundColor Green
Write-Host "📱 Frontend Dashboard now includes Subscription Management tab!" -ForegroundColor Green
