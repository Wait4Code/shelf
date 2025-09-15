// src/utils/fetchTest.ts
// Test direct avec fetch pour vérifier les headers

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const testFetchWithJsonLd = async () => {
  console.log('🧪 Test avec fetch direct...');
  
  try {
    // Test GET
    console.log('📡 Test GET...');
    const getResponse = await fetch(`${API_BASE_URL}/researched_items`, {
      method: 'GET',
      headers: {
        'Accept': 'application/ld+json',
        'Content-Type': 'application/ld+json',
      },
    });
    
    console.log('GET Response status:', getResponse.status);
    console.log('GET Response headers:', Object.fromEntries(getResponse.headers.entries()));
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error('GET Error:', errorText);
      return { success: false, error: `GET failed: ${getResponse.status} - ${errorText}` };
    }
    
    const getData = await getResponse.json();
    console.log('GET Data:', getData);
    
    // Test POST
    console.log('📡 Test POST...');
    const postData = {
      '@type': 'ResearchedItem',
      status: 'PENDING',
      fromScan: true,
      fromBnf: true,
      barcode: 'TEST_FETCH_123456789',
      competingDocuments: []
    };
    
    const postResponse = await fetch(`${API_BASE_URL}/researched_items`, {
      method: 'POST',
      headers: {
        'Accept': 'application/ld+json',
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify(postData),
    });
    
    console.log('POST Response status:', postResponse.status);
    console.log('POST Response headers:', Object.fromEntries(postResponse.headers.entries()));
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error('POST Error:', errorText);
      return { 
        success: false, 
        error: `POST failed: ${postResponse.status} - ${errorText}`,
        getData 
      };
    }
    
    const postResponseData = await postResponse.json();
    console.log('POST Data:', postResponseData);
    
    return { 
      success: true, 
      message: 'Tests fetch réussis',
      data: { get: getData, post: postResponseData }
    };
    
  } catch (error: any) {
    console.error('❌ Erreur fetch:', error);
    return { 
      success: false, 
      error: `Erreur fetch: ${error.message}` 
    };
  }
};
