# 📕 Bitácora de Desarrollo: Chelcapu's Nightmare

> [!IMPORTANT]  
> **Regla estricta:** Este archivo es una bitácora acumulativa. Todo el contenido debe ir añadiéndose para preservar la historia y evolución del juego. **NO SE DEBE BORRAR NINGUNA INFORMACIÓN.** Si algo cambia, simplemente añade una nota de actualización debajo.

## 📌 Contexto y Temática
- **Género**: Survival horror retro en primera persona (estilo *Wolfenstein 3D* / *DOOM* clásico).
- **Temática**: Estética *meme*, urbana y oscura. Ocurre en las calles de Barcelona durante una pesadilla.
- **Protagonista**: Chelcapu (controlado por el jugador).

## 🕹️ Mecánicas y Jugabilidad Activa
- **Combate**:
  - El jugador lanza piezas de Jamón (`jamon.png`) al hacer clic o tocar el botón de ataque en móvil.
  - Los enemigos son "mdrls" (`enemigo1.png`) que se acercan flotando con una animación de rebote (*headbob*) y reducen tu vida si hacen contacto.
- **Objetos Curativos (Items)**:
  - Repartidos de forma aleatoria por el suelo hay paquetes de **Marlboro** (`marlboro.png`) y porciones de **Tutto Pizza** (`tutto.png`).
  - Al tocarlos curan 20 HP y muestran un destello verde en pantalla.
- **Sistema de Aliados (Quevedo)**:
  - Se genera un "Quevedo" (`quevedo.png`) aliado. Sigue al jugador y ataca/ahuyenta automáticamente a los enemigos cercanos.
  - Aleatoriamente, Quevedo reproduce en bocadillos de texto partes de la letra de su mítica *BZRP Session #52*.

## 🎨 Gráficos y Renderizado (Raycasting)
- **Motor Propio**: Renderizado 3D retro con técnica de *Raycasting* pura en Canvas 2D (`game.buffer`).
- **Cielo de Pesadilla**:
  - Degradado que va desde un violeta oscuro a rojo intenso.
  - **Luna de Sangre dinámica** trazada matemáticamente en relación al ángulo del jugador para funcionar como un objeto distante.
  - Estrellas lejanas con efecto de destello dinámico (*parallax*).
- **Entorno Urbano**:
  - Suelo de adoquines texturizados a nivel de pixel por el motor 3D.
  - Paredes con un sistema matemático de corrección de aspecto ("aspect ratio"). Permite pintar pósters (`chelcapu.jpg` y 3 imágenes de `propaganda`) manteniéndolos a la **altura de los ojos** (Z = 0.5) sin deformar la imagen original introducida.
- **Controles Responsive**:
  - Se detecta dinámicamente el dispositivo mediante `@media (hover: hover)`.
  - Aparece un sistema de Joystick y vista en pantalla táctil de móviles, o se esconde dejando *crosshair* para ratón en PC.

## 🎵 Sistema de Audio
- Web Audio API utilizado para un motor de **sonido espacial 2D**.
- Los enemigos y Quevedo tienen las canciones que suenan gradualmente más altas conforme te acercas a ellos (función de ganancia cuadrática por proximidad).

---

## 🚀 Ideas y Tareas para Futuras Sesiones
*Añade aquí todo lo que quede pendiente o posibles expansiones:*
- [ ] Añadir físicas de caída y gravedad real al jamón.
- [ ] Incorporar variedad en los enemigos (mdrls que disparen a distancia).
- [ ] Efectos de partículas de sangre o explosiones al eliminar un enemigo.
- [ ] Transición al siguiente nivel / Laberintos más estructurados.
- [ ] Poner un modelo de arma (ej: la mano de Chelcapu) visible en la parte inferior de la pantalla.
