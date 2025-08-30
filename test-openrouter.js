import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-4-maverick:free';

console.log('🔍 Testing OpenRouter Configuration...');
console.log('API Key:', OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('Model:', OPENROUTER_MODEL);
console.log('\n📡 Making test request to OpenRouter...');

async function testOpenRouter() {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with just "OpenRouter is working!"'
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Virtual Girlfriend Test'
        }
      }
    );

    console.log('✅ SUCCESS! OpenRouter is working correctly.');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('\n📊 Usage Info:');
    if (response.data.usage) {
      console.log('- Prompt tokens:', response.data.usage.prompt_tokens);
      console.log('- Completion tokens:', response.data.usage.completion_tokens);
      console.log('- Total tokens:', response.data.usage.total_tokens);
    }
    
  } catch (error) {
    console.log('❌ ERROR! OpenRouter test failed.');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      // Specific error handling based on OpenRouter documentation
      switch (error.response.status) {
        case 400:
          console.log('\n💡 Solution: Check your request parameters (model name, message format)');
          break;
        case 401:
          console.log('\n💡 Solution: Check your API key - it may be invalid or expired');
          break;
        case 402:
          console.log('\n💡 Solution: Add credits to your OpenRouter account');
          break;
        case 403:
          console.log('\n💡 Solution: Your input was flagged by moderation');
          break;
        case 429:
          console.log('\n💡 Solution: You are being rate limited - wait and try again');
          break;
        case 502:
          console.log('\n💡 Solution: The model is down - try a different model');
          break;
        case 503:
          console.log('\n💡 Solution: No available provider - try a different model');
          break;
        default:
          console.log('\n💡 Check OpenRouter documentation for this error code');
      }
    } else {
      console.log('Network Error:', error.message);
      console.log('\n💡 Solution: Check your internet connection and OpenRouter API endpoint');
    }
  }
}

testOpenRouter();