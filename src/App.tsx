import React, { useState, useRef } from "react";
import TextToSpeechPlayer from "./TextToSpeechPlayer";

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" };
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } else {
        console.log(`${options.mimeType} is not supported on this browser.`);
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      mediaRecorderRef.current.start();
      const audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: options.mimeType });
        uploadAudio(audioBlob);
      };

      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing the microphone:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const uploadAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob);

      const response = await fetch("http://localhost:9001/transcription", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setTranscription(data.text);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <p>{transcription}</p>
      <TextToSpeechPlayer transcription={transcription} />
    </div>
  );
};

export default App;
