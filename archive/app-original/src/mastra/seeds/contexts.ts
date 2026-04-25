import type { Topic } from '../schemas/index.js';

export type ContextSeed = {
  title: string;
  context: string;
  whyAuthentic: string;
};

export const CONTEXT_SEEDS: Record<Topic, ContextSeed[]> = {
  condicionales: [
    {
      title: 'Clasificación de notas universitarias',
      context: 'Sistema que recibe nota numérica (0-20) y devuelve letra (AD/A/B/C) según escala UTEC.',
      whyAuthentic: 'Toda universidad maneja conversión de escala; el alumno la vive cada ciclo.',
    },
    {
      title: 'Validador de contraseña',
      context: 'Verifica que cumpla mínimo 8 caracteres, una mayúscula, un dígito.',
      whyAuthentic: 'Lo encuentra en cada formulario de registro.',
    },
    {
      title: 'Tarifa de transporte por edad',
      context: 'Calcula pasaje según rango etario (niño, adulto, adulto mayor) con descuento universitario.',
      whyAuthentic: 'Realidad de transporte público en LatAm.',
    },
  ],
  loops: [
    {
      title: 'Conteo de votos por candidato',
      context: 'Lista de votos como strings, devolver dict con conteo por candidato.',
      whyAuthentic: 'Caso clásico de elecciones estudiantiles o nacionales.',
    },
    {
      title: 'Análisis de logs de acceso',
      context: 'Lista de líneas de log; contar cuántas son errores 404 vs 500.',
      whyAuthentic: 'Tarea real de cualquier desarrollador junior.',
    },
    {
      title: 'Promedio ponderado de notas',
      context: 'Lista de tuplas (nota, créditos); calcular promedio ponderado.',
      whyAuthentic: 'Cómo se calcula el promedio ponderado real en universidad.',
    },
  ],
  funciones: [
    {
      title: 'Conversor de unidades de temperatura',
      context: 'Funciones celsius_a_fahrenheit y fahrenheit_a_celsius con validación.',
      whyAuthentic: 'Útil de verdad; aparece en libros de texto pero rara vez bien hecho.',
    },
    {
      title: 'Calculadora de propina',
      context: 'Función que recibe monto y porcentaje, devuelve propina y total.',
      whyAuthentic: 'Cálculo cotidiano.',
    },
    {
      title: 'Validador de DNI peruano',
      context: 'Función que valida que el DNI tenga 8 dígitos numéricos.',
      whyAuthentic: 'Contexto LatAm específico; el alumno puede testearla con su propio DNI.',
    },
  ],
  listas: [
    {
      title: 'Top N estudiantes por nota',
      context: 'Lista de tuplas (nombre, nota); devolver los N con mayor nota ordenados.',
      whyAuthentic: 'Caso de cuadro de honor universitario.',
    },
    {
      title: 'Eliminar duplicados preservando orden',
      context: 'Lista de strings; devolver lista sin duplicados manteniendo primer aparición.',
      whyAuthentic: 'Patrón frecuente en limpieza de datos.',
    },
    {
      title: 'Producto cartesiano de menú',
      context: 'Lista de entradas y lista de bebidas; devolver lista de combos posibles.',
      whyAuthentic: 'Real en cualquier app de delivery.',
    },
  ],
  strings: [
    {
      title: 'Normalizador de nombres',
      context: 'Recibe "  juan PEREZ  " y devuelve "Juan Perez".',
      whyAuthentic: 'Limpieza típica de inputs de formulario.',
    },
    {
      title: 'Detector de palíndromos',
      context: 'Función que ignora espacios y mayúsculas. "Anita lava la tina" → True.',
      whyAuthentic: 'Clásico pero con twist de español que evita la trampa de soluciones EN.',
    },
    {
      title: 'Anonimizador de emails',
      context: 'Convierte juan@utec.edu.pe en j***@utec.edu.pe.',
      whyAuthentic: 'Privacidad de datos, contexto real.',
    },
  ],
  dicts: [
    {
      title: 'Inventario de librería',
      context: 'Dict producto→stock; función que vende N unidades y actualiza stock o rechaza.',
      whyAuthentic: 'Modelo mental de cualquier sistema de inventario.',
    },
    {
      title: 'Ranking de canciones más escuchadas',
      context: 'Lista de reproducciones como strings; devolver dict canción→conteo ordenado.',
      whyAuthentic: 'Spotify Wrapped en miniatura.',
    },
    {
      title: 'Agrupar estudiantes por carrera',
      context: 'Lista de tuplas (nombre, carrera); devolver dict carrera→[nombres].',
      whyAuthentic: 'Reporte que cualquier secretaría académica genera.',
    },
  ],
  recursion: [
    {
      title: 'Tamaño total de árbol de carpetas',
      context: 'Estructura anidada {nombre, archivos:[(n,tam)], subcarpetas:[...]}; devolver tamaño total.',
      whyAuthentic: 'Cualquier explorador de archivos hace esto. Recursión natural.',
    },
    {
      title: 'Factorial sin loop',
      context: 'Implementar n! recursivamente.',
      whyAuthentic: 'Canónico. Bueno para introducir caso base.',
    },
    {
      title: 'Suma de dígitos',
      context: 'Recibe entero positivo, suma sus dígitos recursivamente. 123 → 6.',
      whyAuthentic: 'Aplicación: dígito verificador de DNI/RUC.',
    },
    {
      title: 'Torres de Hanoi',
      context: 'Imprimir movimientos para mover N discos de A a C usando B.',
      whyAuthentic: 'Clásico mostrar elegancia recursiva. Reto de pensamiento.',
    },
  ],
  'oop-basico': [
    {
      title: 'Cuenta bancaria con depósito y retiro',
      context: 'Clase Cuenta con saldo, depositar, retirar (rechaza si insuficiente).',
      whyAuthentic: 'Modelo mental claro; encapsulación natural.',
    },
    {
      title: 'Carrito de compras',
      context: 'Clase Carrito con agregar_producto, quitar_producto, total.',
      whyAuthentic: 'Cualquier e-commerce.',
    },
    {
      title: 'Estudiante con promedio',
      context: 'Clase Estudiante con notas (lista) y método promedio() y aprobado().',
      whyAuthentic: 'Modelo familiar al alumno (es él mismo).',
    },
  ],
};
