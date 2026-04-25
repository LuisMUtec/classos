-- Seed: ejercicios demo (12 total, 2 por lección).
-- - Python: verification_kind = 'python_tests' (pytest source en tests/setup).
-- - Álgebra: verification_kind = 'sympy_equivalence' o 'exact_match'.
-- Idempotente vía ON CONFLICT (id).

-- ─── Python: Recursión ──────────────────────────────────────────────────────
insert into public.exercises (
  id, lesson_id, topic, statement_md, difficulty, verification_kind, verification_spec
) values
(
  '33333333-cccc-1111-cccc-000000000001',
  '11111111-aaaa-1111-aaaa-111111111111',
  'recursion',
  '# Factorial recursivo

Implementa la función `factorial(n)` que devuelva $n!$ usando **recursión**.

## Firma

```python
def factorial(n: int) -> int:
    ...
```

## Casos

- `factorial(0)` → `1`
- `factorial(5)` → `120`
- `factorial(7)` → `5040`

## Restricciones

- No usar loops (`for`/`while`) ni `math.factorial`.
- Asume `n >= 0`.',
  'easy',
  'python_tests',
  '{"kind":"python_tests","tests":"from solution import factorial\n\ndef test_base():\n    assert factorial(0) == 1\n    assert factorial(1) == 1\n\ndef test_small():\n    assert factorial(5) == 120\n\ndef test_medium():\n    assert factorial(7) == 5040\n","timeout_ms":5000}'::jsonb
),
(
  '33333333-cccc-1111-cccc-000000000002',
  '11111111-aaaa-1111-aaaa-111111111111',
  'recursion',
  '# Suma hasta n

Implementa `suma_hasta(n)` que devuelva la suma $1 + 2 + \ldots + n$ usando **recursión**.

## Firma

```python
def suma_hasta(n: int) -> int:
    ...
```

## Casos

- `suma_hasta(0)` → `0`
- `suma_hasta(10)` → `55`
- `suma_hasta(100)` → `5050`

## Restricciones

- Sin loops.
- Sin la fórmula cerrada `n*(n+1)//2`.',
  'medium',
  'python_tests',
  '{"kind":"python_tests","tests":"from solution import suma_hasta\n\ndef test_base():\n    assert suma_hasta(0) == 0\n    assert suma_hasta(1) == 1\n\ndef test_general():\n    assert suma_hasta(10) == 55\n    assert suma_hasta(100) == 5050\n","timeout_ms":5000}'::jsonb
)
on conflict (id) do nothing;

-- ─── Python: Listas ─────────────────────────────────────────────────────────
insert into public.exercises (
  id, lesson_id, topic, statement_md, difficulty, verification_kind, verification_spec
) values
(
  '33333333-cccc-2222-cccc-000000000001',
  '11111111-aaaa-1111-aaaa-222222222222',
  'listas',
  '# Filtrar pares

Implementa `pares(nums)` que devuelva solo los números **pares** de la lista, en el mismo orden.

## Firma

```python
def pares(nums: list[int]) -> list[int]:
    ...
```

## Casos

- `pares([1,2,3,4,5,6])` → `[2,4,6]`
- `pares([1,3,5])` → `[]`
- `pares([])` → `[]`

## Sugerencia

Usar list comprehension con filtro.',
  'easy',
  'python_tests',
  '{"kind":"python_tests","tests":"from solution import pares\n\ndef test_basic():\n    assert pares([1,2,3,4,5,6]) == [2,4,6]\n\ndef test_empty():\n    assert pares([]) == []\n\ndef test_no_pairs():\n    assert pares([1,3,5]) == []\n\ndef test_negatives():\n    assert pares([-2,-1,0,1,2]) == [-2,0,2]\n","timeout_ms":5000}'::jsonb
),
(
  '33333333-cccc-2222-cccc-000000000002',
  '11111111-aaaa-1111-aaaa-222222222222',
  'listas',
  '# Invertir lista (sin reversed)

Implementa `invertir(lista)` que devuelva una **nueva** lista con los elementos en orden inverso.

## Firma

```python
def invertir(lista: list) -> list:
    ...
```

## Casos

- `invertir([1,2,3])` → `[3,2,1]`
- `invertir([])` → `[]`
- `invertir([42])` → `[42]`

## Restricciones

- No usar `reversed()`, `list.reverse()`, ni slicing `[::-1]`.
- Construirla manualmente (loop o comprehension).',
  'medium',
  'python_tests',
  '{"kind":"python_tests","tests":"from solution import invertir\n\ndef test_basic():\n    assert invertir([1,2,3]) == [3,2,1]\n\ndef test_empty():\n    assert invertir([]) == []\n\ndef test_single():\n    assert invertir([42]) == [42]\n\ndef test_strings():\n    assert invertir([\"a\",\"b\",\"c\"]) == [\"c\",\"b\",\"a\"]\n\ndef test_does_not_mutate_input():\n    original = [1,2,3]\n    invertir(original)\n    assert original == [1,2,3]\n","timeout_ms":5000}'::jsonb
)
on conflict (id) do nothing;

-- ─── Python: Diccionarios ───────────────────────────────────────────────────
insert into public.exercises (
  id, lesson_id, topic, statement_md, difficulty, verification_kind, verification_spec
) values
(
  '33333333-cccc-3333-cccc-000000000001',
  '11111111-aaaa-1111-aaaa-333333333333',
  'dicts',
  '# Contar caracteres

Implementa `contar(s)` que devuelva un diccionario con la cantidad de apariciones de cada carácter en la cadena.

## Firma

```python
def contar(s: str) -> dict[str, int]:
    ...
```

## Casos

- `contar("aab")` → `{"a": 2, "b": 1}`
- `contar("")` → `{}`
- `contar("aaaa")` → `{"a": 4}`

## Sugerencia

`dict.get(c, 0)` o `collections.Counter`.',
  'easy',
  'python_tests',
  '{"kind":"python_tests","tests":"from solution import contar\n\ndef test_basic():\n    assert contar(\"aab\") == {\"a\": 2, \"b\": 1}\n\ndef test_empty():\n    assert contar(\"\") == {}\n\ndef test_repeated():\n    assert contar(\"aaaa\") == {\"a\": 4}\n\ndef test_mixed():\n    assert contar(\"abc\") == {\"a\": 1, \"b\": 1, \"c\": 1}\n","timeout_ms":5000}'::jsonb
),
(
  '33333333-cccc-3333-cccc-000000000002',
  '11111111-aaaa-1111-aaaa-333333333333',
  'dicts',
  '# Carácter más frecuente

Implementa `mas_frecuente(s)` que devuelva el carácter que aparece más veces en `s`. Asume que **no hay empates** y que `s` no está vacía.

## Firma

```python
def mas_frecuente(s: str) -> str:
    ...
```

## Casos

- `mas_frecuente("abracadabra")` → `"a"`
- `mas_frecuente("hello")` → `"l"`
- `mas_frecuente("z")` → `"z"`

## Sugerencia

Construye un dict de conteo y luego busca el `max` por valor.',
  'medium',
  'python_tests',
  '{"kind":"python_tests","tests":"from solution import mas_frecuente\n\ndef test_basic():\n    assert mas_frecuente(\"abracadabra\") == \"a\"\n\ndef test_simple():\n    assert mas_frecuente(\"hello\") == \"l\"\n\ndef test_single():\n    assert mas_frecuente(\"z\") == \"z\"\n\ndef test_long():\n    assert mas_frecuente(\"mississippi\") == \"i\" or mas_frecuente(\"mississippi\") == \"s\"\n","timeout_ms":5000}'::jsonb
)
on conflict (id) do nothing;

-- ─── Álgebra: Ecuaciones lineales ───────────────────────────────────────────
insert into public.exercises (
  id, lesson_id, topic, statement_md, difficulty, verification_kind, verification_spec
) values
(
  '44444444-dddd-1111-dddd-000000000001',
  '22222222-bbbb-2222-bbbb-111111111111',
  'ecuaciones-lineales',
  '# Resolver lineal — fácil

Resuelve la ecuación

$$ 3x + 7 = 1 $$

y devuelve **solo el valor de** $x$.

## Formato de respuesta

Un número (entero o fracción). Ejemplos válidos: `-2`, `3/4`, `0`.',
  'easy',
  'sympy_equivalence',
  '{"kind":"sympy_equivalence","expected":"-2","symbols":["x"]}'::jsonb
),
(
  '44444444-dddd-1111-dddd-000000000002',
  '22222222-bbbb-2222-bbbb-111111111111',
  'ecuaciones-lineales',
  '# Resolver lineal con paréntesis

Resuelve

$$ 2(x - 3) = 4x + 6 $$

y devuelve el valor de $x$.

## Pista

Distribuye primero, luego pasa todo lo que tenga $x$ a un lado.',
  'medium',
  'sympy_equivalence',
  '{"kind":"sympy_equivalence","expected":"-6","symbols":["x"]}'::jsonb
)
on conflict (id) do nothing;

-- ─── Álgebra: Factorización ─────────────────────────────────────────────────
insert into public.exercises (
  id, lesson_id, topic, statement_md, difficulty, verification_kind, verification_spec
) values
(
  '44444444-dddd-2222-dddd-000000000001',
  '22222222-bbbb-2222-bbbb-222222222222',
  'factorizacion',
  '# Diferencia de cuadrados

Factoriza la expresión

$$ x^2 - 25 $$

como producto de dos factores lineales.

## Formato de respuesta

Una expresión SymPy-parseable. Ejemplos válidos: `(x-5)*(x+5)`, `(x+5)*(x-5)`.',
  'easy',
  'sympy_equivalence',
  '{"kind":"sympy_equivalence","expected":"(x-5)*(x+5)","symbols":["x"]}'::jsonb
),
(
  '44444444-dddd-2222-dddd-000000000002',
  '22222222-bbbb-2222-bbbb-222222222222',
  'factorizacion',
  '# Trinomio — suma producto

Factoriza

$$ x^2 + 5x + 6 $$

como producto de dos factores lineales.

## Pista

Busca $r, s$ tales que $r + s = 5$ y $r \cdot s = 6$.',
  'medium',
  'sympy_equivalence',
  '{"kind":"sympy_equivalence","expected":"(x+2)*(x+3)","symbols":["x"]}'::jsonb
)
on conflict (id) do nothing;

-- ─── Álgebra: Cuadráticas ───────────────────────────────────────────────────
insert into public.exercises (
  id, lesson_id, topic, statement_md, difficulty, verification_kind, verification_spec
) values
(
  '44444444-dddd-3333-dddd-000000000001',
  '22222222-bbbb-2222-bbbb-333333333333',
  'cuadraticas',
  '# Menor raíz

Halla la **menor** solución real de

$$ x^2 - 5x + 6 = 0 $$

## Formato

Un número entero o fracción.',
  'easy',
  'sympy_equivalence',
  '{"kind":"sympy_equivalence","expected":"2","symbols":["x"]}'::jsonb
),
(
  '44444444-dddd-3333-dddd-000000000002',
  '22222222-bbbb-2222-bbbb-333333333333',
  'cuadraticas',
  '# Discriminante

Calcula el discriminante $\Delta = b^2 - 4ac$ de

$$ 2x^2 - 5x + 2 = 0 $$

## Formato

Un entero. Ejemplo: `9`.',
  'medium',
  'exact_match',
  '{"kind":"exact_match","expected":"9","normalize":"trim"}'::jsonb
)
on conflict (id) do nothing;
