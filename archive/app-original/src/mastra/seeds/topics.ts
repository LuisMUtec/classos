import type { Topic } from '../schemas/index.js';

export const TOPIC_DESCRIPTIONS: Record<Topic, string> = {
  condicionales: 'if/elif/else, operadores booleanos, expresiones lógicas, ramificación.',
  loops: 'for, while, range, break/continue, iteración sobre colecciones, acumuladores.',
  funciones: 'def, parámetros posicionales y por nombre, valores por defecto, return, scope.',
  listas: 'creación, indexación, slicing, métodos (append, pop, sort), comprensiones simples.',
  strings: 'inmutabilidad, indexación, slicing, métodos (split, join, strip, replace), formateo.',
  dicts: 'creación, acceso, get con default, iteración (.items()), conteo, agrupación.',
  recursion: 'caso base, paso recursivo, recursión simple y múltiple. Sin memoización.',
  'oop-basico': 'class, __init__, atributos de instancia, métodos, una herencia simple.',
};

export const ALLOWED_IMPORTS_BY_TOPIC: Record<Topic, string[]> = {
  condicionales: [],
  loops: [],
  funciones: [],
  listas: [],
  strings: ['re'],
  dicts: ['collections'],
  recursion: [],
  'oop-basico': [],
};
