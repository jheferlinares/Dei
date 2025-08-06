// Script para probar las APIs directamente
const fetch = require('node-fetch');

async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  const apis = [
    '/api/historial/buscar?termino=test',
    '/api/referidos/cerrados/buscar?termino=test',
    '/api/ano-corporativo/buscar?termino=test'
  ];
  
  for (const api of apis) {
    try {
      console.log(`\nProbando: ${api}`);
      const response = await fetch(baseUrl + api);
      console.log(`Status: ${response.status}`);
      
      if (response.status === 404) {
        console.log('❌ API no encontrada');
      } else {
        const data = await response.json();
        console.log('✅ API funcionando');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

testAPIs();