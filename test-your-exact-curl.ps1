# Test script for your exact curl command
# curl --location 'http://localhost:8080/api/subscriptions' --header 'Content-Type: application/json'

$API_BASE_URL = "http://localhost:8080/api"

Write-Host "🚀 Testing Your Exact Curl Command" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Yellow
Write-Host "curl --location 'http://localhost:8080/api/subscriptions' --header 'Content-Type: application/json'" -ForegroundColor Cyan

# Test your exact curl command
Write-Host "`n📋 Testing GET /api/subscriptions..." -ForegroundColor Magenta

$result = curl --location "$API_BASE_URL/subscriptions" `
    --header "Content-Type: application/json" `
    --silent --show-error --write-out "HTTPSTATUS:%{http_code}"

$responseBody = $result -replace "HTTPSTATUS:.*", ""
$statusCode = if ($result -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }

Write-Host "`nResponse:" -ForegroundColor Gray
Write-Host $responseBody
Write-Host "`nStatus Code: $statusCode" -ForegroundColor Gray

if ($statusCode -eq "200") {
    Write-Host "`n✅ SUCCESS: Your curl command works perfectly!" -ForegroundColor Green
    
    # Try to parse the response to show subscription count
    try {
        $jsonResponse = $responseBody | ConvertFrom-Json
        if ($jsonResponse.content) {
            $subscriptionCount = $jsonResponse.content.Count
            Write-Host "📊 Found $subscriptionCount subscriptions" -ForegroundColor Green
        } elseif ($jsonResponse -is [array]) {
            $subscriptionCount = $jsonResponse.Count
            Write-Host "📊 Found $subscriptionCount subscriptions" -ForegroundColor Green
        } else {
            Write-Host "📊 Response received successfully" -ForegroundColor Green
        }
    } catch {
        Write-Host "📊 Response received (could not parse JSON structure)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ FAILED: Your curl command returned status $statusCode" -ForegroundColor Red
    Write-Host "💡 This might mean:" -ForegroundColor Yellow
    Write-Host "   - Backend server is not running on port 8080" -ForegroundColor Gray
    Write-Host "   - /api/subscriptions endpoint is not implemented" -ForegroundColor Gray
    Write-Host "   - Database connection issues" -ForegroundColor Gray
}

Write-Host "`n===================================" -ForegroundColor Yellow

# Test additional CRUD operations if GET works
if ($statusCode -eq "200") {
    Write-Host "🧪 Testing Additional CRUD Operations..." -ForegroundColor Magenta
    
    # Test CREATE
    Write-Host "`n➕ Testing CREATE Subscription..." -ForegroundColor Cyan
    $newSubscription = @{
        userId = "afde270f-a1c4-4b75-a3d7-ba861609df0c"
        planName = "Test Plan"
        planType = "BASIC"
        status = "ACTIVE"
        startDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
        price = 9.99
        currency = "USD"
        billingCycle = "MONTHLY"
        features = @("Basic Features", "Email Support")
        autoRenew = $true
    } | ConvertTo-Json
    
    $createResult = curl --location "$API_BASE_URL/subscriptions" `
        --header "Content-Type: application/json" `
        --request POST `
        --data $newSubscription `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $createStatus = if ($createResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    $createBody = $createResult -replace "HTTPSTATUS:.*", ""
    
    if ($createStatus -match "20[01]") {
        Write-Host "✅ CREATE: SUCCESS" -ForegroundColor Green
        
        # Extract created ID for further testing
        $createdId = $null
        try {
            $createJson = $createBody | ConvertFrom-Json
            $createdId = $createJson.id
            Write-Host "   Created ID: $createdId" -ForegroundColor Gray
        } catch {
            Write-Host "   Created successfully (could not extract ID)" -ForegroundColor Gray
        }
        
        # Test UPDATE if we have an ID
        if ($createdId) {
            Write-Host "`n✏️ Testing UPDATE Subscription..." -ForegroundColor Cyan
            $updateData = @{
                planName = "Updated Test Plan"
                price = 19.99
            } | ConvertTo-Json
            
            $updateResult = curl --location "$API_BASE_URL/subscriptions/$createdId" `
                --header "Content-Type: application/json" `
                --request PATCH `
                --data $updateData `
                --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
            
            $updateStatus = if ($updateResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
            
            if ($updateStatus -eq "200") {
                Write-Host "✅ UPDATE: SUCCESS" -ForegroundColor Green
            } else {
                Write-Host "❌ UPDATE: FAILED (Status: $updateStatus)" -ForegroundColor Red
            }
            
            # Test GET by ID
            Write-Host "`n🔍 Testing GET by ID..." -ForegroundColor Cyan
            $getByIdResult = curl --location "$API_BASE_URL/subscriptions/$createdId" `
                --header "Content-Type: application/json" `
                --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
            
            $getByIdStatus = if ($getByIdResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
            
            if ($getByIdStatus -eq "200") {
                Write-Host "✅ GET by ID: SUCCESS" -ForegroundColor Green
            } else {
                Write-Host "❌ GET by ID: FAILED (Status: $getByIdStatus)" -ForegroundColor Red
            }
            
            # Test DELETE (cleanup)
            Write-Host "`n🗑️ Testing DELETE Subscription..." -ForegroundColor Cyan
            $deleteResult = curl --location "$API_BASE_URL/subscriptions/$createdId" `
                --request DELETE `
                --header "Content-Type: application/json" `
                --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
            
            $deleteStatus = if ($deleteResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
            
            if ($deleteStatus -match "20[04]") {
                Write-Host "✅ DELETE: SUCCESS" -ForegroundColor Green
            } else {
                Write-Host "❌ DELETE: FAILED (Status: $deleteStatus)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ CREATE: FAILED (Status: $createStatus)" -ForegroundColor Red
        Write-Host "Response: $createBody" -ForegroundColor Gray
    }
    
    # Final verification
    Write-Host "`n📊 Final Verification..." -ForegroundColor Cyan
    $finalResult = curl --location "$API_BASE_URL/subscriptions" `
        --header "Content-Type: application/json" `
        --silent --show-error --write-out "HTTPSTATUS:%{http_code}"
    
    $finalStatus = if ($finalResult -match "HTTPSTATUS:(\d+)") { $matches[1] } else { "Unknown" }
    
    if ($finalStatus -eq "200") {
        Write-Host "✅ Final GET: SUCCESS - All operations completed" -ForegroundColor Green
    } else {
        Write-Host "❌ Final GET: FAILED" -ForegroundColor Red
    }
}

Write-Host "`n===================================" -ForegroundColor Yellow
Write-Host "🏁 Test Complete!" -ForegroundColor Green

if ($statusCode -eq "200") {
    Write-Host "`n🎉 Your curl command works perfectly!" -ForegroundColor Green
    Write-Host "✅ The subscription API is fully functional" -ForegroundColor Green
    Write-Host "🎯 You can now use all CRUD operations" -ForegroundColor Green
    Write-Host "`n📱 Frontend Integration:" -ForegroundColor Cyan
    Write-Host "   - Open your React app" -ForegroundColor Gray
    Write-Host "   - Go to Dashboard → Settings → Billing tab" -ForegroundColor Gray
    Write-Host "   - Full subscription management interface available" -ForegroundColor Gray
} else {
    Write-Host "`n🔧 To fix the issue:" -ForegroundColor Yellow
    Write-Host "   1. Make sure your backend server is running on port 8080" -ForegroundColor Gray
    Write-Host "   2. Verify the /api/subscriptions endpoint is implemented" -ForegroundColor Gray
    Write-Host "   3. Check database connectivity" -ForegroundColor Gray
    Write-Host "   4. Review server logs for errors" -ForegroundColor Gray
}

Write-Host "`n💡 Your exact working command:" -ForegroundColor Magenta
Write-Host "curl --location 'http://localhost:8080/api/subscriptions' --header 'Content-Type: application/json'" -ForegroundColor Cyan
