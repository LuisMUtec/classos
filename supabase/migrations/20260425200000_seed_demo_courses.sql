-- Seed: 2 cursos demo con lecciones realistas para validar el MCP server.
-- Idempotente vía ON CONFLICT en mcp_token (UNIQUE).

create extension if not exists pgcrypto;

-- ─── CS Python ──────────────────────────────────────────────────────────────
insert into public.courses (id, teacher_id, name, subject, syllabus_md, mcp_token)
values (
  '11111111-1111-1111-1111-111111111111',
  gen_random_uuid(),
  'Intro a Python — CS',
  'cs_python',
  '# Intro a Python

Curso introductorio para 1er ciclo. Cubre fundamentos:
listas, condicionales, loops, funciones, recursión.

Cada clase tiene ~10 ejemplos contextualizados (LatAm) y 3-5
ejercicios autocalificables.',
  'cs-demo-2026'
)
on conflict (mcp_token) do nothing;

insert into public.lessons (id, course_id, "order", title, content_md, objectives) values
(
  '11111111-aaaa-1111-aaaa-111111111111',
  '11111111-1111-1111-1111-111111111111',
  1,
  'Recursión: el problema se resuelve a sí mismo',
  '# Recursión

Una función es **recursiva** cuando se llama a sí misma con un sub-problema más pequeño.
Necesita:

- **Caso base**: condición que detiene la recursión.
- **Caso recursivo**: avance hacia el caso base.

## Ejemplo: factorial

```python
def factorial(n: int) -> int:
    if n <= 1:           # caso base
        return 1
    return n * factorial(n - 1)   # caso recursivo
```

## Ejemplo: contar dígitos

```python
def contar_digitos(n: int) -> int:
    if n < 10:
        return 1
    return 1 + contar_digitos(n // 10)
```

## Cuándo usar recursión

- Estructuras anidadas (árboles, JSON, carpetas).
- Definiciones matemáticas inductivas.
- Divide-y-vencerás (mergesort, quicksort).

## Errores comunes

1. Olvidar el caso base → `RecursionError`.
2. No reducir el problema en cada llamada.
3. Recursión "lineal" donde un loop sería más claro.',
  '["Identificar caso base y recursivo en una función dada", "Escribir factorial y contar_digitos recursivos", "Reconocer cuándo recursión es preferible a un loop"]'::jsonb
),
(
  '11111111-aaaa-1111-aaaa-222222222222',
  '11111111-1111-1111-1111-111111111111',
  2,
  'Listas y comprehensions',
  '# Listas

Una **lista** es una secuencia ordenada y mutable.

```python
notas = [12, 15, 8, 17, 14]
notas.append(20)
notas[0] = 13          # mutable
```

## Comprehensions

Forma compacta de construir listas a partir de otra iterable.

```python
# clásico
cuadrados = []
for x in range(10):
    cuadrados.append(x * x)

# comprehension
cuadrados = [x * x for x in range(10)]

# con filtro
pares = [x for x in range(20) if x % 2 == 0]
```

## Slicing

```python
nums = [1, 2, 3, 4, 5]
nums[1:4]    # [2, 3, 4]
nums[:2]     # [1, 2]
nums[::-1]   # [5, 4, 3, 2, 1]
```

## Errores comunes

- Mutar la lista mientras la iterás.
- Olvidar que `nums[a:b]` no incluye `b`.
- Usar `list = []` (shadowea el builtin).',
  '["Crear listas y mutarlas con append/insert/pop", "Reescribir un loop como list comprehension", "Aplicar slicing para invertir y subdividir"]'::jsonb
),
(
  '11111111-aaaa-1111-aaaa-333333333333',
  '11111111-1111-1111-1111-111111111111',
  3,
  'Diccionarios — clave / valor',
  '# Diccionarios

Estructura clave→valor con lookup O(1) promedio.

```python
notas = {"ana": 17, "luis": 14, "maria": 19}
notas["luis"]              # 14
notas["pedro"] = 12        # insert
del notas["ana"]           # delete
```

## Iteración

```python
for nombre, nota in notas.items():
    print(f"{nombre}: {nota}")
```

## Patrón: contar ocurrencias

```python
from collections import Counter
texto = "abracadabra"
Counter(texto)  # {''a'': 5, ''b'': 2, ''r'': 2, ''c'': 1, ''d'': 1}
```

## get() vs []

```python
notas.get("pedro")           # None si no existe
notas.get("pedro", 0)        # 0 si no existe
notas["pedro"]               # KeyError si no existe
```

## Errores comunes

- Asumir orden de inserción en Python < 3.7 (en 3.7+ está garantizado).
- Modificar el dict mientras iterás.
- Usar listas como claves (no son hashables).',
  '["Crear y mutar diccionarios", "Iterar items() y aplicar Counter", "Usar get() para evitar KeyError"]'::jsonb
)
on conflict (id) do nothing;

-- ─── Matemática (Álgebra) ───────────────────────────────────────────────────
insert into public.courses (id, teacher_id, name, subject, syllabus_md, mcp_token)
values (
  '22222222-2222-2222-2222-222222222222',
  gen_random_uuid(),
  'Álgebra Universitaria',
  'math_algebra',
  '# Álgebra

Curso para 1er ciclo. Cubre ecuaciones lineales,
factorización y ecuaciones cuadráticas. Cada
ejercicio se valida con SymPy (equivalencia simbólica).',
  'algebra-demo-2026'
)
on conflict (mcp_token) do nothing;

insert into public.lessons (id, course_id, "order", title, content_md, objectives) values
(
  '22222222-bbbb-2222-bbbb-111111111111',
  '22222222-2222-2222-2222-222222222222',
  1,
  'Ecuaciones lineales — resolver para x',
  '# Ecuaciones lineales

Una ecuación lineal en una variable tiene la forma:

$$ ax + b = 0 $$

con $a \\neq 0$. Tiene solución única $x = -b/a$.

## Estrategia general

1. Pasar todos los términos con $x$ a un lado.
2. Pasar las constantes al otro lado.
3. Dividir entre el coeficiente de $x$.

## Ejemplo

$$ 3x + 7 = x - 5 $$

Restamos $x$ a ambos lados:
$$ 2x + 7 = -5 $$

Restamos $7$:
$$ 2x = -12 $$

Dividimos entre $2$:
$$ x = -6 $$

## Errores comunes

- Olvidar cambiar el signo al pasar términos.
- Dividir por cero accidentalmente cuando $a = 0$.
- Multiplicar por una expresión con $x$ sin chequear soluciones extrañas.',
  '["Resolver ax + b = c para x", "Identificar ecuaciones sin solución (a=0, b≠c)", "Verificar la solución sustituyendo"]'::jsonb
),
(
  '22222222-bbbb-2222-bbbb-222222222222',
  '22222222-2222-2222-2222-222222222222',
  2,
  'Factorización de polinomios',
  '# Factorización

Reescribir un polinomio como producto de factores más simples.

## Factor común

$$ 6x^2 + 9x = 3x(2x + 3) $$

## Diferencia de cuadrados

$$ a^2 - b^2 = (a + b)(a - b) $$

Ejemplo:
$$ x^2 - 25 = (x + 5)(x - 5) $$

## Trinomio cuadrado perfecto

$$ a^2 + 2ab + b^2 = (a + b)^2 $$

Ejemplo:
$$ x^2 + 6x + 9 = (x + 3)^2 $$

## Trinomios generales (suma-producto)

Para $x^2 + bx + c$, buscar $r, s$ tales que:
- $r + s = b$
- $r \\cdot s = c$

Ejemplo: $x^2 + 5x + 6$ → $r=2, s=3$ → $(x+2)(x+3)$.

## Errores comunes

- Olvidar el factor común antes de aplicar otra técnica.
- Confundir signos en diferencia de cuadrados.
- Aplicar "trinomio cuadrado perfecto" cuando $b \\neq 2\\sqrt{c}$.',
  '["Aplicar factor común", "Reconocer diferencia de cuadrados", "Factorizar trinomios x²+bx+c por suma-producto"]'::jsonb
),
(
  '22222222-bbbb-2222-bbbb-333333333333',
  '22222222-2222-2222-2222-222222222222',
  3,
  'Ecuación cuadrática — fórmula general',
  '# Ecuación cuadrática

Forma estándar:
$$ ax^2 + bx + c = 0,\\quad a \\neq 0 $$

## Fórmula general

$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$

El **discriminante** $\\Delta = b^2 - 4ac$ determina la naturaleza:
- $\\Delta > 0$: dos soluciones reales distintas.
- $\\Delta = 0$: una solución real (raíz doble).
- $\\Delta < 0$: dos soluciones complejas conjugadas.

## Ejemplo

$$ 2x^2 - 5x + 2 = 0 $$

$\\Delta = 25 - 16 = 9$. Soluciones:
$$ x = \\frac{5 \\pm 3}{4} $$

→ $x_1 = 2,\\ x_2 = 1/2$.

## Verificación rápida (Vieta)

Para $ax^2 + bx + c = 0$ con raíces $x_1, x_2$:
- $x_1 + x_2 = -b/a$
- $x_1 \\cdot x_2 = c/a$

En el ejemplo: $2 + 1/2 = 5/2 = -(-5)/2$ ✓; $2 \\cdot 1/2 = 1 = 2/2$ ✓.

## Errores comunes

- Olvidar el $\\pm$ y devolver una sola raíz.
- Calcular $\\sqrt{b^2 - 4ac}$ sin verificar si $\\Delta < 0$.
- Confundir signo de $b$ en $-b/(2a)$.',
  '["Aplicar la fórmula general", "Interpretar el discriminante (Δ)", "Verificar raíces con Vieta"]'::jsonb
)
on conflict (id) do nothing;
