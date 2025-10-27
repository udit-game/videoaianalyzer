import { FeedbackResponse, EvaluationParameter, EVALUATION_PARAMETERS} from "@/types/analysis";
import styles from '@/ui/styles/FeedbackForm.module.css';
import React from 'react'

interface ResultsDisplayProps {
  results: FeedbackResponse;
}


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) return null;

  // Calculate the total score and maximum possible score
  const totalScore = EVALUATION_PARAMETERS.reduce((sum, param) => sum + (results.scores[param.key] || 0), 0);
  const maxScore = EVALUATION_PARAMETERS.reduce((sum, param) => sum + param.weight, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  return (
    <div className={styles.resultsContainer}>
      <h2 className={styles.scoreHeader}>Analysis Complete - Total Score: {totalScore} / {maxScore} ({percentage}%)</h2>

      <div className={styles.scoresGrid}>
        {EVALUATION_PARAMETERS.map((param) => {
          const score = results.scores[param.key] || 0;
          const scoreColor = score >= param.weight * 0.8 ? styles.scoreGood : score >= param.weight * 0.5 ? styles.scoreAverage : styles.scoreBad;

          return (
            <div key={param.key} className={styles.scoreItem}>
              <div className={styles.scoreName}>{param.name} ({param.weight})</div>
              <div className={`${styles.scoreValue} ${scoreColor}`}>{score}</div>
              <p className={styles.scoreDesc}>{param.desc}</p>
            </div>
          );
        })}
      </div>

      <div className={styles.feedbackSection}>
        <h3>Overall Feedback</h3>
        <textarea readOnly value={results.overallFeedback} className={styles.feedbackTextarea} />

        <h3>Observation</h3>
        <textarea readOnly value={results.observation} className={styles.feedbackTextarea} />
      </div>
    </div>
  );
};