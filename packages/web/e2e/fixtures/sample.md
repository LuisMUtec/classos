# Sílabo · Loops en Python (E2E fixture)

Este archivo se usa en los tests del docente (caso D3) para validar que
subir un material lo deja vinculado a una lección y que el contenido
queda extraído.

## Objetivos

- Reconocer la sintaxis de un `for` y un `while`.
- Distinguir cuándo conviene cada uno.
- Sumar elementos de una lista usando un loop.

## Ejemplo

```python
def suma(xs: list[int]) -> int:
    total = 0
    for x in xs:
        total += x
    return total
```

## Errores típicos

- Olvidar inicializar el acumulador.
- Confundir `range(n)` con `range(1, n)`.
- Mutar la lista mientras se itera.
