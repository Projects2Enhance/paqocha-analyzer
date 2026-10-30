# PROMPT DE EJECUCIÓN — Video de LinkedIn de Paqocha Analyzer

> Prompt para un agente de IA (Claude Code u otro) que trabaja en este repo.
> Objetivo: producir un video corto, muy atractivo y suave para LinkedIn
> mostrando Paqocha Analyzer **tal como existe hoy**, contado con **texto en
> pantalla** (sin voz en off).

---

## 0. Tu rol

Eres a la vez director de motion graphics y editor de demos de producto. Tu
trabajo es grabar la app real con un navegador automatizado y montarla en
Remotion con tipografía animada, movimientos de cámara virtuales y ritmo de
anuncio de producto. El resultado debe sentirse como un lanzamiento premium,
no como una grabación de pantalla.

Antes de empezar, lee: `docs/project-context.md`, `web/DESIGN.md` (Tokens,
Typography, Hero, SearchBar, KaraokePlayer) y `data/README.md`. Carga los
skills `playwright-recording`, `remotion-best-practices`, `remotion-create`,
`remotion-markup` y `remotion-render` y sigue sus convenciones.

---

## 1. Reglas que no se rompen

1. **Solo UI real.** Cada píxel de la app que aparezca en el video viene de
   una grabación de la app corriendo de verdad. Prohibido maquetar,
   recrear o "mockear" pantallas, componentes, chips o tarjetas de la app en
   Remotion. Lo único que Remotion agrega es: tipografía, fondos de marca,
   encuadre/zoom de la grabación, un cursor y la tarjeta final.
2. **No toques la app.** No modifiques nada en `web/` ni en `data/`. Todo
   lo que crees vive en `video/`. Si algo de la app impide la grabación,
   detente y repórtalo; no lo "arregles".
3. **Texto, no voz.** La historia se cuenta con texto en pantalla. No hay
   narración ni TTS.
4. **No inventes contenido lingüístico.** La app no tiene traducciones al
   español. No traduzcas frases quechuas. Solo puedes usar en los textos lo
   que la app muestra (raíz, sufijos y su glosa/significado del análisis).
5. **No inventes cifras ni URLs.** Usa solo las cifras de la sección 4,
   y vuelve a verificarlas contra `web/public/data/` antes de renderizar.
   Si no tienes la URL pública, deja el placeholder y pregúntala.
6. **Una idea por pantalla.** Nunca compitan un zoom, un texto nuevo y una
   acción de UI al mismo tiempo. Primero la acción, luego el texto (o al revés),
   con al menos 300 ms de separación.
7. No hagas commit ni push salvo que el usuario lo pida.

---

## 2. Checkpoints: pregúntale al usuario ANTES de grabar

Haz estas preguntas en un solo mensaje y espera la respuesta:

1. **Video del hero (`web/public/video.mp4`).** `docs/project-context.md`
   habla de "una cara" con consentimiento pendiente, pero el video actual
   muestra una **alpaca** (paqocha) con lentes, no a una persona: queda solo
   confirmar los derechos del metraje. **¿Se puede mostrar en público?** Si
   no: la escena 1 usa un fondo de marca (cream → periwinkle) en lugar del
   hero (ver la toma A-alt).
2. **Audio de los hablantes.** ¿Se incluye la voz real del clip durante la
   escena del karaoke (opcional, ver 6.4)? Confirmar que la licencia del
   corpus permite usarlo en redes.
3. **Música.** ¿Hay una pista con licencia? Si no, el video va sin música
   (LinkedIn reproduce en silencio por defecto; el video tiene que funcionar
   así de todos modos).
4. **CTA final.** ¿URL pública o handle para la tarjeta final?
5. **Formatos.** Por defecto: 4:5 (1080×1350). ¿Quieres también 1:1
   (1080×1080) o 16:9 (1920×1080)?

---

## 3. Especificaciones de salida (LinkedIn)

| Parámetro | Valor |
|---|---|
| Formato principal | 1080×1350 (4:5): ocupa más del feed en el móvil |
| Duración | 35–45 s (objetivo: 40 s) |
| FPS | 30 |
| Códec | MP4, H.264, yuv420p, `+faststart`, AAC si hay audio |
| Peso | < 100 MB |
| Zonas seguras | 64 px de margen lateral, 96 px arriba/abajo para el texto |
| Primer frame | Ya debe mostrar el gancho legible: LinkedIn lo usa de miniatura |
| Sin sonido | Tiene que entenderse al 100 % en mute |

Entregables en `video/out/`:
- `paqocha-linkedin-4x5.mp4` (+ variantes si se pidieron)
- `paqocha-linkedin-poster.png` (frame de portada 1080×1350)
- `post-copy.md`: 2 propuestas de texto del post (≤ 600 caracteres, en
  español, con 3–5 hashtags). **No publiques nada.**

---

## 4. Datos reales verificados para el guion

Verificados contra `web/public/data/` (vuelve a correrlos antes de usarlos):

- **1 222** audios transcritos de hablantes reales (`metadata.json`).
- **7 541** palabras únicas indexadas (`search-index.json`).
- **≈ 5,8 h** de habla real transcrita (suma de `duration_ms`).
- Solo quechua de Puno (Collao). La app es abierta y sin registro.

**Palabra protagonista: `sunquyta`** (14 grabaciones).
- Primer clip: `audio_id 40546`, 13,7 s, Nuñoa (Puno). La palabra es la nº 3
  (`data-word-index="2"`) y empieza en **1,70 s**; la app arranca la
  reproducción en 0,44 s (3 palabras de lead-in).
- Transcripción: *"Munay takiykunaqa **sunquyta** anchata kusirichiwan, …"*
- Análisis real que muestra la app:
  - `sunqu`: raíz, s., "Corazón"
  - `-y`: FLEXIVO DE PERSONA, "Sufijo posesivo de primera persona singular."
  - `-ta`: FLEXIVO DE CASO, "Designa el objeto directo…"
- Segunda coincidencia en la lista: `audio_id 41459`, Arapa, Azángaro: otra
  voz, otro pueblo.

**Palabra secundaria: `llaqtakunapi`** (14 grabaciones), para la toma E.
- Primer clip `34210`, Nuñoa; la palabra empieza en 11,45 s (lead-in 8,57 s).
- `llaqta` "Ciudad, pueblo, comunidad…" + `-kuna` "Pluraliza los
  sustantivos." + `-pi` "Indica locación… ‘en’." Es el mejor ejemplo de sufijos
  que se apilan.

> Evita `kanmi`, `rikuni` y `chaykunata` en el video: sus análisis en los datos
> actuales tienen errores visibles (p. ej. `kanmi` → "Acto de dar…").

---

## 5. Fase 1: grabación con Playwright

### 5.1 Preparación

- Sirve la app en **modo producción** para que no aparezca el indicador de
  dev de Next ni haya lag de compilación:
  `cd web && npm run build && npm run start` (puerto 3000). No uses
  `next dev`: además reescribe `web/AGENTS.md`.
- Chromium con `--autoplay-policy=no-user-gesture-required`.
- Desactiva el tour de primera visita **sin tocar código**, con un init script:
  `localStorage.setItem("paqocha-search-tour-seen", "1")`.
- Tema claro: `localStorage.setItem("paqocha-theme", "light")`.
- Viewport de escritorio **1440×900 con deviceScaleFactor 2**, para que el
  layout de dos columnas (transcripción a la izquierda, análisis a la derecha)
  se vea y haya resolución para hacer zooms de hasta 1,8× sin perder
  nitidez. Si `recordVideo` de Playwright sale borroso o con artefactos,
  usa la técnica de mayor calidad que indique el skill `playwright-recording`
  (p. ej. screencast CDP a resolución completa) y **verifícalo extrayendo un
  frame y mirándolo** antes de continuar.
- Toma opcional M: viewport 390×844 (DPR 3) para un plano de "también en el
  móvil".
- **Hecho (2026-10-30):** `video/recording/record.mjs` ya grabó todas las
  tomas en `video/recording/takes/take-{A..F,M}.mp4` (2880×1800 a 60 fps; M
  a 1170×2532), con `video/recording/events.json`. Usa Edge (`channel:
  "msedge"`) porque el Chromium de Playwright no reproduce el H.264 del hero,
  y `--force-device-scale-factor` porque el screencast ignora el DPR del
  contexto. Antes de cada toma calienta la caché del mp3 para evitar
  congelamientos de buffering. Coordenadas en CSS px; t=0 es el primer frame.

### 5.2 Registro de eventos (obligatorio)

El script de grabación escribe `video/recording/events.json` con cada acción:
`{ take, t_ms, type: "click"|"type"|"hover"|"wait", selector, x, y }`, con
`t_ms` relativo al inicio del video de esa toma. En las tomas con audio,
muestrea también `audio.currentTime` y `audio.paused` cada 100 ms. Remotion
usa este archivo para sincronizar el cursor, los zooms y el audio opcional.
Nada se sincroniza "a ojo".

### 5.3 Tomas (una grabación por toma, con 1 s de colchón al inicio y al final)

Movimientos humanos: mueve el mouse con pasos interpolados (≥ 25 pasos,
easing), haz una pausa de 250–400 ms antes de cada clic y escribe con
`keyboard.type(…, { delay: 110 })`.

| Toma | Acciones | Espera / señal de listo |
|---|---|---|
| **A** Hero | Carga `/`. No toques nada durante 6 s: la animación del tagline "Escucha. Analiza. Entiende." y la palabra que rota en la píldora. | Las 3 palabras del `h1[aria-label]` visibles |
| **A-alt** (sin consentimiento del hero) | Igual que B, pero en Remotion se recorta solo la píldora y se pone sobre un fondo de marca. | — |
| **B** Búsqueda | Clic en la palabra de la píldora (`.paqocha-search-word-button`) → se abre y aparecen los chips "Prueba con". Espera 1,2 s. Escribe `sunquyta`. Pausa 500 ms. `Enter`. | Navega a `/search?q=sunquyta` |
| **C** Karaoke + análisis | En `/search?q=sunquyta`: deja pasar el skeleton y el reveal, y deja reproducir hasta ≈ 4,5 s del audio (la palabra se ilumina en lima a 1,70 s). Pausa con `[aria-label="Pausar"]`. Clic en `[data-word-index="2"]` (sunquyta) → el panel Análisis muestra los chips y, al estar en pausa, el detalle. Quédate quieto 4 s. | `.paqocha-word-chips[aria-label="sunquyta"]` visible y detalle desplegado |
| **D** Muchas voces | Clic en la pestaña "Lista" (`.paqocha-view-switch`). Pasa el mouse despacio por 3 tarjetas. Clic en la 2.ª tarjeta (Arapa) → cambia de voz y vuelve a Análisis. Deja reproducir 3 s. | Audio con `src` distinto, `paused === false` |
| **E** Sufijos que se apilan | Clic en `[aria-label="Buscar"]` del header → overlay. Escribe `llaqtakunapi`, `Enter`. Deja reproducir hasta pasar 11,45 s y pausa. Clic en la palabra correspondiente. Quédate quieto 3 s. | Chips `llaqta` `-kuna` `-pi` con detalle |
| **F** (opcional) Tema | Clic en `[aria-label="Cambiar tema"]` → modo oscuro. Quédate quieto 2 s. | `html[data-theme="dark"]` |

Si una toma falla (fetch lento, autoplay bloqueado), repítela; no la
remiendes en edición.

---

## 6. Fase 2: montaje en Remotion

Proyecto nuevo en `video/remotion/` (dependencias propias; no tocar
`web/package.json`). Composición `PaqochaLinkedIn` a 1080×1350, 30 fps.
Agrega `video/.gitignore` con `out/`, `recording/*.webm|mp4`, `node_modules/`.

### 6.1 Lenguaje visual (heredado de la app, no inventado)

- **Paleta** (de `web/styles/tokens.css`): fondo `#FEFAEA`, superficie
  `#FBF3D2`, tinta `#1F2150`, periwinkle `#5F62A4` / claro `#9EA1E0`,
  lima `#CFD224`. Nada de `#000` ni `#fff`.
- **Lima solo con significado**: subrayar o resaltar la palabra o morfema del
  que se está hablando. Nunca lima como color de texto sobre fondo claro
  (1,56:1, no pasa contraste).
- **Tipografía**: Nunito (`@remotion/google-fonts`), 800 para titulares,
  600 para textos de apoyo. Titulares de 72–96 px, apoyo de 40–48 px. Máximo
  7 palabras por línea y 2 líneas por pantalla.
- **Entrada de texto**: la misma firma que el hero de la app. Cada palabra
  entra con `translateY(36px → 0)`, `blur(16px → 0)` y opacidad de 0 a 1, en
  ~700 ms (versión acelerada de los 2200 ms del hero), con 90 ms entre
  palabras, curva `cubic-bezier(0.16, 1, 0.3, 1)`. Salida: opacidad 1 → 0
  y `blur(0 → 8px)` en 250 ms.
- **Encuadre de la grabación**: tarjeta con radio de 32 px y sombra suave
  `0 24px 64px rgba(31,33,80,.18)` sobre el fondo cream, ocupando ~62 % del
  alto. El texto vive en la banda superior. En los momentos clave la
  tarjeta crece a pantalla completa.
- **Cámara virtual**: zooms y paneos sobre la grabación con `spring`
  críticamente amortiguado (sin rebote; `damping ≥ 200`), de 600–900 ms.
  Zoom máximo de 1,8×. Siempre centrado en el elemento indicado por las
  coordenadas de `events.json`, no a ojo.
- **Cursor**: un cursor mínimo (flecha tinta con borde cream, 28 px) que
  sigue las coordenadas de `events.json`, con un pulso periwinkle de 300 ms
  en cada clic. Es un puntero, no UI de la app.
- **Transiciones entre escenas**: fundido con desenfoque de 300 ms o un
  "push" vertical de 400 ms. Sin cortes secos salvo en el gancho.

### 6.2 Guion (≈ 40 s)

Los textos son el copy final propuesto. Si ajustas alguno, mantenlo corto
y en español.

| # | Tiempo | Imagen (toma) | Texto en pantalla | Movimiento |
|---|---|---|---|---|
| 1 | 0,0–3,0 | Toma A a pantalla completa con un velo tinta al 45 % (o, sin consentimiento, fondo cream con "sunquyta" gigante en tinta) | **"¿Cómo suena el quechua de verdad?"** (visible desde el frame 0) | Push-in lento de 1,00 a 1,06× |
| 2 | 3,0–6,5 | Toma A sin velo: el tagline real de la app anima solo | Pequeño, abajo: "Paqocha Analyzer · Quechua de Puno (Collao)" | Ninguno: deja que la app se luzca |
| 3 | 6,5–11,0 | Toma B en tarjeta → crece a pantalla completa al abrirse la píldora | "Busca una palabra." → (al aparecer el texto tipeado) "**sunquyta**" subrayado en lima | Zoom a la píldora 1,4× mientras se escribe |
| 4 | 11,0–18,0 | Toma C: reveal y karaoke | "Escúchala en voces reales." → "Cada palabra, sincronizada con el audio." | Zoom a la transcripción 1,6× justo cuando la lima toca *sunquyta* (1,70 s del clip, sincronizado con `events.json`) |
| 5 | 18,0–26,0 | Toma C: pausa → panel Análisis con el detalle | Construcción en 3 tiempos, alineada con los chips reales: **sunqu** = corazón · **-y** = mi · **-ta** = objeto directo. Cierre: "Una palabra. Toda su estructura." | Paneo de la transcripción al panel de análisis; zoom a los chips 1,7×; cada morfema del texto aparece cuando la cámara pasa por su chip |
| 6 | 26,0–31,0 | Toma D: Lista → otra voz | "14 grabaciones de *sunquyta*." → "Distintas voces. Distintos pueblos de Puno." | Paneo vertical suave por las tarjetas; corte rítmico al cambiar de voz |
| 7 | 31,0–35,0 | Toma E: chips `llaqta` `-kuna` `-pi` | "Los sufijos se apilan. Aquí se ven." | Zoom a los chips; cada chip se enfatiza con un subrayado lima en secuencia |
| 8 | 35,0–36,5 | Toma F (opcional): cambio a modo oscuro | — | Wipe al tema oscuro que actúa de transición al cierre |
| 9 | 36,5–41,0 | Tarjeta final, fondo tinta `#1F2150` | Logo (`web/app/icon.png`) · **"Escucha. Analiza. Entiende."** (cream, con la misma entrada del hero) · "1 222 audios reales · 7 541 palabras · abierto y sin registro" · `[URL]` | Logo con escala 0,9→1 y luego las palabras en cascada |

Si sobra tiempo, recorta primero la escena 8 y después la 7. Nunca recortes
las escenas 4 y 5: son el diferencial (escuchar + analizar).

### 6.3 Ritmo

- El gancho (escena 1) debe leerse en < 1,5 s.
- Cada texto se queda en pantalla al menos `120 ms × nº de palabras + 1 s`.
- Mínimo 3 "momentos de respiro" (≥ 1,2 s sin texto nuevo) en las escenas 2,
  4 y 6, para que la UI real se vea sola.

### 6.4 Audio (solo si se aprobó en el checkpoint 2)

- Descarga el mp3 del clip desde
  `https://cdn-paqocha.iampol.dev/audios/<audio_file>` (el `audio_file` sale
  de `web/public/data/clips/40546.json`) a `video/remotion/public/`.
- En la escena 4, colócalo con `<Audio>` usando `startFrom` y el offset
  calculado a partir de los muestreos de `audio.currentTime` de
  `events.json`, para que la voz y la lima del karaoke coincidan al frame.
- Fade-in y fade-out de 200 ms. Si hay música: −18 LUFS bajo la voz, con
  ducking −8 dB mientras habla el hablante.
- En la escena 4, agrega una etiqueta pequeña "Activa el sonido" que no
  tape la transcripción.

---

## 7. Fase 3: render y control de calidad

Renderiza con el skill `remotion-render` (H.264, CRF ≈ 18). Luego, **antes de
entregar**, extrae frames en 0,5 s, 5 s, 12 s, 20 s, 28 s y 38 s y revísalos
uno por uno:

- [ ] El frame 0 se entiende como miniatura (gancho legible).
- [ ] Ningún píxel de "UI de la app" es inventado: todo sale de las grabaciones.
- [ ] El texto está nítido, dentro de las zonas seguras y con contraste
      AA o mejor; no hay lima como texto sobre fondo claro.
- [ ] La grabación se ve nítida en el zoom máximo (sin pixelado).
- [ ] No se ven el tour, el indicador de dev de Next, el scrollbar del
      navegador ni barras del sistema.
- [ ] La lima del karaoke coincide con *sunquyta* exactamente cuando el texto
      lo señala (y con la voz, si hay audio).
- [ ] Las cifras de la tarjeta final coinciden con `web/public/data/`.
- [ ] Se entiende completo en mute. Dura entre 35 y 45 s. Pesa menos de 100 MB.
- [ ] `git status`: nada cambió en `web/` ni en `data/`.

Si algún punto falla, corrige y vuelve a renderizar. Al terminar, reporta en
≤ 5 líneas: la ruta de los archivos, la duración, el peso y las decisiones
tomadas en los checkpoints.
