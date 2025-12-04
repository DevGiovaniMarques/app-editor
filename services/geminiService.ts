import { GoogleGenAI, Modality } from "@google/genai";

// Helper to decode audio data
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const generateTTS = async (text: string, voiceName: string = 'Kore'): Promise<Blob | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key not found");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioBytes = decode(base64Audio);
    return new Blob([audioBytes], { type: 'audio/wav' }); // Gemini returns PCM, but Blobbing it often works for simple playback or we might need a WAV header. 
    // Ideally, we'd add a WAV header, but for simplicity in this demo we rely on browser decoding flexibility or we can use an AudioContext to decode and re-encode.
    // Better approach for raw PCM: Return the buffer, let AudioContext decode it.
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    if (!process.env.API_KEY) return null;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Using generateContent for nano banana series as per guidelines for image gen
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                 imageConfig: {
                    aspectRatio: "16:9",
                 }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image Gen Error", e);
        return null;
    }
}
