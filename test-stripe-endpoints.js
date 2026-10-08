// Script de prueba para endpoints de Stripe
// Ejecutar con: node test-stripe-endpoints.js

const BASE_URL = 'http://localhost:3000';

// Función para probar el endpoint de Payment Sheet (Expo)
async function testPaymentSheet() {
  console.log('🧪 Probando Payment Sheet (Expo)...');
  
  try {
    const response = await fetch(`${BASE_URL}/stripe/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1099,
        currency: 'usd',
        customerEmail: 'test@example.com'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment Sheet - SUCCESS');
      console.log('📄 Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Payment Sheet - ERROR');
      console.log('📄 Error:', data);
    }
  } catch (error) {
    console.log('❌ Payment Sheet - CONNECTION ERROR');
    console.log('📄 Error:', error.message);
  }
}

// Función para probar el endpoint de Checkout Session (Web)
async function testCheckoutSession() {
  console.log('\n🧪 Probando Checkout Session (Web)...');
  
  try {
    const response = await fetch(`${BASE_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1099,
        currency: 'usd'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Checkout Session - SUCCESS');
      console.log('📄 Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Checkout Session - ERROR');
      console.log('📄 Error:', data);
    }
  } catch (error) {
    console.log('❌ Checkout Session - CONNECTION ERROR');
    console.log('📄 Error:', error.message);
  }
}

// Función para probar el endpoint de Payment Intent (Web)
async function testPaymentIntent() {
  console.log('\n🧪 Probando Payment Intent (Web)...');
  
  try {
    const response = await fetch(`${BASE_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1099,
        currency: 'usd'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment Intent - SUCCESS');
      console.log('📄 Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Payment Intent - ERROR');
      console.log('📄 Error:', data);
    }
  } catch (error) {
    console.log('❌ Payment Intent - CONNECTION ERROR');
    console.log('📄 Error:', error.message);
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de endpoints Stripe...\n');
  console.log('⚠️  Asegúrate de que el servidor esté ejecutándose en', BASE_URL);
  console.log('⚠️  Y que las variables de entorno STRIPE_SECRET_KEY y STRIPE_PUBLISHABLE_KEY estén configuradas\n');
  
  await testPaymentSheet();
  await testCheckoutSession();
  await testPaymentIntent();
  
  console.log('\n🏁 Pruebas completadas!');
  console.log('\n📋 Notas importantes:');
  console.log('- Si ves errores de conexión, verifica que el servidor esté ejecutándose');
  console.log('- Si ves errores de Stripe, verifica las variables de entorno');
  console.log('- Para usar en producción, cambia las claves de test por las de live');
}

// Verificar si fetch está disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requiere Node.js 18+ o instalar node-fetch');
  console.log('💡 Alternativamente, puedes usar Postman o curl para probar los endpoints');
} else {
  runTests();
}
