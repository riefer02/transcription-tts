import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
const router = new Router();
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

router.post("/transcription", async (context) => {
  const request = context.request;
  if (request.hasBody) {
    const body = request.body({ type: "form-data" }); // Specify the body type
    const formData = await body.value.read({ maxSize: 10000000 });

    if (formData.files && formData.files.length > 0) {
      const audioFile = formData.files[0];

      if (audioFile.content) {
        const whispersFormData = new FormData();
        const blob = new Blob([audioFile.content], {
          type: audioFile.contentType,
        });
        whispersFormData.append("file", blob, "audio.webm");
        whispersFormData.append("model", "whisper-1");

        try {
          const whispersResponse = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
              },
              body: whispersFormData,
            }
          );

          if (!whispersResponse.ok) {
            const errorText = await whispersResponse.text();
            throw new Error(`Whispers API error: ${errorText}`);
          }

          const transcriptionResult = await whispersResponse.json();
          console.log({ transcriptionResult });
          context.response.status = 200;
          context.response.type = "json";
          context.response.body = transcriptionResult;
        } catch (error) {
          console.error("Error contacting Whispers API:", error);
          context.response.status = 500;
          context.response.body = { error: "Failed to process audio" };
        }
      } else {
        console.log("No content in the audio file");
        context.response.status = 400;
        context.response.body = { error: "No content in the audio file" };
      }
    } else {
      console.log("No files found in the request");
      context.response.status = 400;
      context.response.body = { error: "No files found in the request" };
    }
  } else {
    context.response.status = 400;
    context.response.body = { error: "No body found" };
  }
});

router.post("/tts", async (context) => {
  try {
    const request = context.request;
    if (request.hasBody) {
      const body = await request.body().value;

      const ttsResponse = await fetch(
        "https://api.openai.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1-hd",
            input: body.text,
            voice: "onyx",
          }),
        }
      );

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        throw new Error(`Text-to-Speech API error: ${errorText}`);
      }

      const audioData = await ttsResponse.arrayBuffer();

      context.response.status = 200;
      context.response.body = audioData;
      context.response.headers.set("Content-Type", "audio/mpeg");
    } else {
      context.response.status = 400;
      context.response.body = { error: "No text provided for TTS" };
    }
  } catch (error) {
    console.error("Error in TTS processing:", error);
    context.response.status = 500;
    context.response.body = { error: "Failed to process text-to-speech" };
  }
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:9001");
await app.listen({ port: 9001 });
