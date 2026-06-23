/* ============================================
   CHELCAPU'S NIGHTMARE - FIRST PERSON ENGINE
   Raycasting engine set in Barcelona
   ============================================ */

// ============================================
// CONSTANTS & CONFIG
// ============================================
const CONFIG = {
    // Render
    RENDER_WIDTH: 720,
    RENDER_HEIGHT: 480,
    FOV: Math.PI / 3,
    HALF_FOV: Math.PI / 6,
    
    // World
    TILE_SIZE: 1,
    MAP_COLS: 48,
    MAP_ROWS: 48,
    WALL_HEIGHT: 10.0,       // Massive buildings — sky never visible
    
    // Player
    PLAYER_SPEED: 0.04,
    PLAYER_SPRINT_SPEED: 0.07,
    PLAYER_RADIUS: 0.2,
    PLAYER_ROT_SPEED: 0.035,
    PLAYER_MAX_HEALTH: 100,
    PLAYER_SPRINT_DURATION: 3000,
    
    // Enemies
    ENEMY_SPEED: 0.02,
    ENEMY_SPRITE_SCALE: 0.8,
    ENEMY_SPAWN_INTERVAL: 3000,
    ENEMY_DAMAGE: 12,
    ENEMY_DAMAGE_COOLDOWN: 1200,
    ENEMY_HIT_DIST: 0.6,
    ENEMY_MAX: 15,
    ENEMY_HEALTH: 3,        // Hits of jamón to kill
    INITIAL_ENEMIES: 2,
    
    // Quevedo
    QUEVEDO_SPEED: 0.025,
    QUEVEDO_SPRITE_SCALE: 0.8,
    QUEVEDO_SPAWN_INTERVAL: 30000,
    QUEVEDO_MAX: 1,
    QUEVEDO_ATTACK_COOLDOWN: 500,
    QUEVEDO_HIT_DIST: 0.8,
    
    // Jamón attack
    JAMON_SPEED: 0.15,
    JAMON_LIFETIME: 2000,
    JAMON_HIT_DIST: 0.5,
    JAMON_COOLDOWN: 400,
    JAMON_SPRITE_SCALE: 0.25,
    
    // Dialogue
    DIALOGUE_TRIGGER_DIST: 7,
    DIALOGUE_CLOSE_DIST: 4,
    DIALOGUE_DURATION: 3000,
    DIALOGUE_COOLDOWN: 6000,
    
    // Music
    MUSIC_MAX_DIST: 12,      // Beyond this distance, volume = 0
    MUSIC_MIN_DIST: 1,       // At this distance, volume = max
};

// ============================================
// ENEMY PHRASES
// ============================================
const ENEMY_PHRASES = [
    "Oye amego tiene sigarro",
    "Eh tío tienes hora",
    "Ey bro ven aquí un momento",
    "No te voy a hacer nada tranquilo",
    "Tienes suelto amego",
    "Oye oye ven pa'ca",
    "Eh amego espera un segundo",
    "Solo quiero hablar contigo amego",
    "Dame el móvil primo",
    "Ey bro mírame cuando te hablo",
    "Tío déjame 1 euro anda",
    "Ey amego para un momento",
    "Eh primo tienes fuego",
    "Oye tú no corras amego",
    "Eh espera que te conozco",
    "Amego préstame el cargador",
    "Ey tío no seas borde ven",
    "Oye amego esto es un barrio libre",
    "No te asustes bro solo pregunto",
    "Eh tío quiero hablar un momento",
    "Ey pisha tienes tabaco",
    "Bro bro para un segundo anda",
    "Amego no vayas tan rápido",
    "Eh tío que no muerdo",
];

// Song files
const SONG_FILES = [
    'Morad - Motorola (letra)📱.opus',
    'Morad - Pelele (Letra_Lyrics).opus',
    'QUEVEDO - BZRP Music Sessions #52 (Lyrics Version) 💸.opus',
];

// ============================================
// QUEVEDO PHRASES
// ============================================
const QUEVEDO_PHRASES = [
    "Quédate, que las noches sin ti duelen",
    "Tengo en la mente las poses",
    "Y todos los gemidos",
    "Que ya no quiero nada que no sea contigo",
    "Dale, wacha, suelta",
    "De rocesito a la lenta",
    "Para que esta noche sea de nosotros",
    "Ando manejando por las calles de la isla",
    "Bebé, quédate"
];

// ============================================
// TILE TYPES
// ============================================
const TILE = {
    EMPTY: 0,
    WALL1: 1,
    WALL2: 2,
    WALL3: 3,
    WALL4: 4,
    WALL5: 5,
    GRASS: 6,
    PLAZA: 7,
};

const WALL_COLORS = {
    [TILE.WALL1]: ['#d4a574', '#a07850'],
    [TILE.WALL2]: ['#c8a020', '#8b7015'],
    [TILE.WALL3]: ['#c49a6c', '#8e6e48'],
    [TILE.WALL4]: ['#7a6045', '#544030'],
    [TILE.WALL5]: ['#cd853f', '#96602d'],
};

// ============================================
// GAME STATE
// ============================================
const game = {
    canvas: null,
    ctx: null,
    renderWidth: CONFIG.RENDER_WIDTH,
    renderHeight: CONFIG.RENDER_HEIGHT,
    screenWidth: 0,
    screenHeight: 0,
    running: false,
    lastTime: 0,
    score: 0,
    elapsed: 0,
    
    buffer: null,
    bufCtx: null,
    mmCanvas: null,
    mmCtx: null,
    zBuffer: [],
    
    player: {
        x: 0, y: 0,
        angle: 0,
        health: CONFIG.PLAYER_MAX_HEALTH,
        sprinting: false,
        sprintEnergy: CONFIG.PLAYER_SPRINT_DURATION,
        lastDamageTime: 0,
        flashTimer: 0,
        headBob: 0,
        headBobSpeed: 0,
        lastJamonTime: 0,
    },
    
    input: {
        moveF: 0, moveS: 0,
        rotDelta: 0,
        sprint: false,
        attack: false,
        keys: {},
        joyTouchId: null,
        joyStartX: 0, joyStartY: 0,
        joyDx: 0, joyDy: 0,
        lookTouchId: null,
        lookLastX: 0,
        mouseLocked: false,
    },
    
    enemies: [],
    quevedos: [],
    jamones: [],     // Flying jamón projectiles
    items: [],       // Collectible items like Marlboro
    dialogues: [],
    map: [],
    
    enemyImg: null,
    enemyImgLoaded: false,
    quevedoImg: null,
    quevedoImgLoaded: false,
    
    jamonImg: null,
    jamonImgLoaded: false,
    
    marlboroImg: null,
    marlboroImgLoaded: false,
    
    tuttoImg: null,
    tuttoImgLoaded: false,
    
    propagandaImgs: [],
    propagandaLoaded: [false, false, false],
    
    // Audio
    audioCtx: null,
    songBuffers: [null, null, null],  // Decoded audio buffers
    songsLoaded: false,
    
    enemySpawnTimer: 0,
    quevedoSpawnTimer: 0,
    scoreTimer: 0,
};

// ============================================
// AUDIO SYSTEM
// ============================================
function initAudio() {
    try {
        game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not available');
        return;
    }
    
    // Load songs
    SONG_FILES.forEach((file, idx) => {
        // Replace # with %23 so the browser doesn't interpret it as a URL fragment
        fetch(file.replace('#', '%23'))
            .then(r => r.arrayBuffer())
            .then(buf => game.audioCtx.decodeAudioData(buf))
            .then(decoded => {
                game.songBuffers[idx] = decoded;
                if (game.songBuffers[0] && game.songBuffers[1] && game.songBuffers[2]) {
                    game.songsLoaded = true;
                }
            })
            .catch(e => console.warn('Could not load song:', file, e));
    });
}

function assignEntityAudio(entity, songIdx) {
    if (!game.audioCtx || !game.songsLoaded) return;
    
    const buffer = game.songBuffers[songIdx];
    if (!buffer) return;
    
    const gainNode = game.audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(game.audioCtx.destination);
    
    const source = game.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const startOffset = Math.random() * buffer.duration;
    source.connect(gainNode);
    source.start(0, startOffset);
    
    entity.audioSource = source;
    entity.audioGain = gainNode;
    entity.songIdx = songIdx;
}

function assignEnemyAudio(enemy) {
    assignEntityAudio(enemy, Math.floor(Math.random() * 2));
}

function assignQuevedoAudio(quevedo) {
    assignEntityAudio(quevedo, 2);
}

function updateEntityAudio(entity) {
    if (!entity.audioGain) return;
    
    const p = game.player;
    const dx = p.x - entity.x;
    const dy = p.y - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Volume: 1 at MIN_DIST, 0 at MAX_DIST
    let vol = 0;
    if (dist < CONFIG.MUSIC_MAX_DIST) {
        vol = 1 - (dist - CONFIG.MUSIC_MIN_DIST) / (CONFIG.MUSIC_MAX_DIST - CONFIG.MUSIC_MIN_DIST);
        vol = Math.max(0, Math.min(1, vol));
        vol = vol * vol; // Quadratic falloff for more natural feel
    }
    
    // Smooth volume transition
    const now = game.audioCtx.currentTime;
    entity.audioGain.gain.cancelScheduledValues(now);
    entity.audioGain.gain.setTargetAtTime(vol * 0.7, now, 0.1);
}

function stopEntityAudio(entity) {
    if (entity.audioSource) {
        try {
            entity.audioSource.stop();
        } catch (e) {}
        entity.audioSource = null;
    }
    if (entity.audioGain) {
        entity.audioGain.disconnect();
        entity.audioGain = null;
    }
}



// ============================================
// MAP GENERATION - Barcelona Eixample Grid
// ============================================
function generateMap() {
    const { MAP_COLS, MAP_ROWS } = CONFIG;
    game.map = [];
    
    for (let y = 0; y < MAP_ROWS; y++) {
        game.map[y] = [];
        for (let x = 0; x < MAP_COLS; x++) {
            const hash = ((x * 73 + y * 137 + x * y * 7) % 5) + 1;
            game.map[y][x] = hash;
        }
    }
    
    // Wider roads: 4 tiles wide instead of 2
    // Road centers every ~10 tiles, 4 tiles wide each
    const roadSets = [
        [3, 4, 5, 6],
        [13, 14, 15, 16],
        [23, 24, 25, 26],
        [33, 34, 35, 36],
        [43, 44, 45, 46],
    ];
    
    const allRoadTiles = new Set();
    for (const set of roadSets) {
        for (const r of set) allRoadTiles.add(r);
    }
    
    for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
            if (allRoadTiles.has(y) || allRoadTiles.has(x)) {
                game.map[y][x] = TILE.EMPTY;
            }
        }
    }
    
    // Plazas at intersections
    const plazaCenters = [
        [5, 14], [14, 24], [25, 5], [35, 14], [24, 35], [5, 35], [35, 35], [14, 44]
    ];
    for (const [py, px] of plazaCenters) {
        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 2; dx++) {
                const ny = py + dy;
                const nx = px + dx;
                if (ny >= 0 && ny < MAP_ROWS && nx >= 0 && nx < MAP_COLS) {
                    game.map[ny][nx] = TILE.PLAZA;
                }
            }
        }
    }
    
    // Parks
    const parks = [
        { x: 8, y: 8, w: 3, h: 3 },
        { x: 18, y: 28, w: 3, h: 3 },
        { x: 28, y: 18, w: 3, h: 3 },
        { x: 38, y: 38, w: 3, h: 3 },
    ];
    for (const park of parks) {
        for (let dy = 0; dy < park.h; dy++) {
            for (let dx = 0; dx < park.w; dx++) {
                const ny = park.y + dy;
                const nx = park.x + dx;
                if (ny >= 0 && ny < MAP_ROWS && nx >= 0 && nx < MAP_COLS) {
                    game.map[ny][nx] = TILE.GRASS;
                }
            }
        }
    }
    
    // Borders = walls
    for (let y = 0; y < MAP_ROWS; y++) {
        game.map[y][0] = TILE.WALL1;
        game.map[y][MAP_COLS - 1] = TILE.WALL1;
    }
    for (let x = 0; x < MAP_COLS; x++) {
        game.map[0][x] = TILE.WALL1;
        game.map[MAP_ROWS - 1][x] = TILE.WALL1;
    }
}

function isWall(tile) {
    return tile >= TILE.WALL1 && tile <= TILE.WALL5;
}

function isWalkable(x, y) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    if (row < 0 || row >= CONFIG.MAP_ROWS || col < 0 || col >= CONFIG.MAP_COLS) return false;
    return !isWall(game.map[row][col]);
}

function isSafeSpawn(x, y) {
    const r = 0.4;
    return isWalkable(x, y) && 
           isWalkable(x + r, y) && isWalkable(x - r, y) && 
           isWalkable(x, y + r) && isWalkable(x, y - r);
}

// ============================================
// RAYCASTING ENGINE
// ============================================
function castRays() {
    const { player } = game;
    const { RENDER_WIDTH, RENDER_HEIGHT, FOV, MAP_COLS, MAP_ROWS, WALL_HEIGHT } = CONFIG;
    const numRays = RENDER_WIDTH;
    const halfH = RENDER_HEIGHT / 2;
    const ctx = game.bufCtx;
    
    game.zBuffer = new Array(numRays);
    
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - FOV / 2 + (i / numRays) * FOV;
        const sin = Math.sin(rayAngle);
        const cos = Math.cos(rayAngle);
        
        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);
        
        const deltaDistX = Math.abs(1 / cos) || 1e30;
        const deltaDistY = Math.abs(1 / sin) || 1e30;
        
        let stepX, stepY, sideDistX, sideDistY;
        
        if (cos < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; }
        else { stepX = 1; sideDistX = (mapX + 1 - player.x) * deltaDistX; }
        
        if (sin < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; }
        else { stepY = 1; sideDistY = (mapY + 1 - player.y) * deltaDistY; }
        
        let side = 0;
        let wallType = TILE.WALL1;
        
        for (let step = 0; step < 60; step++) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            
            if (mapX < 0 || mapX >= MAP_COLS || mapY < 0 || mapY >= MAP_ROWS) {
                wallType = TILE.WALL1;
                break;
            }
            
            const tile = game.map[mapY][mapX];
            if (isWall(tile)) {
                wallType = tile;
                break;
            }
        }
        
        let dist;
        if (side === 0) dist = (mapX - player.x + (1 - stepX) / 2) / cos;
        else dist = (mapY - player.y + (1 - stepY) / 2) / sin;
        if (dist < 0.01) dist = 0.01;
        game.zBuffer[i] = dist;
        
        // Wall height — massive buildings
        const scale = RENDER_HEIGHT / dist;
        const wallTop = halfH - (WALL_HEIGHT - 0.5) * scale + player.headBob;
        const wallBottom = halfH + 0.5 * scale + player.headBob;
        const wallHeight = wallBottom - wallTop;
        
        // Color with fog
        const colors = WALL_COLORS[wallType] || WALL_COLORS[TILE.WALL1];
        const baseColor = side === 0 ? colors[0] : colors[1];
        
        const fogFactor = Math.min(1, dist / 18);
        const fogR = 10, fogG = 10, fogB = 30;
        
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        const fr = Math.floor(r * (1 - fogFactor) + fogR * fogFactor);
        const fg = Math.floor(g * (1 - fogFactor) + fogG * fogFactor);
        const fb = Math.floor(b * (1 - fogFactor) + fogB * fogFactor);
        
        // Ceiling — dark, buildings cover most of it
        ctx.fillStyle = '#0a0a1e';
        ctx.fillRect(i, 0, 1, Math.max(0, wallTop));
        
        // Wall strip
        ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
        ctx.fillRect(i, Math.max(0, wallTop), 1, wallBottom - wallTop);
        
        // Wall Details
        if (dist < 15 && wallHeight > 30) {
            let wallX;
            if (side === 0) wallX = player.y + dist * sin;
            else wallX = player.x + dist * cos;
            wallX -= Math.floor(wallX);
            
            // Posters (Se Busca & Propaganda)
            const posterHash = Math.abs(mapX * 11 + mapY * 19 + side * 7) % 8;
            if (posterHash < 4 && wallX > 0.15 && wallX < 0.85) {
                let img = null;
                let isWanted = false;
                
                if (posterHash === 0 && game.chelcapuImgLoaded) {
                    img = game.chelcapuImg;
                    isWanted = true;
                } else if (posterHash > 0 && game.propagandaLoaded && game.propagandaLoaded[posterHash - 1]) {
                    img = game.propagandaImgs[posterHash - 1];
                }
                
                if (img) {
                    const aspectRatio = img.height / img.width;
                    const posterWidthUnits = 0.7; // span 0.15 to 0.85
                    const wallHeightPx = wallBottom - wallTop;
                    const posterHeightPx = posterWidthUnits * aspectRatio * (wallHeightPx / CONFIG.WALL_HEIGHT);
                    
                    const posterBottomZ = 0.2; // at eye level
                    const posterBottomPx = wallBottom - (posterBottomZ / CONFIG.WALL_HEIGHT) * wallHeightPx;
                    
                    const posterY1 = posterBottomPx - posterHeightPx;
                    const posterY2 = posterBottomPx;
                    const posterH = posterHeightPx;
                    
                    if (posterY1 < RENDER_HEIGHT && posterY2 > 0) {
                        const drawYStart = Math.max(0, posterY1);
                        const drawYEnd = Math.min(RENDER_HEIGHT, posterY2);
                        const drawH = drawYEnd - drawYStart;
                        const srcYOffset = drawYStart > posterY1 ? (drawYStart - posterY1) / posterH * img.height : 0;
                        const srcH = (drawH / posterH) * img.height;
                        
                        const srcX = Math.floor(((wallX - 0.15) / 0.7) * img.width);
                        ctx.globalAlpha = 1 - fogFactor;
                        ctx.drawImage(
                            img,
                            srcX, srcYOffset, 1, srcH,
                            i, drawYStart, 1, drawH
                        );
                        ctx.globalAlpha = 1.0;
                        
                        if (isWanted && drawH > 5) {
                            ctx.fillStyle = `rgba(200, 20, 20, ${1 - fogFactor})`;
                            const bannerStart = Math.max(drawYStart, posterY2 - posterH * 0.15);
                            const bannerH = drawYEnd - bannerStart;
                            if (bannerH > 0) ctx.fillRect(i, bannerStart, 1, bannerH);
                        }
                    }
                }
            }
            
            // PIPES
            const decoHash = (mapX * 43 + mapY * 23 + side * 11) % 10;
            if (decoHash === 4 && wallX > 0.45 && wallX < 0.55) {
                ctx.fillStyle = `rgba(60, 60, 65, ${1 - fogFactor})`;
                ctx.fillRect(i, Math.max(0, wallTop), 1, wallBottom - wallTop);
                for (let br = 0; br < 5; br++) {
                    const brY = wallTop + (wallBottom - wallTop) * (0.2 + br * 0.2);
                    if (brY > 0 && brY < RENDER_HEIGHT) {
                        ctx.fillStyle = `rgba(30, 30, 30, ${1 - fogFactor})`;
                        ctx.fillRect(i, brY, 1, 4);
                    }
                }
            }
            
            // GRAFFITI
            if (decoHash < 3 && wallX > 0.1 && wallX < 0.9) {
                const graffY = wallTop + (wallBottom - wallTop) * 0.92;
                const graffH = (wallBottom - wallTop) * 0.06;
                if (graffY > 0 && graffY < RENDER_HEIGHT) {
                    const hue = (mapX * 13 + mapY * 17) % 360;
                    const wave = Math.sin(wallX * 15) * 4;
                    ctx.fillStyle = `hsla(${hue}, 80%, 40%, ${0.7 * (1 - fogFactor)})`;
                    ctx.fillRect(i, graffY + wave, 1, graffH);
                }
            }
            
            const winCol = Math.floor(wallX * 4);
            if (winCol === 1 || winCol === 2) {
                const winRows = 8; // Many floors
                for (let wy = 0; wy < winRows; wy++) {
                    const winY = wallTop + (wallBottom - wallTop) * (0.05 + wy * 0.11);
                    const winH = (wallBottom - wallTop) * 0.06;
                    
                    if (winY > 0 && winY + winH < RENDER_HEIGHT) {
                        const litHash = (mapX * 31 + mapY * 67 + winCol * 13 + wy * 41) % 10;
                        if (litHash < 6) {
                            const brightness = 0.3 + (1 - fogFactor) * 0.4;
                            ctx.fillStyle = `rgba(255, 220, 120, ${brightness})`;
                        } else {
                            ctx.fillStyle = `rgba(20, 30, 60, ${0.5 * (1 - fogFactor)})`;
                        }
                        ctx.fillRect(i, winY, 1, winH);
                    }
                }
            }
            
            // Balcony lines
            if (dist < 6) {
                for (let bl = 0; bl < 7; bl++) {
                    const balcY = wallTop + (wallBottom - wallTop) * (0.12 + bl * 0.12);
                    if (balcY > 0 && balcY < RENDER_HEIGHT) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * (1 - fogFactor)})`;
                        ctx.fillRect(i, balcY, 1, 2);
                    }
                }
            }
        }
        
        // Floor
        ctx.fillStyle = '#2a2a35';
        ctx.fillRect(i, Math.max(0, wallBottom), 1, RENDER_HEIGHT - wallBottom);
        
        // Floor rendering
        const pz = 0.5;
        const fyStart = Math.max(Math.floor(wallBottom), Math.floor(halfH));
        
        for (let fy = fyStart; fy < RENDER_HEIGHT; fy += 4) {
            const dy = fy - halfH - player.headBob;
            if (dy <= 0) continue;
            
            const floorDist = (pz * RENDER_HEIGHT) / dy;
            const floorX = player.x + floorDist * cos;
            const floorY = player.y + floorDist * sin;
            
            const mapX = Math.floor(floorX);
            const mapY = Math.floor(floorY);
            
            let r = 20, g = 20, b = 25; // Default out-of-bounds
            
            if (mapX >= 0 && mapX < MAP_COLS && mapY >= 0 && mapY < MAP_ROWS) {
                const tile = game.map[mapY][mapX];
                const fractX = floorX - mapX;
                const fractY = floorY - mapY;
                
                if (tile === TILE.EMPTY) {
                    // Cobblestone everywhere (adoquín gris)
                    const cobble = (Math.floor(floorX * 8) + Math.floor(floorY * 8)) % 2;
                    r = cobble ? 110 : 90; 
                    g = cobble ? 110 : 90; 
                    b = cobble ? 110 : 90;
                } else if (tile === TILE.GRASS) {
                    r = 30; g = 80; b = 30;
                } else if (tile === TILE.PLAZA) {
                    const checker = (Math.floor(fractX * 4) + Math.floor(fractY * 4)) % 2;
                    r = checker ? 170 : 150; g = checker ? 150 : 130; b = checker ? 130 : 110;
                }
            }
            
            const floorFog = Math.min(1, floorDist / 12);
            r = Math.floor(r * (1 - floorFog) + 10 * floorFog);
            g = Math.floor(g * (1 - floorFog) + 10 * floorFog);
            b = Math.floor(b * (1 - floorFog) + 30 * floorFog);
            
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(i, fy, 1, 4);
        }
    }
}

// ============================================
// SPRITE RENDERING
// ============================================
function renderSprites() {
    const { player, enemies, quevedos, jamones } = game;
    const { RENDER_WIDTH, RENDER_HEIGHT, FOV } = CONFIG;
    const ctx = game.bufCtx;
    const halfW = RENDER_WIDTH / 2;
    const halfH = RENDER_HEIGHT / 2;
    
    const sprites = [];
    
    // Items
    for (const item of game.items) {
        const dx = item.x - player.x;
        const dy = item.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        sprites.push({ type: item.type, dist, angle: Math.atan2(dy, dx), scale: item.scale, data: item });
    }
    
    // Enemies
    for (const enemy of enemies) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        sprites.push({ type: 'enemy', dist, angle: Math.atan2(dy, dx), scale: CONFIG.ENEMY_SPRITE_SCALE * (enemy.scale || 1), data: enemy });
    }
    
    // Quevedos
    for (const q of quevedos) {
        const dx = q.x - player.x;
        const dy = q.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        sprites.push({ type: 'quevedo', dist, angle: Math.atan2(dy, dx), scale: CONFIG.QUEVEDO_SPRITE_SCALE * (q.scale || 1), data: q });
    }
    
    // Jamones
    for (const jamon of jamones) {
        const dx = jamon.x - player.x;
        const dy = jamon.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        sprites.push({ type: 'jamon', dist, angle: Math.atan2(dy, dx), scale: CONFIG.JAMON_SPRITE_SCALE, data: jamon });
    }
    
    sprites.sort((a, b) => b.dist - a.dist);
    
    for (const sprite of sprites) {
        let relAngle = sprite.angle - player.angle;
        while (relAngle > Math.PI) relAngle -= Math.PI * 2;
        while (relAngle < -Math.PI) relAngle += Math.PI * 2;
        
        if (Math.abs(relAngle) > FOV * 0.7) continue;
        if (sprite.dist < 0.2) continue;
        
        const screenX = halfW + (relAngle / (FOV / 2)) * halfW;
        const spriteScale = RENDER_HEIGHT / sprite.dist;
        const spriteHeight = spriteScale * sprite.scale;
        const spriteWidth = spriteHeight;
        
        const drawX = screenX - spriteWidth / 2;
        
        // Place sprite firmly on the ground (Z=0.5 is player eye level)
        const spriteBottom = halfH + 0.5 * spriteScale + player.headBob;
        let drawY = spriteBottom - spriteHeight;
        
        // Bobbing effect and specific heights
        if (sprite.type === 'enemy' || sprite.type === 'quevedo') {
            drawY += Math.sin(sprite.data.bobPhase) * (spriteScale * 0.05);
        } else if (sprite.type === 'jamon') {
            drawY -= spriteScale * 0.3; // Make jamón fly mid-air
        }
        
        const fogFactor = Math.min(1, sprite.dist / 18);
        
        const startCol = Math.max(0, Math.floor(drawX));
        const endCol = Math.min(RENDER_WIDTH - 1, Math.floor(drawX + spriteWidth));
        
        if (sprite.type === 'enemy') {
            ctx.save();
            ctx.globalAlpha = 1 - fogFactor * 0.3; // Less fog on sprites to make them more defined
            
            if (game.enemyImgLoaded) {
                for (let col = startCol; col <= endCol; col++) {
                    if (col >= 0 && col < RENDER_WIDTH && sprite.dist < game.zBuffer[col]) {
                        const srcX = Math.floor(((col - drawX) / spriteWidth) * game.enemyImg.width);
                        ctx.drawImage(
                            game.enemyImg,
                            srcX, 0, 1, game.enemyImg.height,
                            col, drawY, 1, spriteHeight
                        );
                    }
                }
            } else {
                ctx.fillStyle = '#aaaaaa';
                for (let col = startCol; col <= endCol; col++) {
                    if (sprite.dist < game.zBuffer[col]) {
                        ctx.fillRect(col, drawY, 1, spriteHeight);
                    }
                }
            }
            
            // Hit flash (white flash when damaged)
            if (sprite.data.hitFlash > 0) {
                ctx.globalAlpha = sprite.data.hitFlash * 0.5;
                ctx.fillStyle = '#ffffff';
                for (let col = startCol; col <= endCol; col++) {
                    if (sprite.dist < game.zBuffer[col]) {
                        ctx.fillRect(col, drawY, 1, spriteHeight);
                    }
                }
            }
            
            ctx.restore();
            
            // Store screen position for dialogue
            sprite.data._screenX = screenX;
            sprite.data._screenY = drawY;
            sprite.data._onScreen = (screenX > -50 && screenX < RENDER_WIDTH + 50);
            sprite.data._spriteHeight = spriteHeight;
            
        } else if (sprite.type === 'quevedo') {
            ctx.save();
            ctx.globalAlpha = 1 - fogFactor * 0.3;
            
            if (game.quevedoImgLoaded) {
                for (let col = startCol; col <= endCol; col++) {
                    if (col >= 0 && col < RENDER_WIDTH && sprite.dist < game.zBuffer[col]) {
                        const srcX = Math.floor(((col - drawX) / spriteWidth) * game.quevedoImg.width);
                        ctx.drawImage(
                            game.quevedoImg,
                            srcX, 0, 1, game.quevedoImg.height,
                            col, drawY, 1, spriteHeight
                        );
                    }
                }
            } else {
                ctx.fillStyle = '#44aaff';
                for (let col = startCol; col <= endCol; col++) {
                    if (sprite.dist < game.zBuffer[col]) {
                        ctx.fillRect(col, drawY, 1, spriteHeight);
                    }
                }
            }
            
            ctx.restore();
            
        } else if (sprite.type === 'jamon') {
            // Render jamón
            ctx.save();
            ctx.globalAlpha = 1 - fogFactor * 0.3;
            
            if (game.jamonImgLoaded) {
                for (let col = startCol; col <= endCol; col++) {
                    if (col >= 0 && col < RENDER_WIDTH && sprite.dist < game.zBuffer[col]) {
                        const srcX = Math.floor(((col - drawX) / spriteWidth) * game.jamonImg.width);
                        ctx.drawImage(
                            game.jamonImg,
                            srcX, 0, 1, game.jamonImg.height,
                            col, drawY, 1, spriteHeight
                        );
                    }
                }
            }
            
            ctx.restore();
        } else if (sprite.type === 'marlboro') {
            // Render marlboro
            ctx.save();
            ctx.globalAlpha = 1 - fogFactor * 0.3;
            
            if (game.marlboroImgLoaded) {
                for (let col = startCol; col <= endCol; col++) {
                    if (col >= 0 && col < RENDER_WIDTH && sprite.dist < game.zBuffer[col]) {
                        const srcX = Math.floor(((col - drawX) / spriteWidth) * game.marlboroImg.width);
                        ctx.drawImage(
                            game.marlboroImg,
                            srcX, 0, 1, game.marlboroImg.height,
                            col, drawY, 1, spriteHeight
                        );
                    }
                }
            }
            
            ctx.restore();
        } else if (sprite.type === 'tutto') {
            // Render tutto (pizza)
            ctx.save();
            ctx.globalAlpha = 1 - fogFactor * 0.3;
            
            if (game.tuttoImgLoaded) {
                for (let col = startCol; col <= endCol; col++) {
                    if (col >= 0 && col < RENDER_WIDTH && sprite.dist < game.zBuffer[col]) {
                        const srcX = Math.floor(((col - drawX) / spriteWidth) * game.tuttoImg.width);
                        ctx.drawImage(
                            game.tuttoImg,
                            srcX, 0, 1, game.tuttoImg.height,
                            col, drawY, 1, spriteHeight
                        );
                    }
                }
            }
            
            ctx.restore();
        }
    }
}

// ============================================
// DIALOGUE SYSTEM
// ============================================
function updateDialogues(dt) {
    const p = game.player;
    
    for (const enemy of game.enemies) {
        const dx = p.x - enemy.x;
        const dy = p.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (enemy.dialogueCooldown === undefined) {
            enemy.dialogueCooldown = 0;
            enemy.currentPhrase = null;
            enemy.phraseTimer = 0;
            enemy.phraseIndex = -1;
        }
        
        if (enemy.dialogueCooldown > 0) enemy.dialogueCooldown -= dt * (1000 / 60);
        
        if (enemy.currentPhrase) {
            enemy.phraseTimer -= dt * (1000 / 60);
            if (enemy.phraseTimer <= 0) enemy.currentPhrase = null;
        }
        
        if (!enemy.currentPhrase && enemy.dialogueCooldown <= 0 &&
            dist < CONFIG.DIALOGUE_TRIGGER_DIST && dist > CONFIG.ENEMY_HIT_DIST) {
            
            let idx;
            do { idx = Math.floor(Math.random() * ENEMY_PHRASES.length); }
            while (idx === enemy.phraseIndex && ENEMY_PHRASES.length > 1);
            
            enemy.phraseIndex = idx;
            enemy.currentPhrase = ENEMY_PHRASES[idx];
            enemy.phraseTimer = CONFIG.DIALOGUE_DURATION;
            enemy.dialogueCooldown = CONFIG.DIALOGUE_COOLDOWN;
            
            if (dist < CONFIG.DIALOGUE_CLOSE_DIST) {
                enemy.dialogueCooldown = CONFIG.DIALOGUE_COOLDOWN * 0.5;
            }
        }
    }
}

function renderDialogues() {
    const { RENDER_WIDTH, RENDER_HEIGHT } = CONFIG;
    const scaleX = game.screenWidth / RENDER_WIDTH;
    const scaleY = game.screenHeight / RENDER_HEIGHT;
    const mainCtx = game.ctx;
    
    for (const enemy of game.enemies) {
        if (!enemy.currentPhrase || !enemy._onScreen) continue;
        
        const sx = enemy._screenX * scaleX;
        const sy = (enemy._screenY - 15) * scaleY;
        
        const totalDur = CONFIG.DIALOGUE_DURATION;
        const remaining = enemy.phraseTimer;
        let alpha = 1;
        if (remaining < 500) alpha = remaining / 500;
        if (remaining > totalDur - 300) alpha = (totalDur - remaining) / 300;
        alpha = Math.max(0, Math.min(1, alpha));
        if (alpha <= 0) continue;
        
        const text = enemy.currentPhrase;
        const fontSize = Math.max(11, Math.min(16, game.screenWidth / 30));
        mainCtx.font = `bold ${fontSize}px 'Inter', sans-serif`;
        const metrics = mainCtx.measureText(text);
        const textW = metrics.width;
        const padX = 10, padY = 6;
        const bubbleW = textW + padX * 2;
        const bubbleH = fontSize + 4 + padY * 2;
        
        let bx = Math.max(4, Math.min(game.screenWidth - bubbleW - 4, sx - bubbleW / 2));
        let by = Math.max(40, sy - bubbleH - 5);
        
        mainCtx.save();
        mainCtx.globalAlpha = alpha;
        
        // Bubble background
        mainCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        mainCtx.beginPath();
        mainCtx.roundRect(bx, by, bubbleW, bubbleH, 8);
        mainCtx.fill();
        
        // Bubble border — white, no red
        mainCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        mainCtx.lineWidth = 1;
        mainCtx.beginPath();
        mainCtx.roundRect(bx, by, bubbleW, bubbleH, 8);
        mainCtx.stroke();
        
        // Tail
        const tailX = Math.max(bx + 15, Math.min(bx + bubbleW - 15, sx));
        mainCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        mainCtx.beginPath();
        mainCtx.moveTo(tailX - 6, by + bubbleH);
        mainCtx.lineTo(tailX, by + bubbleH + 8);
        mainCtx.lineTo(tailX + 6, by + bubbleH);
        mainCtx.fill();
        
        // Text
        mainCtx.fillStyle = '#fff';
        mainCtx.textAlign = 'left';
        mainCtx.textBaseline = 'middle';
        mainCtx.fillText(text, bx + padX, by + bubbleH / 2);
        
        mainCtx.restore();
    }
}

// ============================================
// CROSSHAIR
// ============================================
function renderCrosshair() {
    const ctx = game.bufCtx;
    const cx = CONFIG.RENDER_WIDTH / 2;
    const cy = CONFIG.RENDER_HEIGHT / 2 + game.player.headBob;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy); ctx.lineTo(cx - 2, cy);
    ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 6, cy);
    ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy - 2);
    ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy + 6);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 51, 102, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

// ============================================
// SKY (thin strip — buildings cover most)
// ============================================
function renderSky() {
    const ctx = game.bufCtx;
    const { RENDER_WIDTH, RENDER_HEIGHT } = CONFIG;
    const halfH = RENDER_HEIGHT / 2;
    
    // Deep red/purple nightmare sky
    const grad = ctx.createLinearGradient(0, 0, 0, halfH);
    grad.addColorStop(0, '#0a0414');
    grad.addColorStop(0.4, '#1b0d2d');
    grad.addColorStop(1, '#3b1228');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, RENDER_WIDTH, halfH + 10);
    
    // Distant Blood Moon relative to player rotation
    const moonAngle = Math.PI * 0.25; // Fixed angle in world
    let diffAngle = moonAngle - game.player.angle;
    while(diffAngle > Math.PI) diffAngle -= Math.PI * 2;
    while(diffAngle < -Math.PI) diffAngle += Math.PI * 2;
    
    if (Math.abs(diffAngle) < CONFIG.FOV * 1.5) {
        const screenX = (RENDER_WIDTH / 2) + (diffAngle / CONFIG.FOV) * RENDER_WIDTH;
        
        ctx.fillStyle = '#ff2a4a';
        ctx.shadowBlur = 60;
        ctx.shadowColor = '#ff2a4a';
        ctx.beginPath();
        ctx.arc(screenX, halfH * 0.35, RENDER_WIDTH * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
    
    // Stars
    ctx.fillStyle = 'rgba(255, 180, 180, 0.4)';
    for (let i = 0; i < 40; i++) {
        const sx = ((42 * (i + 1) * 73 + game.player.angle * -180) % RENDER_WIDTH + RENDER_WIDTH) % RENDER_WIDTH;
        const sy = ((42 * (i + 1) * 137) % (halfH * 0.7));
        const sz = ((i * 31) % 2) + 0.5;
        const twinkle = Math.sin(performance.now() / 1000 + i * 1.7) * 0.4 + 0.6;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(sx, sy, sz, sz);
    }
    ctx.globalAlpha = 1;
}

// ============================================
// MINIMAP
// ============================================
function renderMinimap() {
    const { mmCtx, player, enemies, quevedos, jamones, map } = game;
    const { MAP_COLS, MAP_ROWS } = CONFIG;
    const mmSize = 110;
    const cellSize = mmSize / MAP_COLS;
    
    mmCtx.clearRect(0, 0, mmSize, mmSize);
    
    for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
            const tile = map[y][x];
            if (isWall(tile)) mmCtx.fillStyle = 'rgba(180, 140, 100, 0.6)';
            else if (tile === TILE.GRASS) mmCtx.fillStyle = 'rgba(60, 120, 50, 0.4)';
            else if (tile === TILE.PLAZA) mmCtx.fillStyle = 'rgba(200, 180, 150, 0.3)';
            else mmCtx.fillStyle = 'rgba(60, 60, 80, 0.3)';
            mmCtx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
    }
    
    // Enemies
    mmCtx.fillStyle = '#ff3366';
    for (const e of enemies) {
        mmCtx.beginPath();
        mmCtx.arc(e.x * cellSize, e.y * cellSize, 2.5, 0, Math.PI * 2);
        mmCtx.fill();
    }
    
    // Quevedos
    mmCtx.fillStyle = '#44aaff';
    for (const q of quevedos) {
        mmCtx.beginPath();
        mmCtx.arc(q.x * cellSize, q.y * cellSize, 2.5, 0, Math.PI * 2);
        mmCtx.fill();
    }
    
    // Jamones
    mmCtx.fillStyle = '#ffaa44';
    for (const j of jamones) {
        mmCtx.fillRect(j.x * cellSize - 1, j.y * cellSize - 1, 2, 2);
    }
    
    // Player
    mmCtx.fillStyle = '#00ff88';
    mmCtx.beginPath();
    mmCtx.arc(player.x * cellSize, player.y * cellSize, 3, 0, Math.PI * 2);
    mmCtx.fill();
    
    mmCtx.strokeStyle = '#00ff88';
    mmCtx.lineWidth = 1.5;
    mmCtx.beginPath();
    mmCtx.moveTo(player.x * cellSize, player.y * cellSize);
    mmCtx.lineTo(
        (player.x + Math.cos(player.angle) * 2.5) * cellSize,
        (player.y + Math.sin(player.angle) * 2.5) * cellSize
    );
    mmCtx.stroke();
}

// ============================================
// QUEVEDO SYSTEM
// ============================================
function spawnQuevedo() {
    if (game.quevedos.length >= CONFIG.QUEVEDO_MAX) return;
    
    const p = game.player;
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 6;
    let ex = p.x + Math.cos(angle) * dist;
    let ey = p.y + Math.sin(angle) * dist;
    
    ex = Math.max(1.5, Math.min(CONFIG.MAP_COLS - 1.5, ex));
    ey = Math.max(1.5, Math.min(CONFIG.MAP_ROWS - 1.5, ey));
    
    if (!isSafeSpawn(ex, ey)) {
        let found = false;
        for (let attempt = 0; attempt < 50; attempt++) {
            const tx = ex + (Math.random() - 0.5) * 8;
            const ty = ey + (Math.random() - 0.5) * 8;
            if (isSafeSpawn(tx, ty)) { ex = tx; ey = ty; found = true; break; }
        }
        if (!found) return; // Wait for next tick if no safe spot
    }
    
    const quevedo = {
        x: ex, y: ey,
        hp: 5,
        speed: CONFIG.QUEVEDO_SPEED + Math.random() * 0.005,
        bobPhase: Math.random() * Math.PI * 2,
        scale: 0.85 + Math.random() * 0.1,
        lastAttackTime: 0,
        _screenX: 0, _screenY: 0, _onScreen: false, _spriteHeight: 0,
        audioSource: null,
        audioGain: null,
        songIdx: -1,
    };
    
    game.quevedos.push(quevedo);
    
    if (game.songsLoaded) {
        assignQuevedoAudio(quevedo);
    }
}

function updateQuevedos(dt) {
    const p = game.player;
    const now = performance.now();
    
    for (let i = game.quevedos.length - 1; i >= 0; i--) {
        const q = game.quevedos[i];
        
        // Find nearest enemy
        let targetEnemy = null;
        let minDist = Infinity;
        let targetIndex = -1;
        
        for (let e = 0; e < game.enemies.length; e++) {
            const enemy = game.enemies[e];
            const dx = enemy.x - q.x;
            const dy = enemy.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                targetEnemy = enemy;
                targetIndex = e;
            }
        }
        
        // Determine target position: nearest enemy, or player if no enemies
        let targetX = p.x;
        let targetY = p.y;
        let distToTarget = Math.sqrt((p.x - q.x)**2 + (p.y - q.y)**2);
        
        if (targetEnemy && minDist < 15) {
            targetX = targetEnemy.x;
            targetY = targetEnemy.y;
            distToTarget = minDist;
            
            // Attack!
            if (minDist < CONFIG.QUEVEDO_HIT_DIST) {
                if (now - q.lastAttackTime > CONFIG.QUEVEDO_ATTACK_COOLDOWN) {
                    q.lastAttackTime = now;
                    targetEnemy.hp--;
                    targetEnemy.hitFlash = 1;
                    
                    if (targetEnemy.hp <= 0) {
                        removeEnemy(targetIndex);
                        game.score += 200;
                    }
                }
            }
        } else {
            // Stay near player but don't get too close
            if (distToTarget < 3) {
                targetX = q.x;
                targetY = q.y;
            }
        }
        
        if (distToTarget > 0.5) {
            const dx = targetX - q.x;
            const dy = targetY - q.y;
            const speed = q.speed * dt;
            const moveX = (dx / distToTarget) * speed;
            const moveY = (dy / distToTarget) * speed;
            
            const newX = q.x + moveX;
            const newY = q.y + moveY;
            
            if (isWalkable(newX, newY)) { q.x = newX; q.y = newY; }
            else if (isWalkable(newX, q.y)) { q.x = newX; }
            else if (isWalkable(q.x, newY)) { q.y = newY; }
            else {
                const slideAngle = Math.atan2(dy, dx);
                const sx = q.x + Math.cos(slideAngle + Math.PI / 4) * speed;
                const sy = q.y + Math.sin(slideAngle + Math.PI / 4) * speed;
                if (isWalkable(sx, sy)) { q.x = sx; q.y = sy; }
            }
        }
        
        q.bobPhase += 0.05 * dt;
        
        // Let Quevedo sing lyrics
        if (q._onScreen && distToTarget < 10 && Math.random() < 0.005) {
            if (now - (q.lastPhraseTime || 0) > 4000) {
                q.lastPhraseTime = now;
                q.phraseIndex = Math.floor(Math.random() * QUEVEDO_PHRASES.length);
                const qPhrase = {
                    text: QUEVEDO_PHRASES[q.phraseIndex],
                    timer: CONFIG.DIALOGUE_DURATION,
                    target: q
                };
                game.dialogues.push(qPhrase);
            }
        }
        
        if (!q.audioSource && game.songsLoaded) {
            assignQuevedoAudio(q);
        }
        updateEntityAudio(q);
    }
    
    // Spawn timer
    game.quevedoSpawnTimer += dt * (1000 / 60);
    const spawnInterval = CONFIG.QUEVEDO_SPAWN_INTERVAL / (1 + game.elapsed / 120000);
    if (game.quevedoSpawnTimer > spawnInterval) {
        game.quevedoSpawnTimer = 0;
        spawnQuevedo();
    }
}

// ============================================
// ENEMY SYSTEM
// ============================================
function spawnEnemy() {
    if (game.enemies.length >= CONFIG.ENEMY_MAX) return;
    
    const p = game.player;
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 6;
    let ex = p.x + Math.cos(angle) * dist;
    let ey = p.y + Math.sin(angle) * dist;
    
    ex = Math.max(1.5, Math.min(CONFIG.MAP_COLS - 1.5, ex));
    ey = Math.max(1.5, Math.min(CONFIG.MAP_ROWS - 1.5, ey));
    
    if (!isSafeSpawn(ex, ey)) {
        let found = false;
        for (let attempt = 0; attempt < 50; attempt++) {
            const tx = ex + (Math.random() - 0.5) * 8;
            const ty = ey + (Math.random() - 0.5) * 8;
            if (isSafeSpawn(tx, ty)) { ex = tx; ey = ty; found = true; break; }
        }
        if (!found) return; // Wait for next tick if no safe spot
    }
    
    const enemy = {
        x: ex, y: ey,
        speed: CONFIG.ENEMY_SPEED + Math.random() * 0.008,
        hp: CONFIG.ENEMY_HEALTH,
        hitFlash: 0,
        lastDamageTime: 0,
        bobPhase: Math.random() * Math.PI * 2,
        scale: 0.85 + Math.random() * 0.3,
        dialogueCooldown: Math.random() * 3000,
        currentPhrase: null,
        phraseTimer: 0,
        phraseIndex: -1,
        _screenX: 0, _screenY: 0, _onScreen: false, _spriteHeight: 0,
        // Audio
        audioSource: null,
        audioGain: null,
        songIdx: -1,
    };
    
    game.enemies.push(enemy);
    
    // Assign music
    if (game.songsLoaded) {
        assignEnemyAudio(enemy);
    }
}

function removeEnemy(index) {
    const enemy = game.enemies[index];
    stopEntityAudio(enemy);
    game.enemies.splice(index, 1);
}

function removeQuevedo(index) {
    const q = game.quevedos[index];
    stopEntityAudio(q);
    game.quevedos.splice(index, 1);
}

function updateEnemies(dt) {
    const p = game.player;
    const now = performance.now();
    
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        
        // Target player or nearest Quevedo
        let targetX = p.x;
        let targetY = p.y;
        let targetType = 'player';
        let targetIndex = -1;
        let dist = Math.sqrt((p.x - enemy.x)**2 + (p.y - enemy.y)**2);
        
        for (let j = 0; j < game.quevedos.length; j++) {
            const q = game.quevedos[j];
            const d = Math.sqrt((q.x - enemy.x)**2 + (q.y - enemy.y)**2);
            if (d < dist) {
                dist = d;
                targetX = q.x;
                targetY = q.y;
                targetType = 'quevedo';
                targetIndex = j;
            }
        }
        
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        
        if (dist > 0.3) {
            const speed = enemy.speed * dt;
            const moveX = (dx / dist) * speed;
            const moveY = (dy / dist) * speed;
            
            const newX = enemy.x + moveX;
            const newY = enemy.y + moveY;
            
            if (isWalkable(newX, newY)) { enemy.x = newX; enemy.y = newY; }
            else if (isWalkable(newX, enemy.y)) { enemy.x = newX; }
            else if (isWalkable(enemy.x, newY)) { enemy.y = newY; }
            else {
                const slideAngle = Math.atan2(dy, dx);
                const sx = enemy.x + Math.cos(slideAngle + Math.PI / 4) * speed;
                const sy = enemy.y + Math.sin(slideAngle + Math.PI / 4) * speed;
                if (isWalkable(sx, sy)) { enemy.x = sx; enemy.y = sy; }
            }
        }
        
        enemy.bobPhase += 0.04 * dt;
        
        // Hit flash decay
        if (enemy.hitFlash > 0) enemy.hitFlash -= 0.05 * dt;
        
        // Assign audio if songs loaded late
        if (!enemy.audioSource && game.songsLoaded) {
            assignEnemyAudio(enemy);
        }
        
        // Update spatial audio
        updateEntityAudio(enemy);
        
        // Damage on contact
        if (dist < CONFIG.ENEMY_HIT_DIST) {
            if (targetType === 'player') {
                if (now - p.lastDamageTime > CONFIG.ENEMY_DAMAGE_COOLDOWN) {
                    p.health -= CONFIG.ENEMY_DAMAGE;
                    p.lastDamageTime = now;
                    p.flashTimer = 400;
                    triggerDamageVignette();
                    
                    const kAngle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
                    const kx = p.x + Math.cos(kAngle) * 0.3;
                    const ky = p.y + Math.sin(kAngle) * 0.3;
                    if (isWalkable(kx, ky)) { p.x = kx; p.y = ky; }
                }
            } else if (targetType === 'quevedo') {
                if (now - (enemy.lastAttackTime || 0) > 1000) {
                    enemy.lastAttackTime = now;
                    const q = game.quevedos[targetIndex];
                    q.hp -= 1;
                    if (q.hp <= 0) {
                        removeQuevedo(targetIndex);
                    }
                }
            }
        }
    }
    
    // Spawn timer
    game.enemySpawnTimer += dt * (1000 / 60);
    const spawnInterval = CONFIG.ENEMY_SPAWN_INTERVAL / (1 + game.elapsed / 60000);
    if (game.enemySpawnTimer > spawnInterval) {
        game.enemySpawnTimer = 0;
        spawnEnemy();
    }
}

// ============================================
// JAMÓN SYSTEM
// ============================================
function throwJamon() {
    const p = game.player;
    const now = performance.now();
    
    if (now - p.lastJamonTime < CONFIG.JAMON_COOLDOWN) return;
    p.lastJamonTime = now;
    
    game.jamones.push({
        x: p.x + Math.cos(p.angle) * 0.4,
        y: p.y + Math.sin(p.angle) * 0.4,
        vx: Math.cos(p.angle) * CONFIG.JAMON_SPEED,
        vy: Math.sin(p.angle) * CONFIG.JAMON_SPEED,
        life: CONFIG.JAMON_LIFETIME,
        rotation: 0,
    });
}

function updateJamones(dt) {
    const dtMs = dt * (1000 / 60);
    
    for (let i = game.jamones.length - 1; i >= 0; i--) {
        const j = game.jamones[i];
        
        j.x += j.vx * dt;
        j.y += j.vy * dt;
        j.life -= dtMs;
        j.rotation += 0.15 * dt;
        
        // Remove if expired or hit wall
        if (j.life <= 0 || !isWalkable(j.x, j.y)) {
            game.jamones.splice(i, 1);
            continue;
        }
        
        // Check hit enemies
        for (let e = game.enemies.length - 1; e >= 0; e--) {
            const enemy = game.enemies[e];
            const dx = j.x - enemy.x;
            const dy = j.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < CONFIG.JAMON_HIT_DIST) {
                // Hit!
                enemy.hp--;
                enemy.hitFlash = 1;
                game.score += 50;
                
                // Knockback enemy
                const kAngle = Math.atan2(enemy.y - j.y, enemy.x - j.x);
                const kx = enemy.x + Math.cos(kAngle) * 0.3;
                const ky = enemy.y + Math.sin(kAngle) * 0.3;
                if (isWalkable(kx, ky)) { enemy.x = kx; enemy.y = ky; }
                
                // Remove jamón
                game.jamones.splice(i, 1);
                
                // Kill enemy if no hp
                if (enemy.hp <= 0) {
                    removeEnemy(e);
                    game.score += 200;
                }
                
                break;
            }
        }
    }
}

// ============================================
// ITEMS SYSTEM
// ============================================
function spawnItem() {
    if (game.items.length >= 5) return;
    
    let ex, ey;
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
        ex = 1.5 + Math.random() * (CONFIG.MAP_COLS - 3);
        ey = 1.5 + Math.random() * (CONFIG.MAP_ROWS - 3);
        if (isWalkable(ex, ey)) { found = true; break; }
    }
    
    if (!found) return;
    
    // 50% chance for Marlboro, 50% chance for Tutto
    const type = Math.random() > 0.5 ? 'marlboro' : 'tutto';
    
    game.items.push({
        x: ex, y: ey,
        type: type,
        scale: 0.5,
    });
}

function updateItems(dt) {
    const p = game.player;
    
    // Spawn logic
    if (Math.random() < 0.005) {
        spawnItem();
    }
    
    // Collision with player
    for (let i = game.items.length - 1; i >= 0; i--) {
        const item = game.items[i];
        const dx = item.x - p.x;
        const dy = item.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 0.6) {
            // Collect
            p.health = Math.min(CONFIG.PLAYER_MAX_HEALTH, p.health + 20);
            
            // Visual feedback for heal (green flash)
            const el = document.getElementById('damage-vignette');
            if (el) {
                el.style.background = 'radial-gradient(circle, transparent 50%, rgba(50, 255, 50, 0.4) 100%)';
                el.classList.remove('active');
                void el.offsetWidth;
                el.classList.add('active');
                
                // Reset color after animation
                setTimeout(() => {
                    el.style.background = 'radial-gradient(circle, transparent 50%, rgba(255, 0, 0, 0.4) 100%)';
                }, 400);
            }
            
            game.items.splice(i, 1);
        }
    }
}

// ============================================
// DAMAGE VIGNETTE
// ============================================
function triggerDamageVignette() {
    const el = document.getElementById('damage-vignette');
    if (el) {
        el.classList.remove('active');
        void el.offsetWidth;
        el.classList.add('active');
    }
}

// ============================================
// MAIN RENDER
// ============================================
function render() {
    const { ctx, buffer } = game;
    
    renderSky();
    castRays();
    renderSprites();
    renderCrosshair();
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer, 0, 0, game.screenWidth, game.screenHeight);
    
    renderDialogues();
    renderMinimap();
}

// ============================================
// UPDATE
// ============================================
function update(dt) {
    const p = game.player;
    const { input } = game;
    
    let moveF = 0, moveS = 0, rot = 0;
    
    if (input.keys['KeyW'] || input.keys['ArrowUp']) moveF += 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) moveF -= 1;
    if (input.keys['KeyA']) moveS -= 1;
    if (input.keys['KeyD']) moveS += 1;
    if (input.keys['ArrowLeft']) rot -= 1;
    if (input.keys['ArrowRight']) rot += 1;
    
    // Attack with Space or F
    if (input.keys['Space'] || input.keys['KeyF'] || input.attack) {
        throwJamon();
        input.attack = false;
    }
    
    if (input.joyDx !== 0 || input.joyDy !== 0) {
        moveF -= input.joyDy;
        moveS += input.joyDx;
    }
    
    if (input.rotDelta !== 0) {
        rot += input.rotDelta;
        input.rotDelta = 0;
    }
    
    p.angle += rot * CONFIG.PLAYER_ROT_SPEED * dt;
    while (p.angle > Math.PI * 2) p.angle -= Math.PI * 2;
    while (p.angle < 0) p.angle += Math.PI * 2;
    
    const moveMag = Math.sqrt(moveF * moveF + moveS * moveS);
    if (moveMag > 1) { moveF /= moveMag; moveS /= moveMag; }
    
    const wantSprint = input.sprint || input.keys['ShiftLeft'] || input.keys['ShiftRight'];
    if (wantSprint && p.sprintEnergy > 0 && moveMag > 0.1) {
        p.sprinting = true;
        p.sprintEnergy -= dt * (1000 / 60);
    } else {
        p.sprinting = false;
        if (!wantSprint) p.sprintEnergy = Math.min(CONFIG.PLAYER_SPRINT_DURATION, p.sprintEnergy + dt * (1000 / 60) * 0.3);
    }
    
    const speed = (p.sprinting ? CONFIG.PLAYER_SPRINT_SPEED : CONFIG.PLAYER_SPEED) * dt;
    const cosA = Math.cos(p.angle);
    const sinA = Math.sin(p.angle);
    const dx = (cosA * moveF - sinA * moveS) * speed;
    const dy = (sinA * moveF + cosA * moveS) * speed;
    
    const r = CONFIG.PLAYER_RADIUS;
    const newX = p.x + dx;
    if (isWalkable(newX + r, p.y) && isWalkable(newX - r, p.y) &&
        isWalkable(newX + r, p.y + r) && isWalkable(newX - r, p.y - r) &&
        isWalkable(newX + r, p.y - r) && isWalkable(newX - r, p.y + r)) p.x = newX;
    
    const newY = p.y + dy;
    if (isWalkable(p.x + r, newY) && isWalkable(p.x - r, newY) &&
        isWalkable(p.x + r, newY + r) && isWalkable(p.x - r, newY - r) &&
        isWalkable(p.x + r, newY - r) && isWalkable(p.x - r, newY + r)) p.y = newY;
    
    p.x = Math.max(1.5, Math.min(CONFIG.MAP_COLS - 1.5, p.x));
    p.y = Math.max(1.5, Math.min(CONFIG.MAP_ROWS - 1.5, p.y));
    
    if (moveMag > 0.1) {
        p.headBobSpeed += dt * (p.sprinting ? 0.25 : 0.15);
        p.headBob = Math.sin(p.headBobSpeed) * (p.sprinting ? 4 : 2);
    } else {
        p.headBob *= 0.9;
        p.headBobSpeed *= 0.95;
    }
    
    if (p.flashTimer > 0) p.flashTimer -= dt * (1000 / 60);
    
    updateEnemies(dt);
    updateQuevedos(dt);
    updateJamones(dt);
    updateItems(dt);
    updateDialogues(dt);
    
    game.elapsed += dt * (1000 / 60);
    game.scoreTimer += dt;
    if (game.scoreTimer >= 60) { game.score += 10; game.scoreTimer = 0; }
    
    // HUD
    const healthFill = document.getElementById('health-fill');
    if (healthFill) {
        const pct = Math.max(0, p.health / CONFIG.PLAYER_MAX_HEALTH * 100);
        healthFill.style.width = pct + '%';
        if (pct < 30) healthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff3333)';
        else if (pct < 60) healthFill.style.background = 'linear-gradient(90deg, #ff6633, #ffaa33)';
        else healthFill.style.background = 'linear-gradient(90deg, #ff3366, #ff6699)';
    }
    
    document.getElementById('score-value').textContent = game.score;
    const totalSec = Math.floor(game.elapsed / 1000);
    document.getElementById('timer-value').textContent = `${Math.floor(totalSec/60)}:${(totalSec%60).toString().padStart(2,'0')}`;
    document.getElementById('enemies-value').textContent = game.enemies.length;
    
    if (p.health <= 0) gameOver();
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop(timestamp) {
    if (!game.running) return;
    const dt = Math.min((timestamp - game.lastTime) / 16.667, 3);
    game.lastTime = timestamp;
    update(dt);
    render();
    requestAnimationFrame(gameLoop);
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================
function startGame() {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('gameover-screen').style.display = 'none';
    
    // Resume AudioContext (required after user gesture)
    if (game.audioCtx && game.audioCtx.state === 'suspended') {
        game.audioCtx.resume();
    }
    
    // Stop any existing audio
    for (const e of game.enemies) stopEntityAudio(e);
    for (const q of game.quevedos) stopEntityAudio(q);
    
    game.score = 0;
    game.elapsed = 0;
    game.enemySpawnTimer = 0;
    game.quevedoSpawnTimer = 0;
    game.scoreTimer = 0;
    game.enemies = [];
    game.quevedos = [];
    game.jamones = [];
    game.dialogues = [];
    
    generateMap();
    
    const cx = Math.floor(CONFIG.MAP_COLS / 2);
    const cy = Math.floor(CONFIG.MAP_ROWS / 2);
    outer:
    for (let r = 0; r < 15; r++) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const tx = cx + dx;
                const ty = cy + dy;
                if (tx >= 0 && tx < CONFIG.MAP_COLS && ty >= 0 && ty < CONFIG.MAP_ROWS) {
                    if (!isWall(game.map[ty][tx])) {
                        game.player.x = tx + 0.5;
                        game.player.y = ty + 0.5;
                        break outer;
                    }
                }
            }
        }
    }
    
    game.player.angle = 0;
    game.player.health = CONFIG.PLAYER_MAX_HEALTH;
    game.player.sprinting = false;
    game.player.sprintEnergy = CONFIG.PLAYER_SPRINT_DURATION;
    game.player.flashTimer = 0;
    game.player.lastDamageTime = 0;
    game.player.lastJamonTime = 0;
    game.player.headBob = 0;
    game.player.headBobSpeed = 0;
    
    for (let i = 0; i < CONFIG.INITIAL_ENEMIES; i++) spawnEnemy();
    spawnQuevedo(); // Start with 1 Quevedo
    
    if (window.innerWidth > 768) {
        game.canvas.addEventListener('click', requestPointerLock);
    }
    
    game.running = true;
    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function requestPointerLock() {
    if (!game.input.mouseLocked) game.canvas.requestPointerLock();
}

function gameOver() {
    game.running = false;
    if (document.pointerLockElement) document.exitPointerLock();
    
    // Stop all audio
    for (const e of game.enemies) stopEntityAudio(e);
    for (const q of game.quevedos) stopEntityAudio(q);
    
    document.getElementById('gameover-screen').style.display = 'flex';
    const totalSec = Math.floor(game.elapsed / 1000);
    document.getElementById('final-time').textContent = `${Math.floor(totalSec/60)}:${(totalSec%60).toString().padStart(2,'0')}`;
    document.getElementById('final-score').textContent = game.score;
}

// ============================================
// INPUT HANDLING
// ============================================
function setupInput() {
    window.addEventListener('keydown', (e) => {
        game.input.keys[e.code] = true;
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { game.input.keys[e.code] = false; });
    
    document.addEventListener('pointerlockchange', () => {
        game.input.mouseLocked = !!document.pointerLockElement;
    });
    document.addEventListener('mousemove', (e) => {
        if (game.input.mouseLocked && game.running) game.input.rotDelta += e.movementX * 0.08;
    });
    
    // Mouse click to throw jamón (when pointer locked)
    document.addEventListener('mousedown', (e) => {
        if (game.input.mouseLocked && game.running && e.button === 0) {
            throwJamon();
        }
    });
    
    // Joystick
    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');
    
    if (joystickZone) {
        joystickZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            game.input.joyTouchId = touch.identifier;
            const rect = joystickBase.getBoundingClientRect();
            game.input.joyStartX = rect.left + rect.width / 2;
            game.input.joyStartY = rect.top + rect.height / 2;
        }, { passive: false });
        
        joystickZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (touch.identifier === game.input.joyTouchId) {
                    const dx = touch.clientX - game.input.joyStartX;
                    const dy = touch.clientY - game.input.joyStartY;
                    const maxDist = 45;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const clamped = Math.min(dist, maxDist);
                    const angle = Math.atan2(dy, dx);
                    joystickThumb.style.transform = `translate(${Math.cos(angle)*clamped}px, ${Math.sin(angle)*clamped}px)`;
                    if (dist > 6) {
                        game.input.joyDx = dx / Math.max(dist, maxDist);
                        game.input.joyDy = dy / Math.max(dist, maxDist);
                    } else { game.input.joyDx = 0; game.input.joyDy = 0; }
                }
            }
        }, { passive: false });
        
        const resetJoy = (e) => {
            for (const touch of e.changedTouches) {
                if (touch.identifier === game.input.joyTouchId) {
                    game.input.joyTouchId = null;
                    game.input.joyDx = 0; game.input.joyDy = 0;
                    joystickThumb.style.transform = 'translate(0,0)';
                }
            }
        };
        joystickZone.addEventListener('touchend', resetJoy);
        joystickZone.addEventListener('touchcancel', resetJoy);
    }
    
    // Look zone
    const lookZone = document.getElementById('look-zone');
    if (lookZone) {
        lookZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            game.input.lookTouchId = touch.identifier;
            game.input.lookLastX = touch.clientX;
        }, { passive: false });
        
        lookZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (touch.identifier === game.input.lookTouchId) {
                    const dx = touch.clientX - game.input.lookLastX;
                    game.input.rotDelta += dx * 0.12;
                    game.input.lookLastX = touch.clientX;
                }
            }
        }, { passive: false });
        
        const resetLook = (e) => {
            for (const touch of e.changedTouches) {
                if (touch.identifier === game.input.lookTouchId) game.input.lookTouchId = null;
            }
        };
        lookZone.addEventListener('touchend', resetLook);
        lookZone.addEventListener('touchcancel', resetLook);
    }
    
    // Sprint
    const sprintBtn = document.getElementById('sprint-btn');
    if (sprintBtn) {
        sprintBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); game.input.sprint = true; sprintBtn.classList.add('active');
        }, { passive: false });
        const resetSprint = () => { game.input.sprint = false; sprintBtn.classList.remove('active'); };
        sprintBtn.addEventListener('touchend', (e) => { e.preventDefault(); resetSprint(); });
        sprintBtn.addEventListener('touchcancel', resetSprint);
    }
    
    // Attack button (mobile)
    const attackBtn = document.getElementById('attack-btn');
    if (attackBtn) {
        attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            throwJamon();
            attackBtn.classList.add('active');
        }, { passive: false });
        const resetAttack = () => { attackBtn.classList.remove('active'); };
        attackBtn.addEventListener('touchend', (e) => { e.preventDefault(); resetAttack(); });
        attackBtn.addEventListener('touchcancel', resetAttack);
    }
}

// ============================================
// CANVAS SETUP
// ============================================
function resizeCanvas() {
    const canvas = game.canvas;
    game.screenWidth = window.innerWidth;
    game.screenHeight = window.innerHeight;
    canvas.width = game.screenWidth;
    canvas.height = game.screenHeight;
    canvas.style.width = game.screenWidth + 'px';
    canvas.style.height = game.screenHeight + 'px';
    game.ctx = canvas.getContext('2d');
    game.ctx.imageSmoothingEnabled = false;
    
    const isMobile = window.innerWidth <= 768;
    game.renderWidth = isMobile ? 320 : 480;
    game.renderHeight = isMobile ? 200 : 320;
    game.buffer.width = game.renderWidth;
    game.buffer.height = game.renderHeight;
    game.bufCtx = game.buffer.getContext('2d');
    game.bufCtx.imageSmoothingEnabled = false;
    
    game.mmCanvas.width = 110;
    game.mmCanvas.height = 110;
    game.mmCtx = game.mmCanvas.getContext('2d');
    
    CONFIG.RENDER_WIDTH = game.renderWidth;
    CONFIG.RENDER_HEIGHT = game.renderHeight;
}

// ============================================
// TITLE PARTICLES
// ============================================
function initTitleParticles() {
    const container = document.getElementById('title-particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = 2 + Math.random() * 4;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px; height: ${size}px;
            background: rgba(${Math.random() > 0.5 ? '255, 51, 102' : '179, 102, 255'}, ${0.2 + Math.random() * 0.4});
            border-radius: 50%;
            left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
            animation: floatParticle ${4 + Math.random() * 8}s ease-in-out infinite;
            animation-delay: ${Math.random() * -10}s;
        `;
        container.appendChild(particle);
    }
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            25% { transform: translate(20px, -30px) scale(1.2); opacity: 0.7; }
            50% { transform: translate(-10px, -50px) scale(0.8); opacity: 0.5; }
            75% { transform: translate(15px, -20px) scale(1.1); opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.buffer = document.createElement('canvas');
    game.mmCanvas = document.getElementById('minimapCanvas');
    
    game.enemyImg = new Image();
    game.enemyImg.onload = () => { game.enemyImgLoaded = true; };
    game.enemyImg.onerror = () => { console.warn('Could not load enemigo1.png'); };
    game.enemyImg.src = 'enemigo1.png';
    
    game.quevedoImg = new Image();
    game.quevedoImg.onload = () => { game.quevedoImgLoaded = true; };
    game.quevedoImg.onerror = () => { console.warn('Could not load quevedo.png'); };
    game.quevedoImg.src = 'quevedo.png';
    
    game.jamonImg = new Image();
    game.jamonImg.onload = () => { game.jamonImgLoaded = true; };
    game.jamonImg.onerror = () => { console.warn('Could not load jamon.png'); };
    game.jamonImg.src = 'jamon.png';
    
    game.chelcapuImg = new Image();
    game.chelcapuImg.onload = () => { game.chelcapuImgLoaded = true; };
    game.chelcapuImg.onerror = () => { console.warn('Could not load chelcapu.jpg'); };
    game.chelcapuImg.src = 'chelcapu.jpg';
    
    game.marlboroImg = new Image();
    game.marlboroImg.onload = () => { game.marlboroImgLoaded = true; };
    game.marlboroImg.onerror = () => { console.warn('Could not load marlboro.png'); };
    game.marlboroImg.src = 'marlboro.png';
    
    game.tuttoImg = new Image();
    game.tuttoImg.onload = () => { game.tuttoImgLoaded = true; };
    game.tuttoImg.onerror = () => { console.warn('Could not load tutto.png'); };
    game.tuttoImg.src = 'tutto.png';
    
    const propFiles = ['propaganda1.png', 'propaganda2.jpg', 'propaganda3.jpeg'];
    game.propagandaImgs = propFiles.map((file, i) => {
        const img = new Image();
        img.onload = () => { game.propagandaLoaded[i] = true; };
        img.onerror = () => { console.warn('Could not load', file); };
        img.src = file;
        return img;
    });
    
    initAudio();
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    document.addEventListener('touchmove', (e) => {
        if (game.running) e.preventDefault();
    }, { passive: false });
    
    setupInput();
    initTitleParticles();
    
    const handleStart = (e) => { e.preventDefault(); startGame(); };
    document.getElementById('start-btn').addEventListener('click', handleStart);
    document.getElementById('start-btn').addEventListener('touchend', handleStart);
    document.getElementById('restart-btn').addEventListener('click', handleStart);
    document.getElementById('restart-btn').addEventListener('touchend', handleStart);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
