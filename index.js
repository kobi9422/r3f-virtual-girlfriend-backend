import { exec } from "child_process";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
dotenv.config();

const openRouterApiKey = process.env.OPENROUTER_API_KEY || "-";
const openRouterModel = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `bin\\rhubarb.exe -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey || openRouterApiKey === "-") {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy OpenRouter and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
    return;
  }

  const completion = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: openRouterModel,
    max_tokens: 500,
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: `
        You are a virtual girlfriend.
        You MUST always reply with a valid JSON array of messages. With a maximum of 2 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
        
        IMPORTANT: Your response must be ONLY a valid JSON array, nothing else. Example:
        [{"text": "Hello!", "facialExpression": "smile", "animation": "Talking_1"}]
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  }, {
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://r3f-virtual-girlfriend-backend-main.vercel.app',
      'X-Title': 'R3F Virtual Girlfriend'
    },
    timeout: 8000
  });
  
  let messages;
  try {
    const responseContent = completion.data.choices[0].message.content;
    console.log('Raw AI response:', responseContent);
    messages = JSON.parse(responseContent);
    if (messages.messages) {
      messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
    messages = [{
      text: "Sorry, I'm having trouble understanding right now. Please try again!",
      facialExpression: "sad",
      animation: "Talking_1"
    }];
  }
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    let audioGenerated = false;
    
    try {
      // generate audio file with timeout
      const fileName = `audios/message_${i}.mp3`;
      const textInput = message.text;
      
      // Set timeout for audio generation (5 seconds)
      const audioPromise = voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
      await Promise.race([
        audioPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Audio generation timeout')), 5000))
      ]);
      
      audioGenerated = true;
      
      // generate lipsync with timeout only if audio was generated
      await Promise.race([
        lipSyncMessage(i),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Lip sync timeout')), 3000))
      ]);
      
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    } catch (error) {
      console.error(`Error processing message ${i}:`, error);
      // Use fallback audio if generation fails
      message.audio = await audioFileToBase64("audios/intro_0.wav");
      message.lipsync = await readJsonTranscript("audios/intro_0.json");
    }
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
