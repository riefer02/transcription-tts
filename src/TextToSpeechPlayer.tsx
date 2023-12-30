import React, { useState, useEffect } from "react";

const TextToSpeechPlayer = ({ transcription }) => {
  const [audioSrc, setAudioSrc] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchTTS = async () => {
      if (transcription) {
        try {
          const body = JSON.stringify({ text: transcription });
          const response = await fetch("http://localhost:9001/tts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          });

          if (!response.ok) {
            throw new Error(`Error from TTS API: ${response.statusText}`);
          }

          const audioBlob = await response.blob();
          if (active) {
            const objectURL = URL.createObjectURL(audioBlob);
            setAudioSrc((prevSrc) => {
              if (prevSrc) URL.revokeObjectURL(prevSrc);
              return objectURL;
            });
          }
        } catch (error) {
          console.error("TTS Fetch Error:", error);
        }
      }
    };

    fetchTTS();

    return () => {
      active = false;
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [transcription]);

  return (
    <div>
      {audioSrc && (
        <audio controls src={audioSrc}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default TextToSpeechPlayer;
