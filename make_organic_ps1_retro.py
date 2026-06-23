from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

path = r"C:\Users\migue\OneDrive\Escritorio\Antigravity"
brainPath = r"C:\Users\migue\.gemini\antigravity-cli\brain\349f0b64-4f8a-45b0-8ef5-f4f51ffa44ad"

W, H = 800, 1000
canvas = Image.new("RGBA", (W, H), "black")

# Load Background
try:
    bg = Image.open(os.path.join(brainPath, "ps1_foggy_street_1782237003423.jpg")).convert("RGBA")
    bg = bg.resize((W, H), Image.Resampling.LANCZOS)
    canvas.paste(bg, (0,0))
except Exception as e:
    print("Warning: Could not load background")

# Load Images
char_chelcapu = Image.open(os.path.join(path, "chelcapu_nobg.png")).convert("RGBA")
char_quevedo = Image.open(os.path.join(path, "quevedo.png")).convert("RGBA")
char_enemigo = Image.open(os.path.join(path, "enemigo1.png")).convert("RGBA")
img_tutto = Image.open(os.path.join(path, "tutto.png")).convert("RGBA")
img_marlboro = Image.open(os.path.join(path, "marlboro.png")).convert("RGBA")
img_prop = Image.open(os.path.join(path, "propaganda1.png")).convert("RGBA")

# 1. Propaganda Organically in background (slightly higher opacity)
prop_w = W
prop_h = int(img_prop.height * (prop_w / img_prop.width))
img_prop = img_prop.resize((prop_w, prop_h), Image.Resampling.LANCZOS)
prop_mask = img_prop.split()[3].point(lambda p: p * 0.25)
img_prop.putalpha(prop_mask)
canvas.paste(img_prop, (0, 150), img_prop)

# Fog function
def draw_fog(draw_target, y_start, y_end, max_alpha=150, color=(120, 120, 130)):
    fog = Image.new("RGBA", (W, H), (0,0,0,0))
    f_draw = ImageDraw.Draw(fog)
    for y in range(y_start, y_end):
        mid = (y_start + y_end) / 2.0
        dist = abs(y - mid) / ((y_end - y_start)/2.0)
        alpha = int(max_alpha * (1.0 - (dist**2)))
        if alpha < 0: alpha = 0
        f_draw.line([(0, y), (W, y)], fill=color + (alpha,))
    fog = fog.filter(ImageFilter.GaussianBlur(15))
    draw_target.paste(fog, (0,0), fog)

# 2. Enemigo detrás con nieblina (Make him larger and more menacing)
e_h = int(H * 0.5)
e_w = int(char_enemigo.width * (e_h / char_enemigo.height))
char_enemigo = char_enemigo.resize((e_w, e_h), Image.Resampling.LANCZOS)

enh = ImageEnhance.Brightness(char_enemigo)
char_enemigo = enh.enhance(0.3)
enh2 = ImageEnhance.Color(char_enemigo)
char_enemigo = enh2.enhance(0.3)

e_x = (W - e_w) // 2
e_y = 20
canvas.paste(char_enemigo, (e_x, e_y), char_enemigo)

draw_fog(canvas, 50, int(H * 0.55), max_alpha=200, color=(60, 60, 70))

# 3. Quevedo protegiendo (Move him slightly to make composition dynamic)
q_h = int(H * 0.6)
q_w = int(char_quevedo.width * (q_h / char_quevedo.height))
char_quevedo = char_quevedo.resize((q_w, q_h), Image.Resampling.LANCZOS)
char_quevedo = ImageEnhance.Brightness(char_quevedo).enhance(0.6)

q_x = int(W * 0.02)
q_y = int(H * 0.25)
canvas.paste(char_quevedo, (q_x, q_y), char_quevedo)

draw_fog(canvas, int(H*0.45), int(H*0.7), max_alpha=150)

# 4. Chelcapu sin fondo (Make him larger, focal point)
c_h = int(H * 0.65)
c_w = int(char_chelcapu.width * (c_h / char_chelcapu.height))
char_chelcapu = char_chelcapu.resize((c_w, c_h), Image.Resampling.LANCZOS)
char_chelcapu = ImageEnhance.Brightness(char_chelcapu).enhance(0.8)

c_x = int(W * 0.4)
c_y = int(H * 0.3)
canvas.paste(char_chelcapu, (c_x, c_y), char_chelcapu)

draw_fog(canvas, int(H*0.7), H, max_alpha=255, color=(30, 30, 35))

# 5. Marlboro y Tutto organicamente
def place_item(img, x, y, rot, h_target):
    w_target = int(img.width * (h_target / img.height))
    img = img.resize((w_target, h_target), Image.Resampling.LANCZOS).rotate(rot, expand=True)
    sh = Image.new('RGBA', img.size, (0,0,0,0))
    sh.paste((0,0,0,200), (0,0), img.split()[-1])
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    canvas.paste(sh, (x+10, y+10), sh)
    canvas.paste(img, (x, y), img)

place_item(img_tutto, int(W*0.15), int(H*0.82), -25, 130)
place_item(img_marlboro, int(W*0.7), int(H*0.84), 35, 110)

# 6. Title
draw = ImageDraw.Draw(canvas)
text1 = "CHELCAPU'S"
text2 = "NIGHTMARE"

try:
    font1 = ImageFont.truetype("impact.ttf", 90)
    font2 = ImageFont.truetype("impact.ttf", 110)
except:
    font1 = ImageFont.load_default()
    font2 = font1

bbox1 = draw.textbbox((0,0), text1, font=font1)
tw1 = bbox1[2]-bbox1[0]
cx1 = (W - tw1) // 2
cy1 = 40

bbox2 = draw.textbbox((0,0), text2, font=font2)
tw2 = bbox2[2]-bbox2[0]
cx2 = (W - tw2) // 2
cy2 = cy1 + 90

def draw_outlined(x, y, txt, font, fill, outline, w):
    for ox in range(-w, w+1):
        for oy in range(-w, w+1):
            if ox*ox + oy*oy <= w*w:
                draw.text((x+ox, y+oy), txt, font=font, fill=outline)
    draw.text((x, y), txt, font=font, fill=fill)

draw_outlined(cx1, cy1, text1, font1, "white", "black", 4)
draw_outlined(cx2, cy2, text2, font2, "red", "black", 5)

# APPLY PS1 RETRO EFFECT (Downscale, reduce colors, upscale without smoothing)
canvas = canvas.convert("RGB")
ps1_w, ps1_h = W // 3, H // 3
canvas_small = canvas.resize((ps1_w, ps1_h), Image.Resampling.BILINEAR)
canvas_retro = canvas_small.quantize(colors=128).convert("RGB")
canvas_final = canvas_retro.resize((W, H), Image.Resampling.NEAREST)

canvas_final.save(os.path.join(path, "caratula.jpg"), "JPEG", quality=90)
canvas_final.save(os.path.join(path, "caratula.png"), "PNG")
print("Authentic PS1 retro cover done")
