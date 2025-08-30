// Test script per verificare le variabili d'ambiente
console.log('=== TEST VARIABILI D\'AMBIENTE ===');
console.log('PORT:', process.env.PORT || 'NON CONFIGURATA (fallback: 3000)');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'CONFIGURATA' : 'NON CONFIGURATA');
console.log('ELEVEN_LABS_API_KEY:', process.env.ELEVEN_LABS_API_KEY ? 'CONFIGURATA' : 'NON CONFIGURATA');
console.log('OPENROUTER_MODEL:', process.env.OPENROUTER_MODEL || 'NON CONFIGURATA (fallback: meta-llama/llama-3.1-8b-instruct:free)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NON CONFIGURATA');

// Verifica condizione fallback
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY || "-";

console.log('\n=== ANALISI FALLBACK ===');
console.log('elevenLabsApiKey è undefined?', !elevenLabsApiKey);
console.log('openRouterApiKey è "-"?', openRouterApiKey === "-");
console.log('FALLBACK ATTIVO?', !elevenLabsApiKey || openRouterApiKey === "-");

if (!elevenLabsApiKey || openRouterApiKey === "-") {
    console.log('\n❌ PROBLEMA: Il fallback è ATTIVO!');
    if (!elevenLabsApiKey) {
        console.log('   - ELEVEN_LABS_API_KEY non è configurata');
    }
    if (openRouterApiKey === "-") {
        console.log('   - OPENROUTER_API_KEY non è configurata (valore di default: "-")');
    }
} else {
    console.log('\n✅ OK: Le API keys sono configurate correttamente!');
}

console.log('\n=== FINE TEST ===');