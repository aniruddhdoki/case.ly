/**
 * Agent: STT transcript + conversation history -> LLM -> TTS. Streams audio to client.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SYSTEM_PROMPT =
  'You are an interview coach. Respond concisely and naturally. One or two short sentences per turn.';

export async function runAgent({
  conversationHistory,
  userTranscript,
  sendAudioChunk,
  sendViseme,
  sendEnd,
  generateRandomVisemeSequence,
}) {
  console.log('[Agent] --- Step 1: Agent started ---');
  console.log('[Agent] User transcript:', userTranscript || '(empty)');
  console.log('[Agent] History length:', conversationHistory?.length ?? 0);
  console.log('[Agent] OPENAI_API_KEY present:', !!OPENAI_API_KEY);

  const text = OPENAI_API_KEY
    ? await getLLMResponse(conversationHistory, userTranscript)
    : 'Hello. This is a test response from the interview platform.';

  console.log('[Agent] Response to speak:', text);

  if (OPENAI_API_KEY) {
    await streamTTS(text, sendAudioChunk, sendViseme, sendEnd, generateRandomVisemeSequence);
  } else {
    await sendTestResponse(sendViseme, sendEnd, generateRandomVisemeSequence);
  }
}

async function getLLMResponse(conversationHistory, userTranscript) {
  if (!OPENAI_API_KEY) return 'Test response.';

  console.log('[Agent] --- Step 2: Response generation (LLM) ---');
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(conversationHistory || []),
    { role: 'user', content: userTranscript?.trim() || '(no speech detected)' },
  ];
  console.log('[Agent] LLM request: messages count=', messages.length);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 150,
  });
  const responseText = completion.choices[0]?.message?.content?.trim() || 'Okay.';
  console.log('[Agent] LLM output:', responseText);

  conversationHistory.push({ role: 'user', content: userTranscript?.trim() || '(no speech detected)' });
  conversationHistory.push({ role: 'assistant', content: responseText });

  return responseText;
}

async function streamTTS(text, sendAudioChunk, sendViseme, sendEnd, generateRandomVisemeSequence) {
  if (!OPENAI_API_KEY) {
    sendEnd();
    return;
  }

  console.log('[Agent] --- Step 3: Text-to-speech (TTS) ---');
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  let response;
  try {
    response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      response_format: 'mp3',
      speed: 1,
    });
  } catch (e) {
    console.error('[Agent] TTS request failed:', e.message);
    sendEnd();
    return;
  }

  try {
    const buffer = await response.arrayBuffer();
    const arr = new Uint8Array(buffer);
    console.log('[Agent] TTS: sent', arr.byteLength, 'bytes to client');
    sendAudioChunk(arr);
  } catch (e) {
    console.error('[Agent] TTS read failed:', e.message);
    sendEnd();
    return;
  }

  const estimatedDurationMs = 1500;
  const visemes = generateRandomVisemeSequence(estimatedDurationMs, 80);
  for (const v of visemes) {
    sendViseme(v.time, v.value);
  }
  sendEnd();
}

async function sendTestResponse(sendViseme, sendEnd, generateRandomVisemeSequence) {
  const durationMs = 2000;
  const visemes = generateRandomVisemeSequence(durationMs, 80);
  for (const v of visemes) {
    sendViseme(v.time, v.value);
  }
  sendEnd();
}
