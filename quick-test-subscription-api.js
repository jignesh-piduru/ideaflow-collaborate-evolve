// Quick test for subscription API endpoints
// Run with: node quick-test-subscription-api.js

const API_BASE = 'http://localhost:8080/api';

async function testAPI() {
    console.log('🚀 Testing Subscription API Endpoints');
    console.log('=====================================');
    
    // Test your exact curl command
    console.log('\n📋 Testing your exact curl command:');
    console.log('curl --location \'http://localhost:8080/api/subscriptions\' --header \'Content-Type: application/json\'');
    
    try {
        const response = await fetch(`${API_BASE}/subscriptions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`\n✅ Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Response received successfully!');
            console.log(`📊 Data structure: ${typeof data}`);
            
            if (data.content && Array.isArray(data.content)) {
                console.log(`📊 Found ${data.content.length} subscriptions`);
                console.log('✅ Paginated response format detected');
            } else if (Array.isArray(data)) {
                console.log(`📊 Found ${data.length} subscriptions`);
                console.log('✅ Array response format detected');
            } else {
                console.log('✅ Response received (unknown format)');
            }
            
            // Test CREATE if GET works
            console.log('\n➕ Testing CREATE subscription...');
            const createResponse = await fetch(`${API_BASE}/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'afde270f-a1c4-4b75-a3d7-ba861609df0c',
                    planName: 'Test Plan',
                    planType: 'BASIC',
                    status: 'ACTIVE',
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    price: 9.99,
                    currency: 'USD',
                    billingCycle: 'MONTHLY',
                    features: ['Basic Features', 'Email Support'],
                    autoRenew: true
                })
            });
            
            if (createResponse.ok) {
                const created = await createResponse.json();
                console.log(`✅ CREATE: Success (Status: ${createResponse.status})`);
                console.log(`📝 Created ID: ${created.id || 'Unknown'}`);
                
                // Test UPDATE if CREATE worked
                if (created.id) {
                    console.log('\n✏️ Testing UPDATE subscription...');
                    const updateResponse = await fetch(`${API_BASE}/subscriptions/${created.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            planName: 'Updated Test Plan',
                            price: 19.99
                        })
                    });
                    
                    if (updateResponse.ok) {
                        console.log(`✅ UPDATE: Success (Status: ${updateResponse.status})`);
                    } else {
                        console.log(`❌ UPDATE: Failed (Status: ${updateResponse.status})`);
                    }
                    
                    // Test DELETE (cleanup)
                    console.log('\n🗑️ Testing DELETE subscription...');
                    const deleteResponse = await fetch(`${API_BASE}/subscriptions/${created.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (deleteResponse.ok || deleteResponse.status === 204) {
                        console.log(`✅ DELETE: Success (Status: ${deleteResponse.status})`);
                    } else {
                        console.log(`❌ DELETE: Failed (Status: ${deleteResponse.status})`);
                    }
                }
            } else {
                console.log(`❌ CREATE: Failed (Status: ${createResponse.status})`);
                const errorText = await createResponse.text();
                console.log(`❌ Error: ${errorText}`);
            }
            
        } else {
            const errorText = await response.text();
            console.log(`❌ Error: ${errorText}`);
        }
        
    } catch (error) {
        console.log(`❌ Network Error: ${error.message}`);
        console.log('\n💡 Possible issues:');
        console.log('   - Backend server not running on port 8080');
        console.log('   - CORS issues');
        console.log('   - Network connectivity problems');
    }
    
    console.log('\n=====================================');
    console.log('🏁 Test Complete!');
    
    console.log('\n💡 Your working curl command:');
    console.log('curl --location \'http://localhost:8080/api/subscriptions\' --header \'Content-Type: application/json\'');
    
    console.log('\n📱 Frontend Integration:');
    console.log('   - React app: Dashboard → Settings → Billing tab');
    console.log('   - Full subscription management interface');
    console.log('   - All CRUD operations available');
}

// Run the test
testAPI().catch(console.error);
