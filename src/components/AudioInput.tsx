"use client";

import React, { useCallback, useState, useRef } from 'react';
import styles from '@/ui/styles/FeedbackForm.module.css';

interface AudioInputProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

export const AudioInput: React.FC<AudioInputProps> = ({ onFileSelect, file }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
    const audioFile = e.dataTransfer.files[0]
    if (!acceptedTypes.includes(audioFile.type)) {
      alert("not allowed file type")
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const fileUrl = file ? URL.createObjectURL(file) : null;
  return (
    <div
      className={`${styles.audioInputContainer} ${dragActive ? styles.dragActive : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav"
        onChange={handleChange}
        className={styles.fileInput}
      />

      {file ? (
        <div className={styles.audioPreview}>
          <p>Selected File: <strong className={styles.textWrapper}>{file.name}</strong></p>
          <audio controls src={fileUrl || undefined} className={styles.audioPlayer} />
        </div>
      ) : (
        <div className={styles.uploadPlaceholder} onClick={() => fileInputRef.current?.click()}>
          <p>Click to Upload or Drag & Drop (.mp3, .wav)</p>
          <p className={styles.fileWarning}>No file selected.</p>
        </div>
      )}
    </div>

  );
};