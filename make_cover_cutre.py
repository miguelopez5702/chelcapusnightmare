from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os
import random

path = r"C:\Users\migue\OneDrive\Escritorio\Antigravity"

try:
    bg = Image.open(os.path.join(path, "gta.png")).convert("RGBA")
except Exception as e:
    # fallback to black background if gta.png fails
    bg = Image.new("RGBA", (800, 1000), "black")

bg = bg.resize((800, 1000))
width, height = bg.size

# Load images
img_chelcapu = Image.open(os.path.join(path, "chelcapu.jpg")).convert("RGBA")
img_quevedo = Image.open(os.path.join(path, "quevedo.png")).convert("RGBA")
img_enemigo = Image.open(os.path.join(path, "enemigo1.png")).convert("RGBA")
img_jamon = Image.open(os.path.join(path, "jamon.png")).convert("RGBA")
img_tutto = Image.open(os.path.join(path, "tutto.png")).convert("RGBA")

def apply_effects(img, scale_factor, rotation):
    # Resize
    w, h = img.size
    new_w = int(width * scale_factor)
    new_h = int(h * (new_w / w))
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Enhance Color and Contrast
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.5)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.2)
    
    # Rotate
    img = img.rotate(rotation, expand=True, fillcolor=(0,0,0,0))
    return img

img_chelcapu = apply_effects(img_chelcapu, 0.5, -5)
img_quevedo = apply_effects(img_quevedo, 0.45, 10)
img_enemigo = apply_effects(img_enemigo, 0.5, -15)
img_jamon = apply_effects(img_jamon, 0.3, 45)
img_tutto = apply_effects(img_tutto, 0.3, -30)

# Paste them all over the place
bg.paste(img_chelcapu, (50, 50), img_chelcapu)
bg.paste(img_quevedo, (400, 100), img_quevedo)
bg.paste(img_enemigo, (100, 500), img_enemigo)
bg.paste(img_jamon, (550, 600), img_jamon)
bg.paste(img_tutto, (50, 750), img_tutto)
bg.paste(img_jamon, (300, 750), img_jamon) # extra jamon

# Add vignette effect
vignette = Image.new("RGBA", bg.size, (0,0,0,0))
draw_v = ImageDraw.Draw(vignette)
for i in range(200):
    alpha = int(255 * (i / 200) ** 2)
    draw_v.rectangle([i, i, width-i, height-i], outline=(0,0,0,alpha), width=2)
bg = Image.alpha_composite(bg, vignette)

# Draw Title
draw = ImageDraw.Draw(bg)
try:
    font = ImageFont.truetype("impact.ttf", 100)
except:
    font = ImageFont.load_default()

text = "GTA CHELCAPU"
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

tx = (width - tw) // 2
ty = (height - th) // 2

# Draw a thick neon outline
for ox in range(-8, 9):
    for oy in range(-8, 9):
        draw.text((tx + ox, ty + oy), text, font=font, fill="magenta")

for ox in range(-4, 5):
    for oy in range(-4, 5):
        draw.text((tx + ox, ty + oy), text, font=font, fill="black")

draw.text((tx, ty), text, font=font, fill="white")

bg.convert("RGB").save(os.path.join(path, "caratula.jpg"), "JPEG")
bg.save(os.path.join(path, "caratula.png"), "PNG")
print("Cutre collage done!")
