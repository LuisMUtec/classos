import { z } from 'zod';

export const Subject = z.enum(['cs_python', 'math_algebra', 'math_calculus']);
export type Subject = z.infer<typeof Subject>;

export const Difficulty = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof Difficulty>;
