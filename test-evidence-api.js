/**
 * Evidence API Test Script
 * Tests all CRUD operations for the Evidence API
 * Run with: node test-evidence-api.js
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Test data
const testProjectId = '3d18e9e7-959f-428c-92b5-f189d73a8301';
const testUploadedBy = '785f858a-b243-4756-8008-aa062292ef60';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n🔄 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, data);
      return { success: true, data, status: response.status };
    } else {
      console.log(`❌ Error (${response.status}):`, data);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Test functions
async function testGetEvidence() {
  console.log('\n📋 Testing GET Evidence...');
  return await apiCall('/evidence?page=0&size=20&sort=uploadedAt&direction=desc');
}

async function testCreateTextEvidence() {
  console.log('\n📝 Testing CREATE Text Evidence...');
  
  const formData = new FormData();
  formData.append('title', 'Test Text Evidence');
  formData.append('description', 'This is a test text evidence created via API');
  formData.append('type', 'TEXT');
  formData.append('category', 'Testing');
  formData.append('projectId', testProjectId);
  formData.append('uploadedBy', testUploadedBy);
  
  return await apiCall('/evidence', {
    method: 'POST',
    body: formData
  });
}

async function testCreateLinkEvidence() {
  console.log('\n🔗 Testing CREATE Link Evidence...');
  
  const formData = new FormData();
  formData.append('title', 'Test Link Evidence');
  formData.append('description', 'This is a test link evidence');
  formData.append('type', 'LINK');
  formData.append('category', 'Testing');
  formData.append('projectId', testProjectId);
  formData.append('uploadedBy', testUploadedBy);
  formData.append('url', 'https://example.com');
  
  return await apiCall('/evidence', {
    method: 'POST',
    body: formData
  });
}

async function testCreateFileEvidence() {
  console.log('\n📁 Testing CREATE File Evidence...');
  
  // Create a simple text file for testing
  const fileContent = 'This is a test file for evidence API testing.';
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const file = new File([blob], 'test-file.txt', { type: 'text/plain' });
  
  const formData = new FormData();
  formData.append('title', 'Test File Evidence');
  formData.append('description', 'This is a test file evidence');
  formData.append('type', 'FILE');
  formData.append('category', 'Testing');
  formData.append('projectId', testProjectId);
  formData.append('uploadedBy', testUploadedBy);
  formData.append('file', file);
  
  return await apiCall('/evidence', {
    method: 'POST',
    body: formData
  });
}

async function testUpdateEvidence(evidenceId) {
  console.log(`\n✏️ Testing UPDATE Evidence (ID: ${evidenceId})...`);
  
  const updateData = {
    description: 'Updated description via API test',
    category: 'Updated Category'
  };
  
  return await apiCall(`/evidence/${evidenceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
}

async function testDeleteEvidence(evidenceId) {
  console.log(`\n🗑️ Testing DELETE Evidence (ID: ${evidenceId})...`);
  
  return await apiCall(`/evidence/${evidenceId}`, {
    method: 'DELETE'
  });
}

async function testGetProjects() {
  console.log('\n📂 Testing GET Projects...');
  return await apiCall('/projects?page=0&size=20');
}

async function testGetUsers() {
  console.log('\n👥 Testing GET Users...');
  return await apiCall('/users?page=0&size=20');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Evidence API Tests...');
  console.log('=====================================');
  
  const results = {
    passed: 0,
    failed: 0,
    createdEvidenceIds: []
  };
  
  // Test GET operations first
  const getEvidenceResult = await testGetEvidence();
  results[getEvidenceResult.success ? 'passed' : 'failed']++;
  
  const getProjectsResult = await testGetProjects();
  results[getProjectsResult.success ? 'passed' : 'failed']++;
  
  const getUsersResult = await testGetUsers();
  results[getUsersResult.success ? 'passed' : 'failed']++;
  
  // Test CREATE operations
  const textEvidenceResult = await testCreateTextEvidence();
  results[textEvidenceResult.success ? 'passed' : 'failed']++;
  if (textEvidenceResult.success && textEvidenceResult.data.id) {
    results.createdEvidenceIds.push(textEvidenceResult.data.id);
  }
  
  const linkEvidenceResult = await testCreateLinkEvidence();
  results[linkEvidenceResult.success ? 'passed' : 'failed']++;
  if (linkEvidenceResult.success && linkEvidenceResult.data.id) {
    results.createdEvidenceIds.push(linkEvidenceResult.data.id);
  }
  
  const fileEvidenceResult = await testCreateFileEvidence();
  results[fileEvidenceResult.success ? 'passed' : 'failed']++;
  if (fileEvidenceResult.success && fileEvidenceResult.data.id) {
    results.createdEvidenceIds.push(fileEvidenceResult.data.id);
  }
  
  // Test UPDATE operation (if we have created evidence)
  if (results.createdEvidenceIds.length > 0) {
    const updateResult = await testUpdateEvidence(results.createdEvidenceIds[0]);
    results[updateResult.success ? 'passed' : 'failed']++;
  }
  
  // Test DELETE operation (clean up created evidence)
  for (const evidenceId of results.createdEvidenceIds) {
    const deleteResult = await testDeleteEvidence(evidenceId);
    results[deleteResult.success ? 'passed' : 'failed']++;
  }
  
  // Final results
  console.log('\n=====================================');
  console.log('🏁 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  const FormData = require('form-data');
  const { File, Blob } = require('buffer');
  
  runAllTests().catch(console.error);
} else {
  // Browser environment
  console.log('Evidence API Test Script loaded. Call runAllTests() to start testing.');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testGetEvidence,
    testCreateTextEvidence,
    testCreateLinkEvidence,
    testCreateFileEvidence,
    testUpdateEvidence,
    testDeleteEvidence
  };
}
