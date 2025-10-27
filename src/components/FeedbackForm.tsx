"use client";

import React, { useState } from 'react';
import { AudioInput } from './AudioInput';
import { ResultsDisplay } from './ResultsDisplay';
import styles from '@/ui/styles/FeedbackForm.module.css';
import {useProcessCall} from "@/hooks/useProcessCall";

export const FeedbackForm: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const {results, isProcessing, executeProcess, error} = useProcessCall(audioFile)

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <h1>AI Call Feedback Generator</h1>
        <p>Upload a call recording (.mp3 or .wav) to generate automated performance feedback.</p>
      </header>

      <section className={styles.uploadSection}>
        <AudioInput
          onFileSelect={setAudioFile}
          file={audioFile}
        />

        <button
          onClick={executeProcess}
          disabled={!audioFile || isProcessing}
          className={styles.processButton}
        >
          {isProcessing ? 'Processing... (Please Wait)' : 'Process Call for Feedback'}
        </button>

        {error && <p className={styles.errorMessage}>Error: {error}</p>}
      </section>

      <section className={styles.resultsSection}>
        {isProcessing && (
          <div className={styles.loadingShimmer}>
            <p>Analyzing audio, transcribing, and generating scores...</p>
          </div>
        )}

        {/* 👇 FIX: Only render ResultsDisplay if 'results' is not null and not currently processing */}
        {!isProcessing && results && <ResultsDisplay results={results} />}
      </section>
    </div>
  );
};