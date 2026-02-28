export type LocalizedString = {
  uz: string;
  ru: string;
  en: string;
};

export type Trait =
  | 'creative'
  | 'visual'
  | 'technical'
  | 'numeric'
  | 'communication'
  | 'structure'
  | 'mobility'
  | 'focus';

export type Course =
  | 'graphic_design'
  | 'smm'
  | 'accounting'
  | 'videography'
  | 'architecture'
  | 'foundation_programming'
  | 'mobileography';

export interface Question {
  id: string;
  text: string;
  section: string;
  traits: Partial<Record<Trait, number>>;
  courses: Partial<Record<Course, number>>;
}

export interface ResultContent {
  title: string;
  description: string[];
}

export type CourseResult = {
  course: Course;
  score: number;
  percentage: number;
};
