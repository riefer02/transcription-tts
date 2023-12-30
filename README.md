# Speech to Text, Text to Speech

This is a prototype that utilizes the Whispers APIs and other OpenAI endpoints to record a user's voice from the browser. It then converts it into an audio binary, transcribes it to text, and upon receiving the transcription, sends it to the Text-to-Speech endpoint. Essentially, you get a cool recording of yourself but spoken in a different voice. Save it and enjoy!

## Getting Started

From the project directory:

### Start Server

Run the server with the following command:

```bash
deno run -A server.ts
```

### Start Client

Set up and start the client using these commands:

```bash
npm install
npm run dev
```

### Deno Environments

Configure the environment variable for OpenAI:

```env
OPENAI_API_KEY=xyz
```
