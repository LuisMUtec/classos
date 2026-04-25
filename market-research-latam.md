# Market Research — Generador de Ejercicios CS para Profes Universitarios LatAm

> **Pitch context:** EdHack Perú, 2026-04-25.
> **Producto:** Generador multi-agente de ejercicios Python validados por ejecución, target = profes universitarios CS en LatAm.
> **Tono:** Hostil. Toda cifra con fuente y año. Donde no hay dato confiable, se dice explícitamente.
> **Escrito:** 2026-04-24.

---

## 0. TL;DR para el slide 1

- **Mercado defendible (SOM realista 3 años):** USD ~3–6M ARR si se logra penetrar 1–3% de universidades privadas medianas y grandes en MX/CO/PE/CL. No es unicornio. Es lifestyle/serie A pequeña como mucho.
- **Dolor real verificado:** profes pierden 7h/sem buscando material + 5h/sem creándolo (K-12 Market Advisors, citado en EducationWorld 2018, sigue siendo el benchmark más citado). En CS universitario el costo por ejercicio sube porque cada problema tiene que ser solvable, sin ambigüedades, y con caso base — no encontré estudio LatAm específico, lo digo.
- **Competencia sustancial existe** (Codio, PrairieLearn, Gradescope, JetBrains Academy, GitHub Classroom + Copilot gratis para profes), pero **ninguno hace generación de novo con verificación por ejecución**. La ventana existe.
- **Riesgo #1:** GitHub Copilot gratis para profes verificados + Claude/GPT general-purpose hacen el 70% del trabajo "buena suficiente". El defensible moat es la verificación, no la generación.
- **Riesgo #2:** Replit Teams for Education **se cerró en 2024** porque el sector edu no daba la economía. Es un canario en la mina.
- **Veredicto adelantado:** **feature de un producto más grande, no startup standalone.** Detalle al final.

---

## 1. Tamaño de mercado (TAM / SAM / SOM)

### 1.1 Universidades en LatAm — desglose por país

| País | # Universidades (total) | Fuente / año | Notas |
|---|---|---|---|
| **Brasil** | 2,561 IES (317 públicas + 2,244 privadas) | INEP — Censo da Educação Superior 2024 (publicado 2025-09-17) | Incluye centros universitarios y faculdades, no solo "universidades" en sentido estricto |
| **México** | ~5,343 IES (públicas + privadas) | ANUIES, dato comúnmente citado en literatura 2022-2024 | ANUIES no publica un total único limpio; se debe consultar Anuario Estadístico anuies.mx |
| **Colombia** | ~371 IES (universidades + instituciones técnicas) | SNIES / Min. Educación | SNIES portal: snies.mineducacion.gov.co |
| **Argentina** | ~131 universidades (61 públicas + 70 privadas) | SPU (Secretaría de Políticas Universitarias) datos pre-2024 | No encontré actualización 2024 oficial |
| **Chile** | 60 universidades reconocidas + ~150 IP/CFT | Mineduc / SIES Chile | |
| **Perú** | 145 universidades licenciadas (50 públicas + 95 privadas) | SUNEDU 2024 — sunedu.gob.pe | Tras crisis de licenciamiento; varias perdieron licencia 2017-2024 |

**Cifra agregada citable:** ~1,023 universidades públicas en Argentina, Brasil, Chile, Colombia, Cuba, México y Perú; ~5,816 IES totales (públicas + privadas) en LatAm + Caribe (Wikipedia "Education in Latin America", agregando datos UNESCO/Banco Mundial — confiabilidad media, mejor citar fuentes nacionales).

**Universidades con investigación CS en LatAm:** 425 universidades analizadas en research performance CS (Scimago / Edurank 2024-2025). Este es el mejor proxy del universo "tienen depto de CS de verdad".

### 1.2 Estudiantes de CS / Ing. Sistemas (proxy de # cursos intro)

| País | Estudiantes en TIC / Ing. Computación | Fuente / año |
|---|---|---|
| **México** | 200,180 matriculados en área "Tecnologías de la Información y Comunicación" en ciclo 2021-2022 (vs 175,695 en 2020-2021, +12.23%) | SciELO MX 2024, basado en datos ANUIES — scielo.org.mx |
| **Brasil** | Total ed. superior: 10.0M en 2024 (+2.5% vs 2023). No encontré desagregado oficial limpio para "Ciência da Computação" + "Engenharia da Computação" + "Sistemas de Informação" sin acceder al microdado INEP. Estimación común en literatura: ~600-800k matriculados en cursos del eixo "Computação". **Lo digo: no encontré cifra oficial citable única.** | INEP Censo 2024; semesp.org.br "Mapa do Ensino Superior" |
| **Perú** | 339,849 matriculados en universidades públicas + ~700k en privadas (2022). No encontré desagregado oficial reciente para Ing. Sistemas / Ciencias de la Computación. Estimación gruesa basada en proporción típica (8-12% de matrícula total se va a Ing. Sistemas / TI): **~80-120k estudiantes Perú** | SUNEDU III Informe Bienal; estimación propia, **explícitamente no es cifra oficial** |
| **Colombia** | SNIES portal permite consulta; no obtuve número agregado en búsquedas. Programas Ing. Sistemas / Software / Computación tienen códigos SNIES individuales. Estimación pública vagamente citada: ~150-200k matriculados en área TI | snies.mineducacion.gov.co |
| **Chile** | No encontré dato oficial limpio desagregado. SIES Chile lo tiene. | sies.mineduc.cl |
| **Argentina** | No obtuve dato actualizado en búsquedas. Departamento Información Universitaria (SPU) lo tiene. | argentina.gob.ar/educacion/universidades |

> **Honestidad brutal:** los ministerios LatAm publican estos datos pero rara vez en un agregado regional. Para un pitch hay que decir "según INEP 2024 / ANUIES 2022 / SUNEDU 2024…" con la cifra del país que más interese al juez (Yarasca = Perú) y NO inventar agregados regionales bonitos.

### 1.3 Crecimiento de matrículas en CS LatAm últimos 5 años

- **México (TIC):** +5.12% promedio anual 2010-2022; **menor crecimiento** entre todas las áreas de conocimiento. Service Area creció +63.94%, mientras TIC apenas +5.12%. Esto es **mala noticia para el pitch**: el área no está explotando en MX. Fuente: SciELO MX 2024.
- **Brasil:** total ed. superior +5.6% 2022→2023 y +2.5% 2023→2024. Crecimiento consistente. INEP 2024.
- **EE. UU. (referencia):** CS bachelor's enrollment cayó -8% en otoño 2024 después de años de crecimiento (CRA / Encoura 2025). Es el primer descenso en años. Señal de techo.
- **Conclusión defendible:** el mercado CS no está "explotando" — está madurando. Pitch no puede vender "tsunami de matrículas".

### 1.4 Bootcamps + institutos técnicos (mercado adyacente)

- Henry (LatAm coding bootcamp, ISA cap USD 4,000) — sigue activo pero no ha publicado revenue.
- Crehana — pivotó a corporate L&D. **Despidos masivos 2022-2023** ("massive layoff and restructuring due to lack of investment and bad resource administration" — Glassdoor reviews citados en searches).
- Platzi — USD 15M revenue en 2024 con 527 empleados (getlatka.com). B2C principalmente, B2B "Platzi Business" existe.
- Ubits (Colombia) — USD 35M total raised, USD 25M Series B 2022, ~350 enterprise clientes 2022, ~100k usuarios MX/CO/CL/PE/CA. **Corporate B2B, no universidades.** Magma Partners + Riverwood Capital.

**Mercado adyacente bootcamp/upskilling:** real y caliente, pero el comprador es **HR de empresa**, no profe universitario. Si pivoteás ahí cambia el producto.

### 1.5 Edtech LatAm market size

- **USD 16.26B en 2024** (IMARC Group 2024) → proyectado USD 50.44B para 2033, CAGR 12.40%. **Estos números de "market reports" son siempre infladísimos** — incluyen K-12, corporate L&D, hardware, todo. No tomar literal.
- **VC funding edtech LatAm:** USD 7.59M raised en EdTech LatAm hasta sept 2025 (vs USD 9.69M mismo período 2024). **El sector está en sequía.** Fintech absorbe 61% del VC LatAm 2025 (Crunchbase / startuplinks). Total ecosistema edtech LatAm: 2,650 empresas, 351 funded, USD 722M total raised acumulado (Tracxn).
- **Global edtech VC peaked 2021 USD 16.7B → 2025 <USD 3B.** Crunchbase / Industry Examiner 2025. **Esta es la cifra dolorosa que va a citar un mentor McKinsey.**

### 1.6 TAM / SAM / SOM con metodología

**TAM (top-down, agresivo):**
- 425 universidades CS-relevantes en LatAm × promedio 30 profes CS/uni = **12,750 profes CS LatAm**.
- Si cobrás USD 200/profe/mes (precio aspiracional, ver §4) × 12 meses = **TAM USD ~30M ARR**.
- Alternativa per-seat estudiante: 8 países × ~100k estudiantes CS promedio = ~800k estudiantes CS LatAm × USD 5/mes × 8 meses académicos = **TAM USD ~32M ARR** vía pricing por estudiante.
- **Conclusión TAM: USD 30-50M ARR.** No es un mercado de billion dollars. Decirlo.

**SAM (universidades privadas medianas+grandes con presupuesto, en MX/CO/CL/PE — los mercados más sofisticados):**
- ~30% de las 425 universidades CS-relevantes están en condiciones de pagar SaaS docente premium = **~125 universidades**.
- × 30 profes CS = **~3,800 profes**.
- × USD 200/mes × 12 = **SAM USD ~9M ARR**.

**SOM (3 años, asumiendo ejecución decente):**
- Penetración 1-3% del SAM en año 3 = **USD 90k–270k ARR año 3**. Optimista USD 1M ARR.
- Para llegar a **USD 5M ARR** hay que penetrar ~50% del SAM o salir de LatAm. Implausible para una startup pre-seed.

> **Esto es el slide que el juez ex-McKinsey va a desarmar. La defensa: pivotás a vender al departamento entero (license institucional USD 10-30k/año), no per profe. Eso multiplica AOV ~10x pero alarga ciclo.**

---

## 2. Dolor cuantificado

### 2.1 Tiempo invertido por docente preparando material

- **7 horas/semana buscando material instruccional + 5 h/sem creándolo** = 12 h/sem en preparación de contenido. K-12 Market Advisors, citado en EducationWorld 2018 (es el dato más citado en el sector, sigue vigente como benchmark).
- **Regla informal universidad: 2-4 horas de prep por 1 hora de clase.** American Faculty Association blog 2012, repetido en literatura.
- **Profes nuevos:** 2-6 horas por lección. Profes experimentados con materiales propios: 15-60 min/lección. Edweek 2022.
- **Carga total docente universitaria:** mediana 54 h/sem trabajo, 5 h grading. Edsurge / NCTQ 2024.

**Aplicado a CS:** un buen ejercicio CS intro tiene que cumplir: enunciado claro, solvable, con tests, con rúbrica, con pistas, con extensiones. **El propio brief del producto estima ~1 hora por ejercicio.** Si un curso tiene 1 ejercicio/sem × 16 semanas × 4 secciones = 64 horas/semestre solo en ejercicios. **Esa es la cifra que el pitch debe citar — backupada con la regla de prep 2-4h/h-clase.**

### 2.2 Ratio profe:alumno en CS LatAm

- USP (Brasil, top universidad LatAm): **~14:1 a 16:1 student-to-faculty** según datos USP 2024.
- En universidades públicas masivas LatAm el ratio en cursos intro CS suele ser **40-80:1** (UNAM, UBA, San Marcos). **No encontré estudio formal**, dato anecdótico documentado en blogs académicos LatAm.
- **Implicación:** profe sobrecargado, no puede dar feedback individualizado, ergo sí necesita herramientas de auto-grading + generación.

### 2.3 Adopción IA por estudiantes vs desconfianza profes

- **47% de estudiantes** dicen que es más fácil hacer trampa con GenAI vs año anterior; 35% señala ChatGPT específicamente. BestColleges 2024.
- **UK universidades:** 7,000 casos confirmados de cheating con IA en 2023-24, **5.1 casos / 1,000 estudiantes** (vs 1.6 año anterior). Guardian FOI investigation 2024.
- **26% de teachers K-12** han atrapado un estudiante usando ChatGPT; 82% de profes universitarios conscientes de ChatGPT (vs 55% K-12). Inside Higher Ed 2024.
- **68% de profes usa AI detection tool** (Center for Democracy and Technology 2024, +substantial vs año anterior).
- **63% de profes 2023-24:** estudiantes han sido reportados por uso GenAI (vs 48% año anterior).

> **No encontré encuestas específicas LatAm sobre desconfianza docente hacia IA.** Lo digo. Hay que citar globales y adaptar.

### 2.4 Burnout / rotación docente

- **>50% de faculty universitarios** han considerado renunciar por burnout, sobrecarga, estrés. Campus Safety Magazine, 2024.
- **Faculty assistant-level** identificados como subgrupo de mayor riesgo de burnout. Systematic review 60 papers 2019-2024, MDPI 2024.

### 2.5 Time saved por uso de AI tools (la otra cara del pitch)

- Profes que usan AI weekly: **5.9 horas/semana ahorradas** (vs 2.9 h/sem para uso mensual). Walton Family Foundation 2024.
- **49% de profes usa AI para crear quizzes/assessments**, segundo uso más frecuente después de differentiation. Walton 2024.
- **60% de profes usaron AI** en el año, ahorrando hasta 6h/sem. The 74 Million 2024.

> **Este dato es EL gancho del pitch:** el problema vale la pena (12h/sem prep) y la solución funciona (5-6 h/sem ahorradas comprobado). Pero ojo: estos estudios son de K-12 USA, no profes universitarios CS LatAm. Hay que traducir honestamente.

---

## 3. Competencia (sin piedad)

### 3.1 Directos: plataformas de coding education para universidades

| Producto | Qué hace | Pricing | LatAm | Brecha vs el pitch |
|---|---|---|---|---|
| **Replit Teams for Education** | Era IDE multi-user + classrooms para CS | **DESCONTINUADO en 2024** ("financial strain and infrastructure demands posed by the educational sector" — DataWars 2024, Pickcode blog 2024) | N/A | **Canario en la mina. El líder cerró el negocio porque no daba.** |
| **GitHub Classroom + Copilot** | Repos por estudiante, autograding, **Copilot gratis verificado para profes y estudiantes** | **Gratis** para edu | Sí | Generan código, pero no diseñan ejercicios pedagógicos curados. Sin embargo, el profe puede pedirle a Copilot "dame un ejercicio de recursión" y obtener algo. **Esto es la competencia más peligrosa.** |
| **Codio** | Cloud IDE + autograding + content authoring + curriculum | Custom university quote, modelos institution / dept / student-pay. ~USD 25-60/student/yr en deals típicos universitarios USA | Limitada | Tiene autograding, pero el profe sigue creando los ejercicios. **No genera de novo.** |
| **Gradescope (Turnitin)** | Autograder PDF + código, rubric grading | Institutional plan, custom (no público) | Sí (universidades top) | Solo grading; no genera. |
| **PrairieLearn** | Open-source + paid managed para profes que no quieren self-host | Open-source o paid | Adopción spotty LatAm | Tiene parameterized questions, no generación con LLM ni verificación por exec automática integrada. |
| **JetBrains Academy / Hyperskill** | Plataforma de aprendizaje + plugin EduTools (course creators definen tasks input/output) | Personal / org plans, ~USD 50/mo individual | Limitada | El profe crea, no se le genera. |
| **Codecademy for Teams** | Cursos prefabricados + admin tools | **USD 25/seat/mo (USD 18.75 con 25% descuento universitario)** | Limitada LatAm | No es generador, es catálogo. |
| **HackerRank for Schools** | Bank of problems + autograding | Pro USD 165/mo, Professional USD 4,999/yr/10 users, Enterprise custom | Sí | Banco existente, no generación. |
| **CodeSignal Education** | Assessments + interview-style | Custom; Build USD 79/mo, Grow USD 479/mo, starter kits USD 19,000 AWS Marketplace | Limitada | Foco en hiring, no docencia. |
| **Edabit / CodingBat** | Free practice problems | Free | Free | No es producto B2B. |
| **Codeforces EDU** | Concursos | Free | Sí (comunidad fuerte) | Competitive programming, no curricular. |
| **Mimo** | Mobile coding | B2C | LatAm vía app stores | Fuera del nicho universitario. |

### 3.2 LMS con bancos de ejercicios (competencia indirecta)

- **Coursera for Campus** — ~680 universidades LatAm en 2020 (Times Higher Education / Coursera Blog), ahora ~400 instituciones LATAM (Coursera Blog 2024). **Tier Student gratis 1 curso/año + Guided Projects**. Tier Basic hasta 20,000 student licenses gratis. Plan Institution custom, requiere mín. 20,000 estudiantes inscritos.
- **edX / 2U** — partnerships con IES top (UNAM, USP).
- **Platzi** — USD 15M revenue 2024, B2C principalmente. **No es competencia para "generador de ejercicios CS para profe universitario"** — es contenido pre-grabado para autoaprendizaje.
- **Crehana** — pivotó a corporate L&D. No compite en universidades.
- **Domestika** — diseño/creativo, no CS.

### 3.3 Generadores con IA recientes (la competencia más nueva)

| Producto | Foco | Pricing | CS Universitario? |
|---|---|---|---|
| **MagicSchool AI** | K-12 generalista, 80+ tools, lesson planning | Free tier + Plus USD 99.96/yr, school/district enterprise | **NO.** K-12 generalista. Sin foco CS. Sin ejecución de código. |
| **Khanmigo (Khan Academy)** | K-12, tutor + teacher assistant | **Gratis para teachers USA**, USD 4/mo o USD 44/yr individual | NO. K-12. Tiene contenido CS pero no genera ejercicios verificados de novo. |
| **Eduaide.ai** | K-12 + algo HE generalista | Premium USD 14.99/mo, enterprise custom | NO específico CS. |
| **Diffit** | K-12, leveled reading materials | Free + Premium USD 14.99/mo | NO, foco lectura. |
| **AI Tutors construidos sobre E2B / Cloudflare Sandbox** | Custom apps, algunos generan código con exec | Variable | Existen como features dentro de productos más grandes (Perplexity Pro usa E2B). **Confirma que la tesis técnica funciona pero no es defensible standalone.** |

> **El golpe duro respondido:** ¿por qué no lo ha hecho ya nadie?
> 1. **Sí lo están haciendo** parcialmente (GitHub Copilot for Education + Codio + JetBrains EduTools cubren capas). Nadie lo empaqueta como "multi-agente con verificación por ejecución para profe CS uni LatAm" porque ese nicho es **demasiado pequeño** para una empresa USA y **demasiado complejo** para una edtech LatAm B2C.
> 2. **El segmento universitario LatAm es operacionalmente caro**: ciclos de venta lentos, presupuestos modestos, decisión multinivel. Replit cerró Teams for Education globalmente por esto.
> 3. **Generación de ejercicios CS es trivial con un LLM bueno** desde 2024. La diferenciación es la **validación por ejecución** — ese moat técnico es real pero comoditizable en 6-12 meses.

---

## 4. Willingness to Pay (lo más crítico)

### 4.1 Presupuestos universidades LatAm para herramientas docentes

- **No encontré datos públicos sólidos sobre per-student software spend en universidades LatAm.** Lo digo.
- **Benchmark USA edu (proxy):** USD 40-350 per student/year edtech total (charter NE → distrito CA). Distrito Midwest mediano ~USD 192/student/yr. Plataformas "navigate" USD 80k-200k+/institución/año (Education Week / TEC District 2024).
- **LatAm proxy razonable:** asumir presupuestos 30-50% del USA. ⇒ **USD 60-100/student/yr edtech total** en universidades privadas top LatAm. Para una herramienta puntual de CS un profesor, esperable: USD 5-15/student/sem o USD 30-100/profesor/mes en deals SaaS.
- **Universidades públicas LatAm: presupuesto SaaS docente prácticamente nulo.** Compras pasan por procurement, licitaciones, año fiscal, proceso de meses-años.

### 4.2 Quién decide la compra

- **Cadena típica universidad LatAm** (orden de mayor influencia → quién firma):
  1. Profesor individual sugiere (champion técnico)
  2. Coordinador de carrera / jefe de departamento valida pedagógicamente
  3. Decano de facultad aprueba presupuesto pequeño
  4. Vicerrectorado académico / TI para integraciones LMS o data
  5. Procurement / CFO firma > USD 5-10k
- **Sales cycle típico universidad:** **60-120 días USA, 6-12 meses LatAm es común** según vendedores LatAm SaaS edu (FirstSales, Salesup, blog Insivia 2024).
- En universidad pública: ciclo puede ser **12-24 meses** y depende del año académico. Año fiscal = año académico = ventana de compra muy estrecha.

### 4.3 Precios benchmark SaaS edu LatAm

- **Codecademy for Teams:** USD 25/seat/mo (USD 18.75 con 25% descuento universitario).
- **HackerRank Pro:** USD 165/mo.
- **JetBrains Academy individual:** USD 50/mo.
- **MagicSchool Plus:** USD 99.96/yr/profesor (≈USD 8/mo).
- **Khanmigo individual:** USD 44/yr (≈USD 3.7/mo).
- **Coursera for Campus:** custom; Basic gratis hasta 20k licencias estudiantiles.
- **Codio:** custom, deals universitarios USA típicamente USD 25-60/student/yr.

**Lectura realista para tu producto en LatAm:**
- B2B profe individual: USD 20-50/profe/mes seat (puede que paguen de bolsillo profes de universidad privada).
- B2B departamento: USD 5,000-25,000/año institucional.
- B2B universidad completa: USD 25,000-100,000/año (esto requiere venta enterprise, no realista para hackathon team).

### 4.4 Edtech B2B LatAm exitosos (benchmarks)

| Empresa | Métricas | Comentario |
|---|---|---|
| **Platzi** | USD 15M revenue 2024, 527 empleados, USD 70.5M raised | B2C dominante, B2B Platzi Business existe. Crecimiento desacelerado. |
| **Crehana** | USD 115.49M raised total, Series B USD 70M (2021), pivot a corporate L&D | **Layoffs masivos 2022-2023.** Time Magazine "World's Top EdTech 2024" #157. Cuento aleccionador. |
| **Ubits** | USD 35M raised, USD 25M Series B (2022), ~350 enterprise clientes 2022, 100k usuarios MX/CO/CL/PE/CA | **Único B2B corporate puro.** Pero ojo: corporate, no universidades. |
| **Aprende Institute** | USD 1.6M seed (2020) | Vocational, no CS uni. |
| **Henry** | ISA cap USD 4,000, no revenue público | Bootcamp B2C, no compite en universidades. |
| **Wizeline Academy** | Free courses, parte de servicios Wizeline (corp consultancy) | No es producto SaaS standalone. |

**Top 3 hubs edtech LatAm:** Brasil (~50% de las HolonIQ LATAM EdTech 100 2024), México, Argentina. **Nadie en Top 100 HolonIQ LATAM 2024 vende generador de ejercicios CS a profes universitarios.** El nicho está vacante. La pregunta: ¿es porque es oportunidad o porque nadie lo ha hecho rentable?

### 4.5 Casos de exit / unicornios edtech LatAm

- **Hotmart (Brasil)** — USD 130M raised, valuation ~USD 1B+, pero es plataforma de venta de cursos (creator economy), no CS uni.
- **Eleva Educação (Brasil)** — adquirió Open English y otras, B2C/K-12 schools.
- **Kroton (Cogna Educação)** — listada en Bolsa BR, dueña de varias marcas.
- **Open English** — B2C inglés.
- **No hay unicornio edtech LatAm que venda B2B SaaS a universidades para curriculum CS específicamente.** Es un dato relevante: implica que no se ha demostrado el modelo a scale.

### 4.6 Failure cases edtech LatAm

- **Crehana** — no quebró pero re-estructuración severa 2022-2023; pivot forzoso a corporate L&D.
- **Replit Teams for Education** (USA, no LatAm pero relevante) — cerrado 2024 por economía pobre del segmento educativo.
- **Tracxn 2025:** EdTech LatAm raised USD 7.59M en 9 meses 2025 vs USD 9.69M mismo período 2024 — el sector está en sequía severa.
- **Global edtech VC 2021 → 2025:** USD 16.7B → <USD 3B (Industry Examiner 2025).

---

## 5. Riesgos de negocio (brutalmente)

### R1 — Decisión vs pago: friction estructural
**El profe quiere, la universidad paga.** Profe individual no tiene tarjeta corporativa para SaaS USD 30/mo. Si lo paga de bolsillo lo paga 1 mes y desinstala. La venta real es a coordinador de carrera o decano, lo cual implica ciclo de 6-12 meses, demos, propuestas, RFPs en universidades públicas. **Para una startup pre-seed sin sales team esto es letal.**

### R2 — Universidad pública LatAm: presupuesto cero
Profes en universidad pública (UNMSM, UNI, UNAM, UBA, USP) tienen autonomía pedagógica pero **cero autonomía de compra**. Toda compra pasa por procurement institucional. Para muchos esto significa que solo pueden usar **lo gratis** (GitHub Classroom, Replit free tier antes, ahora alternativas free, Khan Academy). **Tu mercado real son universidades privadas medianas/altas en MX/CO/CL/PE.** Eso reduce SAM significativamente (lo modelado en §1.6).

### R3 — Comoditización por modelos generales
GitHub Copilot for Education (gratis para profes verificados desde 2024-2025), GPT-5 (lanzado 2024, ya con código tool integrado), Claude Sonnet/Opus (con code interpreter). **El profe puede prompts a ChatGPT "dame ejercicio de recursión Python con tests, ejecútalo y dime si pasa"** — y desde 2025 esto funciona razonablemente bien. La ventaja del producto es **el empaquetado pedagógico** (rúbrica, errores comunes, extensiones, verificación rigurosa multi-agente) y el **flujo curado** que no requiere prompt engineering. Pero la pregunta del juez ex-McKinsey será: **"¿es esto suficiente moat para 12 meses?"** Honesta respuesta: probablemente no.

### R4 — Competencia gratis con incumbents
GitHub Classroom + Copilot: gratis. JetBrains EduTools: gratis. PrairieLearn: open-source. Khanmigo: gratis para profes USA. **Para que un profe pague USD 30/mo cuando tiene alternativas gratis decentes, la propuesta de valor tiene que ser 10x.** Verificación por ejecución es 2-3x mejor, no 10x.

### R5 — ¿Es problema "willing to pay" o nice-to-have?
El test ácido: ¿algún profe LatAm hoy paga de bolsillo USD 30/mo por una herramienta análoga? **No tengo evidencia de que sí.** Profes pagan por libros, congresos, suscripciones de research (IEEE, ACM). Pagar por herramienta de generación de contenido docente: no tengo benchmark de adopción real. Esto es **el mayor riesgo del modelo de negocio** del pitch.

### R6 — Centros de innovación docente internos
Universidades top LatAm (Tec de Monterrey, PUCP, Andes, UNAB, Adolfo Ibáñez) tienen **centros de innovación docente** que ya construyen herramientas in-house o evalúan SaaS. Esto puede ser comprador (bueno) o constructor (malo). Tec de Monterrey ya tiene "TecLabs" experimentando con IA en clase. Implica que tu producto compite con su roadmap interno.

### R7 — Riesgo regulatorio bajo, pero data privacy
Universidades en MX/BR (LGPD), CO, AR (PDPA) tienen regulaciones de protección de datos crecientes. Si el producto procesa código de estudiantes, hay requerimientos. No es bloqueante pero es overhead.

---

## 6. Casos comparables (citables en pitch)

### Más cercanos al producto
- **Codio** (USA) — pricing institucional universitario USD 25-60/student/yr. Modelo per-seat estudiante funciona en USA pero no demostrado en LatAm a escala. Founded 2009, venture-funded. No public revenue.
- **PrairieLearn** (USA, U. Illinois spin-out) — ahora servicio comercial paid para profes que no quieren self-host. Validador del modelo open-source-then-monetize.
- **JetBrains Academy / Hyperskill** — JetBrains tiene escala global pero EduTools es feature gratuita, no revenue driver.

### Edtech LatAm con métricas
- **Platzi:** USD 15M revenue 2024 / 527 FTE → **revenue per employee ~USD 28k**. Eso es **mucho menos que un SaaS B2B sano** (benchmark Bessemer: USD 200-400k revenue/FTE para SaaS healthy). Indica que B2C edu LatAm es low-margin.
- **Ubits:** USD 25M Series B con 350 enterprise clientes ⇒ **AOV ~USD 70k/cliente** (corporate, no universidad). Si pudieras replicar este AOV en universidades, 50 clientes universitarios = USD 3.5M ARR. Pero el ciclo de venta a universidad es 3-5x más largo que a corporate.

### Failures
- **Replit Teams for Education** — cerrado 2024. **Esta es la cita más fuerte del pitch para mostrar conocimiento del mercado.**
- **Crehana restructuring 2022-2023** — caso de over-hiring + bajo PMF B2C edu.
- **Sector global:** USD 16.7B (2021) → <USD 3B (2025) en edtech VC. **Estamos en invierno edtech profundo.**

---

## 7. Veredicto brutal (200 palabras)

**Esto NO es startup standalone defensible. Es una FEATURE excelente de un producto más grande, o una herramienta interna de un grupo de universidades top.**

Los números no dan: TAM USD 30-50M ARR, SAM USD 9M ARR, SOM realista año 3 USD 100k-1M ARR. Para venture capital eso es un "pass" automático en 2026 — necesitan ver USD 100M+ TAM defendible. Para bootstrap o lifestyle business funciona, pero el mercado universitario LatAm tiene ciclos de 6-18 meses y comprador fragmentado, lo cual mata cashflow temprano.

El moat técnico (verificación por ejecución multi-agente) es real pero tiene fecha de vencimiento de 12-18 meses: GPT-5/Claude/Gemini con tool use ya hacen esto razonablemente. GitHub Copilot for Education es **gratis** para profes verificados desde 2025. Replit Teams for Education **cerró en 2024 porque el sector edu no daba la economía**, exactamente el sector que este pitch ataca. Eso es el canario en la mina.

**La jugada honesta:** posicionarlo como **(a)** módulo dentro de Codio/Coursera/PrairieLearn (acquihire-bait), **(b)** producto B2C para profes hispanohablantes individuales (USD 5-10/mes), o **(c)** servicio de consultoría que vende "currículum CS auto-generado" como entregable, no SaaS. Para un hackathon, vender la visión técnica funciona; para un VC serio, no.

---

## 8. Cifras y citas para meter en slides

### Para el slide "El problema vale plata"
- "**12 horas/semana** invierte un docente en buscar y crear material" (K-12 Market Advisors, citado en EducationWorld 2018; análogo aplicable a uni)
- "**~1 hora por ejercicio CS bien hecho**" (estimación interna del producto, defendible con regla 2-4h prep / h-clase American Faculty Association 2012)
- "**50% failure rate** en cursos intro de programación globalmente" (Bennedsen & Caspersen, ACM Inroads 2007 + 2019 follow-up)
- "**5.9 horas/semana ahorradas** por profes que usan AI weekly" (Walton Family Foundation 2024)

### Para el slide "Mercado"
- "**425 universidades** con CS-research relevante en LatAm" (Scimago / Edurank 2024)
- "**Brasil 10M** matrícula ed superior 2024 (+2.5%)" (INEP Censo 2024)
- "**México 200k** matrícula área TIC 2021-22" (SciELO MX 2024 / ANUIES)
- "**Edtech LatAm USD 16.26B en 2024**" (IMARC 2024) — disclaimer: incluye todo el sector, K-12 + corporate + hardware

### Para el slide "Competencia"
- "**Replit Teams for Education cerrado 2024** por economía del sector edu" (DataWars 2024)
- "**GitHub Copilot gratis para profes verificados** desde 2024-2025" (GitHub Docs 2025)
- "**Ningún producto en HolonIQ LATAM EdTech 100 2024** ataca este nicho específico" (HolonIQ 2024)

### Para el slide "Por qué nosotros"
- "**Verificación por ejecución** es el moat: ningún competidor B2B uni LatAm la tiene integrada"
- "**Pedagogía de CS LatAm** como diferenciador: profes hispanos, contextos auténticos LatAm, español neutro"

### Para defenderse de "esto es una feature"
- Honesta respuesta: "Sí, podría ser feature de Codio o PrairieLearn. Por eso el play es **acquihire en 18-24 meses** o **bootstrap a USD 1-2M ARR** sirviendo profes individuales privados, no enterprise universitario."

---

## 9. Fuentes (linkeables)

### Mercado / matrículas
- INEP — Censo da Educação Superior 2024 (Brasil): https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/censo-da-educacao-superior/inep-divulga-resultado-do-censo-superior-2024
- INEP — apresentação 2024: https://download.inep.gov.br/educacao_superior/censo_superior/documentos/2024/apresentacao_censo_da_educacao_superior_2024.pdf
- ANUIES — Anuario Estadístico Educación Superior: https://www.anuies.mx/informacion-y-servicios/informacion-estadistica-de-educacion-superior/anuario-estadistico-de-educacion-superior
- SciELO MX 2024 — Matrícula educación superior por área de conocimiento México 2010-2022: https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S2594-28402024000200055
- SUNEDU — universidades licenciadas: https://www.sunedu.gob.pe/lista-de-universidades-licenciadas/
- SUNEDU — III Informe Bienal: https://repositorio.minedu.gob.pe/handle/20.500.12799/7913
- SNIES Colombia: https://snies.mineducacion.gov.co/
- Wikipedia — Education in Latin America (cifras agregadas, confiabilidad media): https://en.wikipedia.org/wiki/Education_in_Latin_America
- Edurank — CS LatAm 425 universities: https://edurank.org/cs/la/
- Scimago Institutions Rankings CS LatAm: https://www.scimagoir.com/rankings.php?sector=Higher+educ.&area=1700&ranking=Overall&country=Latin+America
- Statista — higher education LatAm: https://www.statista.com/topics/13407/higher-education-in-latin-america/

### Crecimiento y tendencias CS
- CRA / Encoura 2025 — From Surge to Shift, CS enrollment crossroads: https://www.encoura.org/resources/wake-up-call/from-surge-to-shift-the-enrollment-crossroads-for-computer-science/
- CRA infographic 2025 — computing bachelor's enrollment: https://cra.org/crn/2025/08/infographic-computing-bachelors-enrollment-continues-to-grow-even-as-the-field-evolves/
- National Student Clearinghouse — CS bachelor's increase: https://www.studentclearinghouse.org/nscblog/computer-science-has-highest-increase-in-bachelors-earners/

### Edtech LatAm market size + funding
- IMARC Group — Latin America EdTech Market Size 2024: https://www.imarcgroup.com/latin-america-edtech-market
- Tracxn — EdTech LatAm 2025 trends: https://tracxn.com/d/explore/edtech-startups-in-latam/___smRrdBB1sUWf5zMooPlIG-UZpVKaMQIceeUhzCt9X4
- HolonIQ — 2024 LatAm EdTech 100: https://www.holoniq.com/notes/2024-latin-america-edtech-100
- HolonIQ — 2025 LatAm EdTech 100: https://www.holoniq.com/notes/2025-latin-america-edtech-100
- Industry Examiner — EdTech 2025 funding reset: https://www.industryexaminer.com/edtech-funding-reset-2025/
- Crunchbase — EdTech investors avoided 2024: https://news.crunchbase.com/venture/edtech-investment-hits-lows-2024/
- Rest of World — edtech funding collapse 2026: https://restofworld.org/2026/edtech-funding-collapse-k12-startups-ai-workforce/

### Dolor docente
- EducationWorld (K-12 Market Advisors data) — 7h búsqueda + 5h creación: https://www.educationworld.com/a_news/survey-finds-teachers-spend-7-hours-week-searching-instructional-materials-490526015
- EdWeek — How Teachers Spend Their Time 2022: https://www.edweek.org/teaching-learning/how-teachers-spend-their-time-a-breakdown/2022/04
- American Faculty Association — 2-4h prep per 1h class: http://americanfacultyassociation.blogspot.com/2012/02/hours-for-teaching-and-preparation-rule.html
- OECD — Making the most of teachers' time: https://www.oecd.org/content/dam/oecd/en/publications/reports/2021/01/making-the-most-of-teachers-time_e0e7a8ec/d005c027-en.pdf
- EdSurge 2024 — planning time average: https://www.edsurge.com/news/2024-03-14-we-know-how-much-planning-time-teachers-get-on-average-is-it-enough

### Burnout
- MDPI 2024 — burnout systematic review (60 papers): https://www.mdpi.com/1660-4601/22/8/1214
- Campus Safety Magazine — College Faculty Burnout statistics: https://www.campussafetymagazine.com/news/college-faculty-burnout-the-statistics-and-solutions/132000/

### IA y cheating universidad
- BestColleges — Half of College Students Say AI Is Cheating: https://www.bestcolleges.com/research/college-students-ai-tools-survey/
- Inside Higher Ed 2024 — students and professors expect more cheating: https://www.insidehighered.com/news/tech-innovation/artificial-intelligence/2024/07/29/students-and-professors-expect-more
- EdWeek 2024 — AI cheating data: https://www.edweek.org/technology/new-data-reveal-how-many-students-are-using-ai-to-cheat/2024/04
- Axios 2025 — AI cheating chaos schools: https://www.axios.com/2025/05/26/ai-chatgpt-cheating-college-teachers
- T&F 2025 — UK universities GenAI risk assessment: https://www.tandfonline.com/doi/full/10.1080/02602938.2025.2511794

### Time saved by AI for teachers
- Walton Family Foundation 2024 — AI Dividend: https://www.waltonfamilyfoundation.org/the-ai-dividend-new-survey-shows-ai-is-helping-teachers-reclaim-valuable-time
- The 74 Million 2024 — AI quizzes save teacher time: https://www.the74million.org/article/ai-created-quizzes-can-save-teachers-time-while-boosting-student-achievement/

### CS101 failure rates
- Bennedsen & Caspersen — Failure Rates Introductory Programming 12 Years Later (ACM Inroads 2019): https://users-cs.au.dk/mec/publications/journal/60-inroads-failure-rates-12.pdf

### Competencia / pricing
- Replit Teams for Education deprecation: https://www.datawars.io/articles/replit-teams-for-education-deprecation-all-you-need-to-know
- Pickcode — Best Replit Teams for Edu Alternatives 2025: https://blog.pickcode.io/best-replit-teams-for-education-alternatives-in-2025/
- GitHub Copilot for students/teachers: https://github.com/education/students , https://docs.github.com/en/copilot/how-tos/manage-your-account/get-free-access-to-copilot-pro
- GitHub Copilot Plans: https://github.com/features/copilot/plans
- Codio pricing (universities): https://www.codio.com/pricing/colleges-university-pricing
- PrairieLearn pricing: https://www.prairielearn.com/pricing
- Codecademy pricing: https://www.codecademy.com/pricing
- HackerRank Capterra comparison: https://www.capterra.com/compare/143549-182000/HackerRank-vs-CodeSignal
- CodeSignal pricing: https://codesignal.com/pricing/
- JetBrains Academy: https://www.jetbrains.com/academy/buy/
- Coursera for Campus: https://www.coursera.org/campus/compare-plans
- Coursera LatAm 680 unis: https://www.timeshighereducation.com/hub/coursera/p/improving-access-education-latin-america-online-learning
- Coursera LatAm partners blog: https://blog.coursera.org/coursera-doubles-down-on-latin-america-with-new-university-partners-in-mexico-colombia-and-argentina/

### Generadores IA edu
- MagicSchool pricing: https://www.magicschool.ai/pricing
- Khanmigo pricing / free for teachers: (Khan Academy site, citado en MagicSchool comparison) https://academicaitrends.com/blog/magicschool-ai-vs-khanmigo-for-teachers/
- Eduaide vs MagicSchool: https://www.eduaide.ai/compare/eduaide-vs-magicschool

### Edtech LatAm B2B comparables
- Platzi Crunchbase: https://www.crunchbase.com/organization/platzi
- Platzi getlatka revenue 2024: https://getlatka.com/companies/platzi.com
- Crehana Crunchbase: https://www.crunchbase.com/organization/crehana
- Crehana Glassdoor (layoffs ref): https://www.glassdoor.com/Reviews/Crehana-Reviews-E1181949.htm
- Ubits Series B TechCrunch: https://techcrunch.com/2022/01/13/ubits-snags-25m-to-create-the-netflix-for-corporate-training-in-latam/
- Ubits Bloomberg Linea: https://www.bloomberglinea.com/2022/01/13/ubits-colombian-edtech-startup-raises-25-million/
- Aprende Institute seed: https://latamlist.com/aprende-institute-raises-1-6m-seed-round-for-skills-training-in-latin-america/
- Nathan Lustig overview EdTech LatAm: https://www.nathanlustig.com/an-overview-of-edtech-in-latin-america/

### Sales cycle / B2B EdTech
- FirstSales — B2B Sales for EdTech: https://firstsales.io/sales-guide/edtech-b2b-sales/
- Insivia — Mastering SaaS Sales EdTech: https://www.insivia.com/mastering-saas-sales-tips-and-tricks-for-the-edtech-industry/
- Salesup — How EdTech Companies Acquire B2B Clients: https://salesup.club/blog/how-edtech-companies-acquire-b2b-clients

### Per-student software spending
- Education Week — How School Districts Save on Edtech: https://epe.brightspotcdn.com/d9/6d/e8aa68d363f0c3c5f960a13c4ef2/how-school-districts-can-save-billions-on-edtech.pdf
- User Intuition — Higher Ed Research Cost Benchmarks: https://www.userintuition.ai/reference-guides/higher-education-research-cost-benchmarks/
- Inside Higher Ed — Global Higher Ed Market USD 1.9T: https://www.insidehighered.com/blogs/technology-and-learning/19-trillion-global-higher-ed-market

---

## 10. Datos que NO encontré con fuente confiable (transparencia)

- Número exacto de profes universitarios CS por país LatAm (estimación gruesa: 425 unis × 30 profes = 12,750)
- Desagregado oficial INEP "Ciência da Computação" matrículas 2024 sin acceder a microdado
- Encuesta LatAm-específica de adopción IA por estudiantes universitarios CS
- Encuesta LatAm-específica de desconfianza docente hacia código IA
- Per-student software spending en universidades LatAm (solo proxies USA)
- Ratio profe:alumno cursos CS intro LatAm (solo benchmark USP)
- Ciclo de venta exacto a universidad LatAm con dato (solo "common knowledge" de blogs SaaS)
- ARR 2024 actualizado de Crehana, Ubits, Platzi Business desagregado

**Estos huecos son normales y honestos. En el pitch se cita lo que se tiene, se admite lo que no, se ofrece estimación con metodología visible.**
