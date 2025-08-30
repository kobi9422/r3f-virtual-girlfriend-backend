import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL;

console.log('Testing OpenRouter API...');
console.log('API Key:', openRouterApiKey ? `${openRouterApiKey.substring(0, 10)}...` : 'NOT SET');
console.log('Model:', openRouterModel);

async function testOpenRouter() {
  try {
    console.log('\nMaking request to OpenRouter...');
    
    const completion = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: openRouterModel,
      max_tokens: 100,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: `You are a virtual girlfriend. Reply with a valid JSON array of messages. Example: [{"text": "Hello!", "facialExpression": "smile", "animation": "Talking_1"}]`
        },
        {
          role: "user",
          content: "Ciao, come stai?"
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'R3F Virtual Girlfriend'
      }
    });
    
    console.log('\n✅ OpenRouter Response:');
    console.log('Status:', completion.status);
    console.log('Response:', completion.data.choices[0].message.content);
    
  } catch (error) {
    console.log('\n❌ OpenRouter Error:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }
}

testOpenRouter();