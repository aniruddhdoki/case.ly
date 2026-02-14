'use client';

import { useCallback, useRef, useState } from 'react';

export function useLocalRecording() {
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = useCallback((stream: MediaStream) => {
    setRecordedChunks([]);
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    mediaRecorderRef.current = recorder;
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        console.log('[Frontend Recording] Data available, size:', e.data.size);
        chunks.push(e.data);
      }
    };
    recorder.onstop = () => {
      console.log('[Frontend Recording] Stopped; total chunks:', chunks.length);
      setRecordedChunks(chunks);
      setIsRecording(false);
    };
    recorder.start(500);
    setIsRecording(true);
    console.log('[Frontend Recording] Started');
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  const getDownloadUrl = useCallback((): string | null => {
    if (recordedChunks.length === 0) return null;
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    return URL.createObjectURL(blob);
  }, [recordedChunks]);

  const clearRecording = useCallback(() => {
    setRecordedChunks([]);
  }, []);

  return {
    recordedChunks,
    startRecording,
    stopRecording,
    getDownloadUrl,
    clearRecording,
    isRecording,
  };
}
