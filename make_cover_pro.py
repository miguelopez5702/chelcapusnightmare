from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

path = r"C:\Users\migue\OneDrive\Escritorio\Antigravity"

bg = Image.open(os.path.join(path, "gta.png")).convert("RGBA")
W, H = bg.size

def drop_shadow(img, offset=(10, 10), radius=10, color=(0, 0, 0, 200)):
    shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
    mask = img.split()[-1]
    shadow.paste(color, (0, 0), mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius))
    
    res = Image.new('RGBA', (img.width + abs(offset[0]) + radius*2, img.height + abs(offset[1]) + radius*2), (0,0,0,0))
    res.paste(shadow, (radius + offset[0], radius + offset[1]))
    res.paste(img, (radius, radius), img)
    return res

def soft_ellipse_mask(size):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    w, h = size
    steps = 100
    for i in range(steps):
        color = int(255 * (i / steps))
        margin_x = (w / 2) * (1 - (i / steps))
        margin_y = (h / 2) * (1 - (i / steps))
        box = (margin_x, margin_y, w - margin_x, h - margin_y)
        draw.ellipse(box, fill=color)
    return mask

img_chelcapu = Image.open(os.path.join(path, "chelcapu.jpg")).convert("RGBA")
# Apply soft vignette so it blends seamlessly
fade_mask = soft_ellipse_mask(img_chelcapu.size)
img_chelcapu.putalpha(fade_mask)

# Chelcapu at top center
c_h = int(H * 0.45)
c_w = int(img_chelcapu.width * (c_h / img_chelcapu.height))
img_chelcapu = img_chelcapu.resize((c_w, c_h), Image.Resampling.LANCZOS)
bg.paste(img_chelcapu, ((W - c_w)//2, 20), img_chelcapu)

img_quevedo = Image.open(os.path.join(path, "quevedo.png")).convert("RGBA")
img_enemigo = Image.open(os.path.join(path, "enemigo1.png")).convert("RGBA")
img_jamon = Image.open(os.path.join(path, "jamon.png")).convert("RGBA")

# Quevedo (Left)
q_h = int(H * 0.45)
q_w = int(img_quevedo.width * (q_h / img_quevedo.height))
img_quevedo = img_quevedo.resize((q_w, q_h), Image.Resampling.LANCZOS)
# Enhance colors a bit
enh = ImageEnhance.Color(img_quevedo)
img_quevedo = enh.enhance(1.3)
img_quevedo = drop_shadow(img_quevedo, offset=(8,8), radius=8)
bg.paste(img_quevedo, (10, H - img_quevedo.height - int(H*0.1)), img_quevedo)

# Enemigo (Right)
e_h = int(H * 0.45)
e_w = int(img_enemigo.width * (e_h / img_enemigo.height))
img_enemigo = img_enemigo.resize((e_w, e_h), Image.Resampling.LANCZOS)
enh = ImageEnhance.Color(img_enemigo)
img_enemigo = enh.enhance(1.3)
img_enemigo = drop_shadow(img_enemigo, offset=(-8,8), radius=8)
bg.paste(img_enemigo, (W - img_enemigo.width - 10, H - img_enemigo.height - int(H*0.1)), img_enemigo)

# Jamon floating
j_w = int(W * 0.25)
j_h = int(img_jamon.height * (j_w / img_jamon.width))
img_jamon = img_jamon.resize((j_w, j_h), Image.Resampling.LANCZOS)
img_jamon = img_jamon.rotate(25, expand=True)
img_jamon = drop_shadow(img_jamon, offset=(10,15), radius=10)
bg.paste(img_jamon, (int(W*0.1), int(H*0.4)), img_jamon)

# Title: GTA CHELCAPU
draw = ImageDraw.Draw(bg)
font_size = int(W * 0.14)
try:
    font = ImageFont.truetype("impact.ttf", font_size)
except:
    font = ImageFont.load_default()

text = "GTA CHELCAPU"
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

# Draw a sleek dark gradient ribbon behind the text for contrast
ribbon_y1 = H - th - int(H*0.1) - 20
ribbon_y2 = ribbon_y1 + th + 40
overlay = Image.new('RGBA', bg.size, (0,0,0,0))
ov_draw = ImageDraw.Draw(overlay)
ov_draw.rectangle([0, ribbon_y1, W, ribbon_y2], fill=(0,0,0, 160))
bg = Image.alpha_composite(bg, overlay)
draw = ImageDraw.Draw(bg) # re-get draw for bg

tx = (W - tw) // 2
ty = ribbon_y1 + 10

# Outline for text
outline_width = max(3, int(font_size * 0.05))
for ox in range(-outline_width, outline_width+1):
    for oy in range(-outline_width, outline_width+1):
        if ox**2 + oy**2 <= outline_width**2:
            draw.text((tx+ox, ty+oy), text, font=font, fill="black")

# Draw interior text with a yellowish GTA style color
draw.text((tx, ty), text, font=font, fill=(255, 215, 0)) # Gold/Yellow

bg.convert("RGB").save(os.path.join(path, "caratula.jpg"), "JPEG", quality=95)
bg.save(os.path.join(path, "caratula.png"), "PNG")
print("Perfect pro cover done")
