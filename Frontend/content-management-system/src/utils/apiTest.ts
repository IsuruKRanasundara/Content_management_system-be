import api from '../services/api';

export const testApiConnection = async () => {
  console.log('🔧 === API CONNECTION TEST ===');
  
  // Test 1: Check token in localStorage
  const token = localStorage.getItem('token');
  console.log('1️⃣ Token exists:', !!token);
  if (token) {
    console.log('   Token length:', token.length);
    console.log('   Token preview:', token.substring(0, 30) + '...');
    console.log('   Token format check:', token.startsWith('eyJ') ? '✅ JWT format' : '⚠️ Unexpected format');
  }
  
  // Test 2: Check user in localStorage
  const user = localStorage.getItem('user');
  console.log('2️⃣ User exists:', !!user);
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('   User data:', userData);
    } catch (e) {
      console.error('   ❌ Failed to parse user data');
    }
  }
  
  // Test 3: Make a test API call
  if (token) {
    try {
      console.log('3️⃣ Testing API call to /contents...');
      const response = await api.get('/contents');
      console.log('   ✅ API call successful');
      console.log('   Response status:', response.status);
      console.log('   Response data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
    } catch (error: any) {
      console.error('   ❌ API call failed');
      console.error('   Error status:', error.response?.status);
      console.error('   Error message:', error.response?.data?.message || error.message);
      console.error('   Error headers:', error.response?.headers);
    }
  }
  
  console.log('🔧 === TEST COMPLETE ===');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testApiConnection = testApiConnection;
}
