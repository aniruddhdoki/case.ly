/**
 * Speech-to-text: build WAV from PCM chunks and call OpenAI Whisper.
 */

const DEFAULT_SAMPLE_RATE = 48000;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

function createWavBuffer(chunks, sampleRate = DEFAULT_SAMPLE_RATE) {
  let totalBytes = 0;
  for (const c of chunks) {
    const d = c.data ?? c;
    const len = Buffer.isBuffer(d) ? d.length : (d?.byteLength ?? 0);
    if (!len) continue;
    totalBytes += len;
  }
  if (totalBytes === 0) return null;

  const header = Buffer.alloc(44);
  const dataLength = totalBytes;
  const byteRate = sampleRate * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(NUM_CHANNELS, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  const out = Buffer.alloc(44 + dataLength);
  header.copy(out, 0);
  let offset = 44;
  for (const c of chunks) {
    const d = c.data ?? c;
    const buf = Buffer.isBuffer(d) ? d : Buffer.from(d);
    buf.copy(out, offset);
    offset += buf.length;
  }
  return out;
}

export async function runSTT(utteranceChunks, sampleRate = DEFAULT_SAMPLE_RATE) {
  if (!utteranceChunks?.length) {
    console.log('[STT] No audio chunks');
    return '';
  }
  const wav = createWavBuffer(utteranceChunks, sampleRate);
  if (!wav || wav.length <= 44) {
    console.log('[STT] WAV too short');
    return '';
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('[STT] No OPENAI_API_KEY, skipping');
    return '';
  }
  try {
    const openaiModule = await import('openai');
    const OpenAI = openaiModule.default;
    const openai = new OpenAI({ apiKey });
    const file = await openaiModule.toFile(wav, 'audio.wav', { type: 'audio/wav' });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });
    const text = (transcription?.text ?? '').trim();
    console.log('[STT] Transcript:', text || '(empty)');
    return text;
  } catch (e) {
    console.error('[STT] Whisper failed:', e.message);
    return '';
  }
}
