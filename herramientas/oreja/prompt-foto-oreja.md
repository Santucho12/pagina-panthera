# Foto de la oreja hecha con IA (2026-11-11)

> El 2026-11-11 el usuario mandó la foto que usa el prototipo (`fotos/oreja-ia.png`, ya integrada: ver LEEME).
> Este archivo queda por si hay que generar otra.

El montaje con la foto de Unsplash "se ve falso" (usuario, 2026-11-11). El usuario va a generar la oreja con IA. Este prompt está
pensado para el armador: oreja izquierda de perfil, sin aros, pelo atrás, luz suave de arriba a la izquierda (como la luz clave de
la escena) y lugar abajo del lóbulo para los colgantes.

## Prompt (en inglés: los generadores lo entienden mejor)
```
Ultra-realistic close-up beauty photograph of a young woman's left ear in true side profile. The camera is at ear height, pointing straight at the side of her head, so the ear faces the lens flat-on. Her face is toward the left edge of the frame; the frame shows only the ear and its surroundings (a bit of cheek, hair and neck), no eyes.

Natural, anatomically correct ear with a well-defined helix rim, antihelix, tragus and concha, and a soft, rounded, wide, fleshy, free-hanging earlobe. No earrings, no jewelry, no ear cuffs.

Dark brown hair smoothly pulled back into a low bun, completely clear of the ear: no strands touching or crossing it. Light-medium skin with real texture (fine pores, faint peach fuzz), even tone, no redness. Below the earlobe, the smooth skin of the jaw and neck, softly out of focus; a soft shadow separates the lower edge of the earlobe from the neck.

Soft, diffused light from the upper left, like a large window, with gentle fill and soft shadows. Neutral white balance, true-to-life colors, high-end beauty campaign look. 100mm macro lens at f/8: the whole ear tack sharp, hair and neck gently blurred.

Horizontal 3:2 frame. The ear is centered and fills about 60% of the frame height, with a little space above it and about a third of the frame free below the earlobe. Photographic, maximum detail, no text, no watermark.
```

## Negative prompt (en su campo, si el generador lo tiene, como Kling)
```
earrings, jewelry, studs, hoops, ear cuff, hair strands over the ear, hands, headphones, hat, deformed ear, extra folds, two ears, eyes, full face, cartoon, illustration, 3D render, CGI, plastic or airbrushed skin, heavy makeup, oversaturated, orange skin, irritated red skin, harsh flash, hard shadows, blurry ear, low resolution, text, logo, watermark
```

- **Formato:** horizontal 3:2 (o 4:3; en compu el escenario es más ancho que alto). Pedir la resolución más alta (ideal 4K) y 4
  variantes.
- **Piel y pelo:** el tono de piel se puede cambiar. Conviene dejar el pelo oscuro: hace resaltar el dorado y el cuff rosa.
- **Opcional, agujeros vacíos** (se ven cuando se eligen menos aros): cambiar `No earrings, no jewelry, no ear cuffs.` por
  `Three tiny, healed, empty piercing holes in a gentle horizontal row across the earlobe, about 6 mm apart. No earrings, no jewelry.`

## Cómo elegir
- Oreja bien formada. A la IA le cuestan las orejas: descartar las que tengan pliegues de más o un lóbulo raro.
- Ningún pelo cruzando la oreja, y nada puesto.
- El borde de abajo del lóbulo bien marcado contra el cuello.
- Nítida con zoom y sin marca de agua (los videos de Kling la traían).
- Si sale la oreja derecha (cara a la derecha), se da vuelta.

## Al integrarla
1. Copiarla a `fotos/` y ajustar `foto_oreja.py`:
   - recorte;
   - `LOBULO`;
   - agujeros (si tiene agujeros reales, justo ahí);
   - encuadres de compu y celular;
   - darla vuelta si la cara quedó a la derecha (y con ella, la mitad de la argolla que se esconde).
2. Corregir lo que delataba el montaje:
   - argollas de costado (más angostas) abrazando el borde del lóbulo;
   - luz y color de los aros igualados a los de la foto;
   - contacto: sombra y hundido donde entran al lóbulo;
   - ear cuff abrazando el hélix (antes flotaba sobre el pelo).
3. Correr `python foto_oreja.py && python construye.py`, después las pruebas (`node funciones.mjs`) y los pósters, y volver a
   publicar el artefacto.
