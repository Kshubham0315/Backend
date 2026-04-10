// import { exec } from "child_process";
// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import { promises as fs } from "fs";
// import Groq from "groq-sdk";

// dotenv.config();

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// const murfApiKey = process.env.MURF_API_KEY;

// // English voice settings
// const MURF_EN_VOICE_ID = process.env.MURF_EN_VOICE_ID || process.env.MURF_VOICE_ID || "Natalie";
// const MURF_EN_LOCALE = process.env.MURF_EN_LOCALE || process.env.MURF_LOCALE || "en-US";

// // Hindi voice settings
// const MURF_HI_VOICE_ID = process.env.MURF_HI_VOICE_ID || MURF_EN_VOICE_ID;
// const MURF_HI_LOCALE = process.env.MURF_HI_LOCALE || "hi-IN";

// const app = express();
// app.use(express.json({ limit: "10mb" }));
// app.use(cors());

// const port = process.env.PORT || 3125;

// const RHUBARB_PATH =
//   "C:\\Rhubarb\\Rhubarb-Lip-Sync-1.14.0-Windows\\rhubarb.exe";

// const FFMPEG_PATH =
//   "C:\\ffmpeg\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe";

// app.get("/", (req, res) => {
//   res.send("Virtual Doctor backend is running");
// });

// // Optional: list Murf voices
// app.get("/voices", async (req, res) => {
//   try {
//     if (!murfApiKey) {
//       return res.status(400).send({ error: "MURF_API_KEY is missing" });
//     }

//     const response = await fetch("https://api.murf.ai/v1/speech/voices", {
//       method: "GET",
//       headers: {
//         "api-key": murfApiKey,
//       },
//     });

//     if (!response.ok) {
//       const errText = await response.text();
//       throw new Error(`Murf voices error: ${response.status} - ${errText}`);
//     }

//     const voices = await response.json();
//     return res.send(voices);
//   } catch (error) {
//     console.error("Voices fetch error:", error);
//     return res.status(500).send({
//       error: "Failed to fetch Murf voices",
//       details: error.message,
//     });
//   }
// });

// const execCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error("Exec Error:", error);
//         console.error("stderr:", stderr);
//         reject(error);
//         return;
//       }

//       if (stderr) {
//         console.warn("Command stderr:", stderr);
//       }

//       resolve(stdout);
//     });
//   });
// };

// const ensureAudiosFolder = async () => {
//   try {
//     await fs.mkdir("audios", { recursive: true });
//   } catch (error) {
//     console.error("Error creating audios folder:", error);
//   }
// };

// const readJsonTranscript = async (file) => {
//   const data = await fs.readFile(file, "utf8");
//   return JSON.parse(data);
// };

// const audioFileToBase64 = async (file) => {
//   const data = await fs.readFile(file);
//   return data.toString("base64");
// };



// const downloadFile = async (url, outputFilePath) => {
//   const response = await fetch(url);

//   if (!response.ok) {
//     const errText = await response.text();
//     throw new Error(`Audio download failed: ${response.status} - ${errText}`);
//   }

//   const arrayBuffer = await response.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   await fs.writeFile(outputFilePath, buffer);
// };

// const generateMurfAudio = async (text, outputFilePath, audioConfig) => {
//   if (!murfApiKey) {
//     throw new Error("MURF_API_KEY is missing");
//   }

//   const response = await fetch("https://api.murf.ai/v1/speech/generate", {
//     method: "POST",
//     headers: {
//       "api-key": murfApiKey,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       text,
//       voiceId: audioConfig.voiceId,
//       locale: audioConfig.locale,
//       format: "MP3",
//       sampleRate: 44100,
//       channelType: "MONO",
//       encodeAsBase64: true,
//       modelVersion: "GEN2",
//       rate: 0,
//       pitch: 0,
//       variation: 1,
//     }),
//   });

//   if (!response.ok) {
//     const errText = await response.text();
//     throw new Error(`Murf TTS failed: ${response.status} - ${errText}`);
//   }

//   const data = await response.json();

//   if (data?.encodedAudio) {
//     const buffer = Buffer.from(data.encodedAudio, "base64");
//     await fs.writeFile(outputFilePath, buffer);
//     return;
//   }

//   if (data?.audioFile) {
//     await downloadFile(data.audioFile, outputFilePath);
//     return;
//   }

//   throw new Error("Murf response did not contain encodedAudio or audioFile");
// };

// const lipSyncMessage = async (messageIndex) => {
//   const time = Date.now();
//   console.log(`Starting conversion for message ${messageIndex}`);

//   const mp3Path = `audios/message_${messageIndex}.mp3`;
//   const wavPath = `audios/message_${messageIndex}.wav`;
//   const jsonPath = `audios/message_${messageIndex}.json`;

//   await execCommand(`"${FFMPEG_PATH}" -y -i "${mp3Path}" "${wavPath}"`);
//   console.log(`MP3 to WAV done in ${Date.now() - time}ms`);

//   await execCommand(
//     `"${RHUBARB_PATH}" -f json -o "${jsonPath}" "${wavPath}" -r phonetic`
//   );
//   console.log(`Lip sync done in ${Date.now() - time}ms`);
// };

// const sanitizeFacialExpression = (value) => {
//   const allowed = ["smile", "sad", "angry", "surprised", "funnyFace", "default"];
//   return allowed.includes(value) ? value : "default";
// };

// const sanitizeAnimation = (value) => {
//   const allowed = [
//     "Talking_0",
//     "Talking_1",
//     "Talking_2",
//     "Crying",
//     "Laughing",
//     "Rumba",
//     "Idle",
//     "Terrified",
//     "Angry",
//   ];
//   return allowed.includes(value) ? value : "Talking_1";
// };

// const containsDevanagari = (text = "") => {
//   return /[\u0900-\u097F]/.test(text);
// };

// const detectLanguageMode = (text = "") => {
//   const lower = text.toLowerCase().trim();

//   if (!lower) return "english";
//   if (containsDevanagari(lower)) return "hindi";

//   const hindiSignals = [
//     "mujhe", "mujhko", "mera", "meri", "mere", "hai", "ho raha", "ho rahi",
//     "bukhar", "dard", "sar", "pet", "gala", "khansi", "jukam", "zukaam",
//     "ulti", "matli", "tabiyat", "thik", "theek", "nahi", "haan", "kya",
//     "kaise", "kyun", "kab", "se", "dawai", "medicine lena", "bimar",
//     "jalan", "sujan", "kamjori", "kamzori", "saans", "sardi", "chakkar"
//   ];

//   let hindiScore = 0;
//   for (const word of hindiSignals) {
//     if (lower.includes(word)) hindiScore++;
//   }

//   return hindiScore > 0 ? "hindi" : "english";
// };

// const getLanguageInstruction = (languageMode) => {
//   if (languageMode === "hindi") {
//     return `
// Language Rule:
// - The user is speaking in Hindi or Hinglish.
// - Reply strictly in Hindi using Devanagari script.
// - Never reply in Hinglish.
// - Do not mix Hindi and English in the same message unless a medicine or medical term must remain in English.
// - Keep the Hindi natural, simple, and easy to speak aloud.
// `;
//   }

//   return `
// Language Rule:
// - The user is speaking in English.
// - Reply in simple English.
// - Do not switch to Hindi.
// `;
// };

// const getAudioConfigForLanguage = (languageMode) => {
//   if (languageMode === "hindi") {
//     return {
//       voiceId: MURF_HI_VOICE_ID,
//       locale: MURF_HI_LOCALE,
//     };
//   }

//   return {
//     voiceId: MURF_EN_VOICE_ID,
//     locale: MURF_EN_LOCALE,
//   };
// };

// const getFallbackText = (languageMode, type = "generic") => {
//   const hindi = languageMode === "hindi";

//   if (type === "welcome") {
//     return hindi
//       ? "नमस्ते, मैं आपका वर्चुअल डॉक्टर हूँ। कृपया अपने लक्षण बताइए या कोई मेडिकल इमेज अपलोड कीजिए।"
//       : "Hello, I am your virtual doctor. Please tell me your symptoms or upload a medical image.";
//   }

//   if (type === "missingKeys") {
//     return hindi
//       ? "कृपया अपनी environment settings में GROQ_API_KEY और MURF_API_KEY दोनों जोड़ें।"
//       : "Please add both GROQ_API_KEY and MURF_API_KEY in your environment settings.";
//   }

//   if (type === "parseError") {
//     return hindi
//       ? "माफ कीजिए, मैं आपकी मेडिकल जानकारी को सही तरह समझ नहीं पाया। कृपया अपने लक्षण सरल भाषा में फिर से लिखें।"
//       : "I am sorry, I could not understand the medical request properly. Please try again with symptoms in simple language.";
//   }

//   return hindi
//     ? "माफ कीजिए, मैं सही मेडिकल उत्तर तैयार नहीं कर पाया।"
//     : "I am sorry, I could not prepare a proper medical response.";
// };

// const normalizeMessages = (rawMessages, languageMode = "english") => {
//   let messages = rawMessages;

//   if (!Array.isArray(messages)) {
//     messages = [messages];
//   }

//   messages = messages
//     .filter(Boolean)
//     .map((msg) => ({
//       text:
//         typeof msg?.text === "string" && msg.text.trim()
//           ? msg.text.trim()
//           : getFallbackText(languageMode, "generic"),
//       facialExpression: sanitizeFacialExpression(msg?.facialExpression),
//       animation: sanitizeAnimation(msg?.animation),
//     }))
//     .slice(0, 3);

//   if (messages.length === 0) {
//     messages = [
//       {
//         text: getFallbackText(languageMode, "generic"),
//         facialExpression: "default",
//         animation: "Talking_1",
//       },
//     ];
//   }

//   return messages;
// };

// const buildUserPrompt = ({
//   userMessage,
//   hasMedicalImage,
//   imageContext,
//   languageMode,
// }) => {
//   const trimmedMessage =
//     typeof userMessage === "string" ? userMessage.trim() : "";

//   const trimmedImageContext =
//     typeof imageContext === "string" ? imageContext.trim() : "";

//   const languageInstruction = getLanguageInstruction(languageMode);

//   if (hasMedicalImage && !trimmedMessage) {
//     return `
// ${languageInstruction}

// The user uploaded a medical image but did not provide symptoms text.
// ${trimmedImageContext ? `Extra image context: ${trimmedImageContext}` : ""}

// Respond carefully in simple language.
// This is only a possible observation from limited information, not a confirmed diagnosis.
// Return the answer only in the required JSON format.
// `;
//   }

//   if (hasMedicalImage && trimmedMessage) {
//     return `
// ${languageInstruction}

// The user provided symptoms and also uploaded a medical image.

// Symptoms / user message:
// ${trimmedMessage}

// ${trimmedImageContext ? `Extra image context: ${trimmedImageContext}` : ""}

// Use both carefully, but do not claim certainty from the image alone.
// Return the answer only in the required JSON format.
// `;
//   }

//   return `
// ${languageInstruction}

// User message:
// ${trimmedMessage || "Hello"}

// Return the answer only in the required JSON format.
// `;
// };

// app.post("/chat", async (req, res) => {
//   try {
//     await ensureAudiosFolder();

//     const userMessage = req.body.message;
//     const hasMedicalImage = Boolean(req.body.hasMedicalImage);
//     const imageContext = req.body.imageContext || "";

//     const languageSource = [
//       typeof userMessage === "string" ? userMessage : "",
//       typeof imageContext === "string" ? imageContext : "",
//     ]
//       .filter(Boolean)
//       .join(" ");

//     const languageMode = detectLanguageMode(languageSource);
//     const audioConfig = getAudioConfigForLanguage(languageMode);

//     if (!userMessage && !hasMedicalImage) {
//       return res.send({
//         messages: [
//           {
//             text: getFallbackText(languageMode, "welcome"),
//             facialExpression: "smile",
//             animation: "Talking_1",
//             audio: null,
//             lipsync: { mouthCues: [] },
//           },
//         ],
//       });
//     }

//     if (!murfApiKey || !process.env.GROQ_API_KEY) {
//       return res.send({
//         messages: [
//           {
//             text: getFallbackText(languageMode, "missingKeys"),
//             facialExpression: "sad",
//             animation: "Talking_1",
//             audio: null,
//             lipsync: { mouthCues: [] },
//           },
//         ],
//       });
//     }

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       temperature: 0.5,
//       max_tokens: 1000,
//       messages: [
//         {
//           role: "system",
//           content: `
// You are an experienced virtual doctor for a 3D avatar medical assistant.

// Always reply ONLY in valid JSON.
// Do not write markdown.
// Do not write anything outside JSON.

// Output format:
// {
//   "messages": [
//     {
//       "text": "string",
//       "facialExpression": "smile | sad | angry | surprised | funnyFace | default",
//       "animation": "Talking_0 | Talking_1 | Talking_2 | Crying | Laughing | Rumba | Idle | Terrified | Angry"
//     }
//   ]
// }

// Rules:
// - Maximum 3 messages
// - Keep each message short, natural, and suitable for speech
// - Use simple, human-like medical language
// - No extra explanation outside JSON
// - No markdown
// - No additional keys

// Medical behavior:
// - You are an experienced medical doctor, but you must be careful and not overclaim
// - If the user gives symptoms, respond based on those symptoms
// - If the user uploaded only a medical image and no symptoms text, clearly say this is only a possible observation
// - Never claim certainty from image alone
// - Always recommend consulting a qualified doctor for proper diagnosis
// - Do not provide exact dosage
// - No dangerous or extreme advice

// The combined response across the messages should try to cover:
// 1. Possible Disease or Condition
// 2. Why It May Have Happened
// 3. How It Can Be Treated
// 4. Medicines Usually Given without exact dosage
// 5. Home Remedies
// 6. What Can Happen If Ignored

// Style guide:
// - Reassuring tone: use "smile" or "default"
// - Serious caution: use "sad" or "surprised"
// - Prefer talking animations: "Talking_0", "Talking_1", "Talking_2"
// - If the case sounds urgent, advise prompt medical attention

// Important language behavior:
// - Follow the user's language instruction given in the user message
// - If the user wrote in Hindi or Hinglish, reply strictly in Hindi using Devanagari script
// - Never reply in Hinglish
// - If the user wrote in English, reply in English
//           `,
//         },
//         {
//           role: "user",
//           content: buildUserPrompt({
//             userMessage,
//             hasMedicalImage,
//             imageContext,
//             languageMode,
//           }),
//         },
//       ],
//     });

//     const raw = completion.choices[0]?.message?.content || "";
//     console.log("Groq raw response:", raw);

//     let messages;

//     try {
//       const parsed = JSON.parse(raw);
//       messages = normalizeMessages(parsed?.messages || parsed, languageMode);
//     } catch (error) {
//       console.error("JSON parse error:", error);
//       messages = normalizeMessages(
//         [
//           {
//             text: raw || getFallbackText(languageMode, "parseError"),
//             facialExpression: "default",
//             animation: "Talking_1",
//           },
//         ],
//         languageMode
//       );
//     }

//     for (let i = 0; i < messages.length; i++) {
//       const message = messages[i];
//       const fileName = `audios/message_${i}.mp3`;
//       const textInput = message.text || (languageMode === "hindi" ? "नमस्ते" : "Hello");

//       console.log(
//         `Generating audio for message ${i} using ${audioConfig.locale}/${audioConfig.voiceId}: ${textInput}`
//       );

//       try {
//         await generateMurfAudio(textInput, fileName, audioConfig);
//         await lipSyncMessage(i);

//         message.audio = await audioFileToBase64(fileName);
//         message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
//       } catch (ttsError) {
//         console.error(`TTS/Lipsync failed for message ${i}:`, ttsError.message);
//         message.audio = null;
//         message.lipsync = { mouthCues: [] };
//       }
//     }

//     return res.send({ messages });
//   } catch (error) {
//     console.error("Chat route error:", error);
//     return res.status(500).send({
//       error: "Something went wrong in /chat",
//       details: error.message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Virtual Doctor backend listening on port ${port}`);
//   console.log(`Rhubarb path: ${RHUBARB_PATH}`);
//   console.log(`FFmpeg path: ${FFMPEG_PATH}`);
//   console.log(`Murf English voice: ${MURF_EN_VOICE_ID}`);
//   console.log(`Murf English locale: ${MURF_EN_LOCALE}`);
//   console.log(`Murf Hindi voice: ${MURF_HI_VOICE_ID}`);
//   console.log(`Murf Hindi locale: ${MURF_HI_LOCALE}`);
// });

// import { exec } from "child_process";
// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import { promises as fs } from "fs";
// import Groq from "groq-sdk";

// dotenv.config();

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// const murfApiKey = process.env.MURF_API_KEY;

// // English voice settings
// const MURF_EN_VOICE_ID = process.env.MURF_EN_VOICE_ID || process.env.MURF_VOICE_ID || "Natalie";
// const MURF_EN_LOCALE = process.env.MURF_EN_LOCALE || process.env.MURF_LOCALE || "en-US";

// // Hindi voice settings
// const MURF_HI_VOICE_ID = process.env.MURF_HI_VOICE_ID || MURF_EN_VOICE_ID;
// const MURF_HI_LOCALE = process.env.MURF_HI_LOCALE || "hi-IN";

// const app = express();
// app.use(express.json({ limit: "10mb" }));
// app.use(cors());

// const port = process.env.PORT || 3125;

// const RHUBARB_PATH =
//   "C:\\Rhubarb\\Rhubarb-Lip-Sync-1.14.0-Windows\\rhubarb.exe";

// const FFMPEG_PATH =
//   "C:\\ffmpeg\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe";

// app.get("/", (req, res) => {
//   res.send("Virtual Doctor backend is running");
// });

// // Optional: list Murf voices
// app.get("/voices", async (req, res) => {
//   try {
//     if (!murfApiKey) {
//       return res.status(400).send({ error: "MURF_API_KEY is missing" });
//     }

//     const response = await fetch("https://api.murf.ai/v1/speech/voices", {
//       method: "GET",
//       headers: {
//         "api-key": murfApiKey,
//       },
//     });

//     if (!response.ok) {
//       const errText = await response.text();
//       throw new Error(`Murf voices error: ${response.status} - ${errText}`);
//     }

//     const voices = await response.json();
//     return res.send(voices);
//   } catch (error) {
//     console.error("Voices fetch error:", error);
//     return res.status(500).send({
//       error: "Failed to fetch Murf voices",
//       details: error.message,
//     });
//   }
// });

// const execCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error("Exec Error:", error);
//         console.error("stderr:", stderr);
//         reject(error);
//         return;
//       }

//       if (stderr) {
//         console.warn("Command stderr:", stderr);
//       }

//       resolve(stdout);
//     });
//   });
// };

// const ensureAudiosFolder = async () => {
//   try {
//     await fs.mkdir("audios", { recursive: true });
//   } catch (error) {
//     console.error("Error creating audios folder:", error);
//   }
// };

// const readJsonTranscript = async (file) => {
//   const data = await fs.readFile(file, "utf8");
//   return JSON.parse(data);
// };

// const audioFileToBase64 = async (file) => {
//   const data = await fs.readFile(file);
//   return data.toString("base64");
// };


// const saveGroqText = async ({
//   rawResponse,
//   parsedMessages,
//   userMessage,
//   languageMode,
// }) => {
//   try {
//     await fs.mkdir("logs", { recursive: true });

//     const timestamp = Date.now();

//     const data = {
//       timestamp,
//       userMessage: userMessage || "",
//       languageMode,
//       rawGroqResponse: rawResponse || "",
//       parsedMessages: parsedMessages || [],
//     };

//     await fs.writeFile(
//       `logs/groq_response_${timestamp}.json`,
//       JSON.stringify(data, null, 2),
//       "utf8"
//     );
//   } catch (error) {
//     console.error("Error saving Groq text:", error.message);
//   }
// };


// const downloadFile = async (url, outputFilePath) => {
//   const response = await fetch(url);

//   if (!response.ok) {
//     const errText = await response.text();
//     throw new Error(`Audio download failed: ${response.status} - ${errText}`);
//   }

//   const arrayBuffer = await response.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   await fs.writeFile(outputFilePath, buffer);
// };

// const generateMurfAudio = async (text, outputFilePath, audioConfig) => {
//   if (!murfApiKey) {
//     throw new Error("MURF_API_KEY is missing");
//   }

//   const response = await fetch("https://api.murf.ai/v1/speech/generate", {
//     method: "POST",
//     headers: {
//       "api-key": murfApiKey,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       text,
//       voiceId: audioConfig.voiceId,
//       locale: audioConfig.locale,
//       format: "MP3",
//       sampleRate: 44100,
//       channelType: "MONO",
//       encodeAsBase64: true,
//       modelVersion: "GEN2",
//       rate: 0,
//       pitch: 0,
//       variation: 1,
//     }),
//   });

//   if (!response.ok) {
//     const errText = await response.text();
//     throw new Error(`Murf TTS failed: ${response.status} - ${errText}`);
//   }

//   const data = await response.json();

//   if (data?.encodedAudio) {
//     const buffer = Buffer.from(data.encodedAudio, "base64");
//     await fs.writeFile(outputFilePath, buffer);
//     return;
//   }

//   if (data?.audioFile) {
//     await downloadFile(data.audioFile, outputFilePath);
//     return;
//   }

//   throw new Error("Murf response did not contain encodedAudio or audioFile");
// };

// const lipSyncMessage = async (messageIndex) => {
//   const time = Date.now();
//   console.log(`Starting conversion for message ${messageIndex}`);

//   const mp3Path = `audios/message_${messageIndex}.mp3`;
//   const wavPath = `audios/message_${messageIndex}.wav`;
//   const jsonPath = `audios/message_${messageIndex}.json`;

//   await execCommand(`"${FFMPEG_PATH}" -y -i "${mp3Path}" "${wavPath}"`);
//   console.log(`MP3 to WAV done in ${Date.now() - time}ms`);

//   await execCommand(
//     `"${RHUBARB_PATH}" -f json -o "${jsonPath}" "${wavPath}" -r phonetic`
//   );
//   console.log(`Lip sync done in ${Date.now() - time}ms`);
// };

// const sanitizeFacialExpression = (value) => {
//   const allowed = ["smile", "sad", "angry", "surprised", "funnyFace", "default"];
//   return allowed.includes(value) ? value : "default";
// };

// const sanitizeAnimation = (value) => {
//   const allowed = [
//     "Talking_0",
//     "Talking_1",
//     "Talking_2",
//     "Crying",
//     "Laughing",
//     "Rumba",
//     "Idle",
//     "Terrified",
//     "Angry",
//   ];
//   return allowed.includes(value) ? value : "Talking_1";
// };

// const containsDevanagari = (text = "") => {
//   return /[\u0900-\u097F]/.test(text);
// };

// const detectLanguageMode = (text = "") => {
//   const lower = text.toLowerCase().trim();

//   if (!lower) return "english";
//   if (containsDevanagari(lower)) return "hindi";

//   const hindiSignals = [
//     "mujhe", "mujhko", "mera", "meri", "mere", "hai", "ho raha", "ho rahi",
//     "bukhar", "dard", "sar", "pet", "gala", "khansi", "jukam", "zukaam",
//     "ulti", "matli", "tabiyat", "thik", "theek", "nahi", "haan", "kya",
//     "kaise", "kyun", "kab", "se", "dawai", "medicine lena", "bimar",
//     "jalan", "sujan", "kamjori", "kamzori", "saans", "sardi", "chakkar"
//   ];

//   let hindiScore = 0;
//   for (const word of hindiSignals) {
//     if (lower.includes(word)) hindiScore++;
//   }

//   return hindiScore > 0 ? "hindi" : "english";
// };

// const getLanguageInstruction = (languageMode) => {
//   if (languageMode === "hindi") {
//     return `
// Language Rule:
// - The user is speaking in Hindi or Hinglish.
// - Reply strictly in Hindi using Devanagari script.
// - Never reply in Hinglish.
// - Do not mix Hindi and English in the same message unless a medicine or medical term must remain in English.
// - Keep the Hindi natural, simple, and easy to speak aloud.
// `;
//   }

//   return `
// Language Rule:
// - The user is speaking in English.
// - Reply in simple English.
// - Do not switch to Hindi.
// `;
// };

// const getAudioConfigForLanguage = (languageMode) => {
//   if (languageMode === "hindi") {
//     return {
//       voiceId: MURF_HI_VOICE_ID,
//       locale: MURF_HI_LOCALE,
//     };
//   }

//   return {
//     voiceId: MURF_EN_VOICE_ID,
//     locale: MURF_EN_LOCALE,
//   };
// };

// const getFallbackText = (languageMode, type = "generic") => {
//   const hindi = languageMode === "hindi";

//   if (type === "welcome") {
//     return hindi
//       ? "नमस्ते, मैं आपका वर्चुअल डॉक्टर हूँ। कृपया अपने लक्षण बताइए या कोई मेडिकल इमेज अपलोड कीजिए।"
//       : "Hello, I am your virtual doctor. Please tell me your symptoms or upload a medical image.";
//   }

//   if (type === "missingKeys") {
//     return hindi
//       ? "कृपया अपनी environment settings में GROQ_API_KEY और MURF_API_KEY दोनों जोड़ें।"
//       : "Please add both GROQ_API_KEY and MURF_API_KEY in your environment settings.";
//   }

//   if (type === "parseError") {
//     return hindi
//       ? "माफ कीजिए, मैं आपकी मेडिकल जानकारी को सही तरह समझ नहीं पाया। कृपया अपने लक्षण सरल भाषा में फिर से लिखें।"
//       : "I am sorry, I could not understand the medical request properly. Please try again with symptoms in simple language.";
//   }

//   return hindi
//     ? "माफ कीजिए, मैं सही मेडिकल उत्तर तैयार नहीं कर पाया।"
//     : "I am sorry, I could not prepare a proper medical response.";
// };

// const normalizeMessages = (rawMessages, languageMode = "english") => {
//   let messages = rawMessages;

//   if (!Array.isArray(messages)) {
//     messages = [messages];
//   }

//   messages = messages
//     .filter(Boolean)
//     .map((msg) => ({
//       text:
//         typeof msg?.text === "string" && msg.text.trim()
//           ? msg.text.trim()
//           : getFallbackText(languageMode, "generic"),
//       facialExpression: sanitizeFacialExpression(msg?.facialExpression),
//       animation: sanitizeAnimation(msg?.animation),
//     }))
//     .slice(0, 3);

//   if (messages.length === 0) {
//     messages = [
//       {
//         text: getFallbackText(languageMode, "generic"),
//         facialExpression: "default",
//         animation: "Talking_1",
//       },
//     ];
//   }

//   return messages;
// };

// const buildUserPrompt = ({
//   userMessage,
//   hasMedicalImage,
//   imageContext,
//   languageMode,
// }) => {
//   const trimmedMessage =
//     typeof userMessage === "string" ? userMessage.trim() : "";

//   const trimmedImageContext =
//     typeof imageContext === "string" ? imageContext.trim() : "";

//   const languageInstruction = getLanguageInstruction(languageMode);

//   if (hasMedicalImage && !trimmedMessage) {
//     return `
// ${languageInstruction}

// The user uploaded a medical image but did not provide symptoms text.
// ${trimmedImageContext ? `Extra image context: ${trimmedImageContext}` : ""}

// Respond carefully in simple language.
// This is only a possible observation from limited information, not a confirmed diagnosis.
// Return the answer only in the required JSON format.
// `;
//   }

//   if (hasMedicalImage && trimmedMessage) {
//     return `
// ${languageInstruction}

// The user provided symptoms and also uploaded a medical image.

// Symptoms / user message:
// ${trimmedMessage}

// ${trimmedImageContext ? `Extra image context: ${trimmedImageContext}` : ""}

// Use both carefully, but do not claim certainty from the image alone.
// Return the answer only in the required JSON format.
// `;
//   }

//   return `
// ${languageInstruction}

// User message:
// ${trimmedMessage || "Hello"}

// Return the answer only in the required JSON format.
// `;
// };

// app.post("/chat", async (req, res) => {
//   try {
//     await ensureAudiosFolder();

//     const userMessage = req.body.message;
//     const hasMedicalImage = Boolean(req.body.hasMedicalImage);
//     const imageContext = req.body.imageContext || "";

//     const languageSource = [
//       typeof userMessage === "string" ? userMessage : "",
//       typeof imageContext === "string" ? imageContext : "",
//     ]
//       .filter(Boolean)
//       .join(" ");

//     const languageMode = detectLanguageMode(languageSource);
//     const audioConfig = getAudioConfigForLanguage(languageMode);

//     if (!userMessage && !hasMedicalImage) {
//       return res.send({
//         messages: [
//           {
//             text: getFallbackText(languageMode, "welcome"),
//             facialExpression: "smile",
//             animation: "Talking_1",
//             audio: null,
//             lipsync: { mouthCues: [] },
//           },
//         ],
//       });
//     }

//     if (!murfApiKey || !process.env.GROQ_API_KEY) {
//       return res.send({
//         messages: [
//           {
//             text: getFallbackText(languageMode, "missingKeys"),
//             facialExpression: "sad",
//             animation: "Talking_1",
//             audio: null,
//             lipsync: { mouthCues: [] },
//           },
//         ],
//       });
//     }

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       temperature: 0.5,
//       max_tokens: 1000,
//       messages: [
//         {
//           role: "system",
//           content: `
// You are an experienced virtual doctor for a 3D avatar medical assistant.

// Always reply ONLY in valid JSON.
// Do not write markdown.
// Do not write anything outside JSON.

// Output format:
// {
//   "messages": [
//     {
//       "text": "string",
//       "facialExpression": "smile | sad | angry | surprised | funnyFace | default",
//       "animation": "Talking_0 | Talking_1 | Talking_2 | Crying | Laughing | Rumba | Idle | Terrified | Angry"
//     }
//   ]
// }

// Rules:
// - Maximum 3 messages
// - Keep each message short, natural, and suitable for speech
// - Use simple, human-like medical language
// - No extra explanation outside JSON
// - No markdown
// - No additional keys

// Medical behavior:
// - You are an experienced medical doctor, but you must be careful and not overclaim
// - If the user gives symptoms, respond based on those symptoms
// - If the user uploaded only a medical image and no symptoms text, clearly say this is only a possible observation
// - Never claim certainty from image alone
// - Always recommend consulting a qualified doctor for proper diagnosis
// - Do not provide exact dosage
// - No dangerous or extreme advice

// The combined response across the messages should try to cover:
// 1. Possible Disease or Condition
// 2. Why It May Have Happened
// 3. How It Can Be Treated
// 4. Medicines Usually Given without exact dosage
// 5. Home Remedies
// 6. What Can Happen If Ignored

// Style guide:
// - Reassuring tone: use "smile" or "default"
// - Serious caution: use "sad" or "surprised"
// - Prefer talking animations: "Talking_0", "Talking_1", "Talking_2"
// - If the case sounds urgent, advise prompt medical attention

// Important language behavior:
// - Follow the user's language instruction given in the user message
// - If the user wrote in Hindi or Hinglish, reply strictly in Hindi using Devanagari script
// - Never reply in Hinglish
// - If the user wrote in English, reply in English
//           `,
//         },
//         {
//           role: "user",
//           content: buildUserPrompt({
//             userMessage,
//             hasMedicalImage,
//             imageContext,
//             languageMode,
//           }),
//         },
//       ],
//     });

//     const raw = completion.choices[0]?.message?.content || "";
//     console.log("Groq raw response:", raw);

//     let messages;

//     try {
//       const parsed = JSON.parse(raw);
//       messages = normalizeMessages(parsed?.messages || parsed, languageMode);
//     } catch (error) {
//       console.error("JSON parse error:", error);
//       messages = normalizeMessages(
//         [
//           {
//             text: raw || getFallbackText(languageMode, "parseError"),
//             facialExpression: "default",
//             animation: "Talking_1",
//           },
//         ],
//         languageMode
//       );
//     }

//     for (let i = 0; i < messages.length; i++) {
//       const message = messages[i];
//       const fileName = `audios/message_${i}.mp3`;
//       const textInput = message.text || (languageMode === "hindi" ? "नमस्ते" : "Hello");

//       console.log(
//         `Generating audio for message ${i} using ${audioConfig.locale}/${audioConfig.voiceId}: ${textInput}`
//       );

//       try {
//         await generateMurfAudio(textInput, fileName, audioConfig);
//         await lipSyncMessage(i);

//         message.audio = await audioFileToBase64(fileName);
//         message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
//       } catch (ttsError) {
//         console.error(`TTS/Lipsync failed for message ${i}:`, ttsError.message);
//         message.audio = null;
//         message.lipsync = { mouthCues: [] };
//       }
//     }

//     return res.send({ messages });
//   } catch (error) {
//     console.error("Chat route error:", error);
//     return res.status(500).send({
//       error: "Something went wrong in /chat",
//       details: error.message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Virtual Doctor backend listening on port ${port}`);
//   console.log(`Rhubarb path: ${RHUBARB_PATH}`);
//   console.log(`FFmpeg path: ${FFMPEG_PATH}`);
//   console.log(`Murf English voice: ${MURF_EN_VOICE_ID}`);
//   console.log(`Murf English locale: ${MURF_EN_LOCALE}`);
//   console.log(`Murf Hindi voice: ${MURF_HI_VOICE_ID}`);
//   console.log(`Murf Hindi locale: ${MURF_HI_LOCALE}`);
// });


import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import path from "path";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const murfApiKey = process.env.MURF_API_KEY;

// English voice settings
const MURF_EN_VOICE_ID =
  process.env.MURF_EN_VOICE_ID ||
  process.env.MURF_VOICE_ID ||
  "Natalie";
const MURF_EN_LOCALE =
  process.env.MURF_EN_LOCALE ||
  process.env.MURF_LOCALE ||
  "en-US";

// Hindi voice settings
const MURF_HI_VOICE_ID = process.env.MURF_HI_VOICE_ID || MURF_EN_VOICE_ID;
const MURF_HI_LOCALE = process.env.MURF_HI_LOCALE || "hi-IN";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

const port = process.env.PORT || 3125;

const RHUBARB_PATH =
  "C:\\Rhubarb\\Rhubarb-Lip-Sync-1.14.0-Windows\\rhubarb.exe";

const FFMPEG_PATH =
  "C:\\ffmpeg\\ffmpeg-8.1-essentials_build\\bin\\ffmpeg.exe";

app.get("/", (req, res) => {
  res.send("Virtual Doctor backend is running");
});

// Optional: list Murf voices
app.get("/voices", async (req, res) => {
  try {
    if (!murfApiKey) {
      return res.status(400).send({ error: "MURF_API_KEY is missing" });
    }

    const response = await fetch("https://api.murf.ai/v1/speech/voices", {
      method: "GET",
      headers: {
        "api-key": murfApiKey,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Murf voices error: ${response.status} - ${errText}`);
    }

    const voices = await response.json();
    return res.send(voices);
  } catch (error) {
    console.error("Voices fetch error:", error);
    return res.status(500).send({
      error: "Failed to fetch Murf voices",
      details: error.message,
    });
  }
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Exec Error:", error);
        console.error("stderr:", stderr);
        reject(error);
        return;
      }

      if (stderr) {
        console.warn("Command stderr:", stderr);
      }

      resolve(stdout);
    });
  });
};

const ensureFolder = async (folderPath) => {
  try {
    await fs.mkdir(folderPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating folder ${folderPath}:`, error);
  }
};

const ensureRequiredFolders = async () => {
  await ensureFolder("audios");
  await ensureFolder("logs");
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

const downloadFile = async (url, outputFilePath) => {
  const response = await fetch(url);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Audio download failed: ${response.status} - ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(outputFilePath, buffer);
};

const generateMurfAudio = async (text, outputFilePath, audioConfig) => {
  if (!murfApiKey) {
    throw new Error("MURF_API_KEY is missing");
  }

  const response = await fetch("https://api.murf.ai/v1/speech/generate", {
    method: "POST",
    headers: {
      "api-key": murfApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voiceId: audioConfig.voiceId,
      locale: audioConfig.locale,
      format: "MP3",
      sampleRate: 44100,
      channelType: "MONO",
      encodeAsBase64: true,
      modelVersion: "GEN2",
      rate: 0,
      pitch: 0,
      variation: 1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Murf TTS failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();

  if (data?.encodedAudio) {
    const buffer = Buffer.from(data.encodedAudio, "base64");
    await fs.writeFile(outputFilePath, buffer);
    return;
  }

  if (data?.audioFile) {
    await downloadFile(data.audioFile, outputFilePath);
    return;
  }

  throw new Error("Murf response did not contain encodedAudio or audioFile");
};

const lipSyncMessage = async (messageIndex, requestFolderPath) => {
  const time = Date.now();
  console.log(`Starting conversion for message ${messageIndex}`);

  const mp3Path = path.join(requestFolderPath, `message_${messageIndex}.mp3`);
  const wavPath = path.join(requestFolderPath, `message_${messageIndex}.wav`);
  const jsonPath = path.join(requestFolderPath, `message_${messageIndex}.json`);

  await execCommand(`"${FFMPEG_PATH}" -y -i "${mp3Path}" "${wavPath}"`);
  console.log(`MP3 to WAV done in ${Date.now() - time}ms`);

  await execCommand(
    `"${RHUBARB_PATH}" -f json -o "${jsonPath}" "${wavPath}" -r phonetic`
  );
  console.log(`Lip sync done in ${Date.now() - time}ms`);
};

const sanitizeFacialExpression = (value) => {
  const allowed = [
    "smile",
    "sad",
    "angry",
    "surprised",
    "funnyFace",
    "default",
  ];
  return allowed.includes(value) ? value : "default";
};

const sanitizeAnimation = (value) => {
  const allowed = [
    "Talking_0",
    "Talking_1",
    "Talking_2",
    "Crying",
    "Laughing",
    "Rumba",
    "Idle",
    "Terrified",
    "Angry",
  ];
  return allowed.includes(value) ? value : "Talking_1";
};

const containsDevanagari = (text = "") => {
  return /[\u0900-\u097F]/.test(text);
};

const detectLanguageMode = (text = "") => {
  const lower = text.toLowerCase().trim();

  if (!lower) return "english";
  if (containsDevanagari(lower)) return "hindi";

  const hindiSignals = [
    "mujhe",
    "mujhko",
    "mera",
    "meri",
    "mere",
    "hai",
    "ho raha",
    "ho rahi",
    "bukhar",
    "dard",
    "sar",
    "pet",
    "gala",
    "khansi",
    "jukam",
    "zukaam",
    "ulti",
    "matli",
    "tabiyat",
    "thik",
    "theek",
    "nahi",
    "haan",
    "kya",
    "kaise",
    "kyun",
    "kab",
    "se",
    "dawai",
    "medicine lena",
    "bimar",
    "jalan",
    "sujan",
    "kamjori",
    "kamzori",
    "saans",
    "sardi",
    "chakkar",
  ];

  let hindiScore = 0;
  for (const word of hindiSignals) {
    if (lower.includes(word)) hindiScore++;
  }

  return hindiScore > 0 ? "hindi" : "english";
};

const getLanguageInstruction = (languageMode) => {
  if (languageMode === "hindi") {
    return `
Language Rule:
- The user is speaking in Hindi or Hinglish.
- Reply strictly in Hindi using Devanagari script.
- Never reply in Hinglish.
- Do not mix Hindi and English in the same message unless a medicine or medical term must remain in English.
- Keep the Hindi natural, simple, and easy to speak aloud.
`;
  }

  return `
Language Rule:
- The user is speaking in English.
- Reply in simple English.
- Do not switch to Hindi.
`;
};

const getAudioConfigForLanguage = (languageMode) => {
  if (languageMode === "hindi") {
    return {
      voiceId: MURF_HI_VOICE_ID,
      locale: MURF_HI_LOCALE,
    };
  }

  return {
    voiceId: MURF_EN_VOICE_ID,
    locale: MURF_EN_LOCALE,
  };
};

const getFallbackText = (languageMode, type = "generic") => {
  const hindi = languageMode === "hindi";

  if (type === "welcome") {
    return hindi
      ? "नमस्ते, मैं आपका वर्चुअल डॉक्टर हूँ। कृपया अपने लक्षण बताइए या कोई मेडिकल इमेज अपलोड कीजिए।"
      : "Hello, I am your virtual doctor. Please tell me your symptoms or upload a medical image.";
  }

  if (type === "missingKeys") {
    return hindi
      ? "कृपया अपनी environment settings में GROQ_API_KEY और MURF_API_KEY दोनों जोड़ें।"
      : "Please add both GROQ_API_KEY and MURF_API_KEY in your environment settings.";
  }

  if (type === "parseError") {
    return hindi
      ? "माफ कीजिए, मैं आपकी मेडिकल जानकारी को सही तरह समझ नहीं पाया। कृपया अपने लक्षण सरल भाषा में फिर से लिखें।"
      : "I am sorry, I could not understand the medical request properly. Please try again with symptoms in simple language.";
  }

  return hindi
    ? "माफ कीजिए, मैं सही मेडिकल उत्तर तैयार नहीं कर पाया।"
    : "I am sorry, I could not prepare a proper medical response.";
};

const normalizeMessages = (rawMessages, languageMode = "english") => {
  let messages = rawMessages;

  if (!Array.isArray(messages)) {
    messages = [messages];
  }

  messages = messages
    .filter(Boolean)
    .map((msg) => ({
      text:
        typeof msg?.text === "string" && msg.text.trim()
          ? msg.text.trim()
          : getFallbackText(languageMode, "generic"),
      facialExpression: sanitizeFacialExpression(msg?.facialExpression),
      animation: sanitizeAnimation(msg?.animation),
    }))
    .slice(0, 3);

  if (messages.length === 0) {
    messages = [
      {
        text: getFallbackText(languageMode, "generic"),
        facialExpression: "default",
        animation: "Talking_1",
      },
    ];
  }

  return messages;
};

const buildUserPrompt = ({
  userMessage,
  hasMedicalImage,
  imageContext,
  languageMode,
}) => {
  const trimmedMessage =
    typeof userMessage === "string" ? userMessage.trim() : "";

  const trimmedImageContext =
    typeof imageContext === "string" ? imageContext.trim() : "";

  const languageInstruction = getLanguageInstruction(languageMode);

  if (hasMedicalImage && !trimmedMessage) {
    return `
${languageInstruction}

The user uploaded a medical image but did not provide symptoms text.
${trimmedImageContext ? `Extra image context: ${trimmedImageContext}` : ""}

Respond carefully in simple language.
This is only a possible observation from limited information, not a confirmed diagnosis.
Return the answer only in the required JSON format.
`;
  }

  if (hasMedicalImage && trimmedMessage) {
    return `
${languageInstruction}

The user provided symptoms and also uploaded a medical image.

Symptoms / user message:
${trimmedMessage}

${trimmedImageContext ? `Extra image context: ${trimmedImageContext}` : ""}

Use both carefully, but do not claim certainty from the image alone.
Return the answer only in the required JSON format.
`;
  }

  return `
${languageInstruction}

User message:
${trimmedMessage || "Hello"}

Return the answer only in the required JSON format.
`;
};

const createRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const saveJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const saveTextFile = async (filePath, text) => {
  await fs.writeFile(filePath, text, "utf8");
};

const saveGroqAndChatLogs = async ({
  requestId,
  requestFolderPath,
  userMessage,
  hasMedicalImage,
  imageContext,
  languageMode,
  rawGroqResponse,
  parsedMessages,
}) => {
  try {
    const payload = {
      requestId,
      createdAt: new Date().toISOString(),
      userMessage: userMessage || "",
      hasMedicalImage: Boolean(hasMedicalImage),
      imageContext: imageContext || "",
      languageMode,
      rawGroqResponse: rawGroqResponse || "",
      parsedMessages: parsedMessages || [],
    };

    await saveJsonFile(
      path.join(requestFolderPath, "groq_full_response.json"),
      payload
    );

    await saveTextFile(
      path.join(requestFolderPath, "groq_raw_response.txt"),
      rawGroqResponse || ""
    );

    const onlyTexts = (parsedMessages || []).map((msg, index) => ({
      index,
      text: msg?.text || "",
    }));

    await saveJsonFile(
      path.join(requestFolderPath, "assistant_texts.json"),
      onlyTexts
    );
  } catch (error) {
    console.error("Error saving Groq/chat logs:", error.message);
  }
};

///////////////////////
app.get("/chat-test", (req, res) => {
  res.send({
    status: "Chat route working",
    message: "Backend is ready for POST /chat"
  });
});
///////////////////////


app.post("/chat", async (req, res) => {
  try {
    await ensureRequiredFolders();

    const requestId = createRequestId();
    const requestFolderPath = path.join("logs", requestId);
    await ensureFolder(requestFolderPath);

    const userMessage = req.body.message;
    const hasMedicalImage = Boolean(req.body.hasMedicalImage);
    const imageContext = req.body.imageContext || "";

    const languageSource = [
      typeof userMessage === "string" ? userMessage : "",
      typeof imageContext === "string" ? imageContext : "",
    ]
      .filter(Boolean)
      .join(" ");

    const languageMode = detectLanguageMode(languageSource);
    const audioConfig = getAudioConfigForLanguage(languageMode);

    await saveJsonFile(path.join(requestFolderPath, "request_payload.json"), {
      requestId,
      createdAt: new Date().toISOString(),
      body: req.body,
      detectedLanguageMode: languageMode,
      audioConfig,
    });

    if (!userMessage && !hasMedicalImage) {
      const messages = [
        {
          text: getFallbackText(languageMode, "welcome"),
          facialExpression: "smile",
          animation: "Talking_1",
          audio: null,
          lipsync: { mouthCues: [] },
        },
      ];

      await saveGroqAndChatLogs({
        requestId,
        requestFolderPath,
        userMessage,
        hasMedicalImage,
        imageContext,
        languageMode,
        rawGroqResponse: "",
        parsedMessages: messages,
      });

      return res.send({ messages, requestId });
    }

    if (!murfApiKey || !process.env.GROQ_API_KEY) {
      const messages = [
        {
          text: getFallbackText(languageMode, "missingKeys"),
          facialExpression: "sad",
          animation: "Talking_1",
          audio: null,
          lipsync: { mouthCues: [] },
        },
      ];

      await saveGroqAndChatLogs({
        requestId,
        requestFolderPath,
        userMessage,
        hasMedicalImage,
        imageContext,
        languageMode,
        rawGroqResponse: "",
        parsedMessages: messages,
      });

      return res.send({ messages, requestId });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `
You are an experienced virtual doctor for a 3D avatar medical assistant.

Always reply ONLY in valid JSON.
Do not write markdown.
Do not write anything outside JSON.

Output format:
{
  "messages": [
    {
      "text": "string",
      "facialExpression": "smile | sad | angry | surprised | funnyFace | default",
      "animation": "Talking_0 | Talking_1 | Talking_2 | Crying | Laughing | Rumba | Idle | Terrified | Angry"
    }
  ]
}

Rules:
- Maximum 3 messages
- Keep each message short, natural, and suitable for speech
- Use simple, human-like medical language
- No extra explanation outside JSON
- No markdown
- No additional keys

Medical behavior:
- You are an experienced medical doctor, but you must be careful and not overclaim
- If the user gives symptoms, respond based on those symptoms
- If the user uploaded only a medical image and no symptoms text, clearly say this is only a possible observation
- Never claim certainty from image alone
- Always recommend consulting a qualified doctor for proper diagnosis
- Do not provide exact dosage
- No dangerous or extreme advice

The combined response across the messages should try to cover:
1. Possible Disease or Condition
2. Why It May Have Happened
3. How It Can Be Treated
4. Medicines Usually Given without exact dosage
5. Home Remedies
6. What Can Happen If Ignored

Style guide:
- Reassuring tone: use "smile" or "default"
- Serious caution: use "sad" or "surprised"
- Prefer talking animations: "Talking_0", "Talking_1", "Talking_2"
- If the case sounds urgent, advise prompt medical attention

Important language behavior:
- Follow the user's language instruction given in the user message
- If the user wrote in Hindi or Hinglish, reply strictly in Hindi using Devanagari script
- Never reply in Hinglish
- If the user wrote in English, reply in English
          `,
        },
        {
          role: "user",
          content: buildUserPrompt({
            userMessage,
            hasMedicalImage,
            imageContext,
            languageMode,
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";
    console.log("Groq raw response:", raw);

    let messages;

    try {
      const parsed = JSON.parse(raw);
      messages = normalizeMessages(parsed?.messages || parsed, languageMode);
    } catch (error) {
      console.error("JSON parse error:", error);
      messages = normalizeMessages(
        [
          {
            text: raw || getFallbackText(languageMode, "parseError"),
            facialExpression: "default",
            animation: "Talking_1",
          },
        ],
        languageMode
      );
    }

    await saveGroqAndChatLogs({
      requestId,
      requestFolderPath,
      userMessage,
      hasMedicalImage,
      imageContext,
      languageMode,
      rawGroqResponse: raw,
      parsedMessages: messages,
    });

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const textInput =
        message.text || (languageMode === "hindi" ? "नमस्ते" : "Hello");

      const mp3FilePath = path.join(requestFolderPath, `message_${i}.mp3`);
      const lipSyncJsonPath = path.join(requestFolderPath, `message_${i}.json`);
      const exactTextFilePath = path.join(
        requestFolderPath,
        `message_${i}_text.txt`
      );

      await saveTextFile(exactTextFilePath, textInput);

      console.log(
        `Generating audio for message ${i} using ${audioConfig.locale}/${audioConfig.voiceId}: ${textInput}`
      );

      try {
        await generateMurfAudio(textInput, mp3FilePath, audioConfig);
        await lipSyncMessage(i, requestFolderPath);

        message.audio = await audioFileToBase64(mp3FilePath);
        message.lipsync = await readJsonTranscript(lipSyncJsonPath);
      } catch (ttsError) {
        console.error(
          `TTS/Lipsync failed for message ${i}:`,
          ttsError.message
        );
        message.audio = null;
        message.lipsync = { mouthCues: [] };
      }
    }

    await saveJsonFile(path.join(requestFolderPath, "final_response.json"), {
      requestId,
      createdAt: new Date().toISOString(),
      messages,
    });

    return res.send({ messages, requestId });
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).send({
      error: "Something went wrong in /chat",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Virtual Doctor backend listening on port ${port}`);
  console.log(`Rhubarb path: ${RHUBARB_PATH}`);
  console.log(`FFmpeg path: ${FFMPEG_PATH}`);
  console.log(`Murf English voice: ${MURF_EN_VOICE_ID}`);
  console.log(`Murf English locale: ${MURF_EN_LOCALE}`);
  console.log(`Murf Hindi voice: ${MURF_HI_VOICE_ID}`);
  console.log(`Murf Hindi locale: ${MURF_HI_LOCALE}`);
});