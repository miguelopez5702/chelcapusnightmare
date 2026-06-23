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
char_chelcapu = Image.open(os.path.join(path, "chelcapu_nobg.png")).convert("RGBA") # using the cleanly extracted image
char_quevedo = Image.open(os.path.join(path, "quevedo.png")).convert("RGBA")
char_enemigo = Image.open(os.path.join(path, "enemigo1.png")).convert("RGBA")
img_tutto = Image.open(os.path.join(path, "tutto.png")).convert("RGBA")
img_marlboro = Image.open(os.path.join(path, "marlboro.png")).convert("RGBA")
img_prop = Image.open(os.path.join(path, "propaganda1.png")).convert("RGBA")

# 1. Propaganda Organically in background
prop_w = W
prop_h = int(img_prop.height * (prop_w / img_prop.width))
img_prop = img_prop.resize((prop_w, prop_h), Image.Resampling.LANCZOS)
prop_mask = img_prop.split()[3].point(lambda p: p * 0.15) # 15% opacity
img_prop.putalpha(prop_mask)
canvas.paste(img_prop, (0, 200), img_prop)

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

# 2. Enemigo detrás con nieblina
e_h = int(H * 0.45)
e_w = int(char_enemigo.width * (e_h / char_enemigo.height))
char_enemigo = char_enemigo.resize((e_w, e_h), Image.Resampling.LANCZOS)

enh = ImageEnhance.Brightness(char_enemigo)
char_enemigo = enh.enhance(0.4) # Darken him
enh2 = ImageEnhance.Color(char_enemigo)
char_enemigo = enh2.enhance(0.5)

e_x = (W - e_w) // 2
e_y = 50
canvas.paste(char_enemigo, (e_x, e_y), char_enemigo)

# Heavy fog over enemigo
draw_fog(canvas, 100, int(H * 0.6), max_alpha=180, color=(80, 80, 90))

# 3. Quevedo protegiendo
q_h = int(H * 0.55)
q_w = int(char_quevedo.width * (q_h / char_quevedo.height))
char_quevedo = char_quevedo.resize((q_w, q_h), Image.Resampling.LANCZOS)
char_quevedo = ImageEnhance.Brightness(char_quevedo).enhance(0.7)

q_x = int(W * 0.05)
q_y = int(H * 0.3)
canvas.paste(char_quevedo, (q_x, q_y), char_quevedo)

draw_fog(canvas, int(H*0.5), int(H*0.75), max_alpha=120)

# 4. Chelcapu sin fondo (foreground center)
c_h = int(H * 0.6)
c_w = int(char_chelcapu.width * (c_h / char_chelcapu.height))
char_chelcapu = char_chelcapu.resize((c_w, c_h), Image.Resampling.LANCZOS)
char_chelcapu = ImageEnhance.Brightness(char_chelcapu).enhance(0.85)

c_x = int(W * 0.35)
c_y = int(H * 0.35)
canvas.paste(char_chelcapu, (c_x, c_y), char_chelcapu)

# Bottom fog to sink the characters into the ground
draw_fog(canvas, int(H*0.75), H, max_alpha=255, color=(40, 40, 45))

# 5. Marlboro y Tutto organicamente
def place_item(img, x, y, rot, h_target):
    w_target = int(img.width * (h_target / img.height))
    img = img.resize((w_target, h_target), Image.Resampling.LANCZOS).rotate(rot, expand=True)
    sh = Image.new('RGBA', img.size, (0,0,0,0))
    sh.paste((0,0,0,200), (0,0), img.split()[-1])
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    canvas.paste(sh, (x+10, y+10), sh)
    canvas.paste(img, (x, y), img)

place_item(img_tutto, int(W*0.1), int(H*0.8), -15, 120)
place_item(img_marlboro, int(W*0.75), int(H*0.85), 25, 100)

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
cy1 = 30

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

canvas.convert("RGB").save(os.path.join(path, "caratula.jpg"), "JPEG", quality=90)
canvas.save(os.path.join(path, "caratula.png"), "PNG")
print("Perfect Organic PS1 cover done")
