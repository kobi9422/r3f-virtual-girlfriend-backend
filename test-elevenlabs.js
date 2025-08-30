import voice from "elevenlabs-node";
import dotenv from "dotenv";

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

console.log('Testing ElevenLabs API...');
console.log('API Key:', elevenLabsApiKey ? 'Present' : 'Missing');

async function testElevenLabs() {
  try {
    console.log('\nGetting available voices...');
    const voices = await voice.getVoices(elevenLabsApiKey);
    console.log('✅ API connection successful. Available voices:', voices.voices?.length || 0);
    
    if (voices.voices && voices.voices.length > 0) {
      console.log('\nFirst few voices:');
      voices.voices.slice(0, 3).forEach((v, i) => {
        console.log(`${i + 1}. Name: ${v.name}, ID: ${v.voice_id}`);
      });
      
      // Use the first available voice
      const firstVoice = voices.voices[0];
      console.log(`\nTesting with voice: ${firstVoice.name} (${firstVoice.voice_id})`);
      
      const fileName = 'audios/test_message.mp3';
      const textInput = 'Hello, this is a test message!';
      
      await voice.textToSpeech(elevenLabsApiKey, firstVoice.voice_id, fileName, textInput);
      console.log('✅ Audio file generated successfully:', fileName);
    } else {
      console.log('❌ No voices available');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
}

testElevenLabs();