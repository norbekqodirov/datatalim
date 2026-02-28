import { Question, Course, CourseResult } from '../types';
import { QUESTIONS, COURSE_NAMES } from '../constants';

export const calculateResults = (answers: Record<string, number>): CourseResult[] => {
  const courseScores: Record<string, number> = {};

  // Initialize scores
  Object.keys(COURSE_NAMES).forEach(course => {
    courseScores[course] = 0;
  });

  // Calculate raw scores
  // Formula: course_score += answer_value * question.courses[course]
  QUESTIONS.forEach(question => {
    const answerValue = answers[question.id];
    if (answerValue !== undefined) {
      Object.entries(question.courses).forEach(([courseKey, weight]) => {
        if (weight) {
          courseScores[courseKey] += answerValue * weight;
        }
      });
    }
  });

  // Normalization
  // 1. Find min score
  let minScore = 0;
  Object.values(courseScores).forEach(score => {
    if (score < minScore) minScore = score;
  });

  // 2. Shift if negative
  const shift = Math.abs(minScore);
  const shiftedScores: Record<string, number> = {};
  let totalScore = 0;

  Object.entries(courseScores).forEach(([course, score]) => {
    const finalScore = score + shift;
    shiftedScores[course] = finalScore;
    totalScore += finalScore;
  });

  // 3. Calculate percentages and sort
  const results: CourseResult[] = Object.entries(shiftedScores).map(([course, score]) => {
    return {
      course: course as Course,
      score: score,
      percentage: totalScore === 0 ? 0 : Math.round((score / totalScore) * 100)
    };
  });

  // Sort descending by percentage
  return results.sort((a, b) => b.percentage - a.percentage);
};
