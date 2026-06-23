from PIL import Image, ImageDraw, ImageFont
import os

path = r"C:\Users\migue\OneDrive\Escritorio\Antigravity"

W, H = 600, 800
bg = Image.new("RGBA", (W, H), "black")

# Load images
img_chelcapu = Image.open(os.path.join(path, "chelcapu.jpg")).convert("RGBA")
img_quevedo = Image.open(os.path.join(path, "quevedo.png")).convert("RGBA")
img_enemigo = Image.open(os.path.join(path, "enemigo1.png")).convert("RGBA")
img_jamon = Image.open(os.path.join(path, "jamon.png")).convert("RGBA")
img_tutto = Image.open(os.path.join(path, "tutto.png")).convert("RGBA")

# Load backgrounds
bg1 = Image.open(os.path.join(path, "propaganda1.png")).convert("RGBA")
bg2 = Image.open(os.path.join(path, "propaganda2.jpg")).convert("RGBA")

def fill_panel(draw_bg, box, char_img, bg_img):
    pw = box[2] - box[0]
    ph = box[3] - box[1]
    
    panel = Image.new("RGBA", (pw, ph), "black")
    
    if bg_img:
        # Scale bg to cover
        iw, ih = bg_img.size
        ratio = max(pw/iw, ph/ih)
        new_w, new_h = int(iw * ratio), int(ih * ratio)
        res_bg = bg_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        px = (pw - new_w) // 2
        py = (ph - new_h) // 2
        panel.paste(res_bg, (px, py))
        
        # Darken bg slightly
        dark = Image.new("RGBA", panel.size, (0,0,0,100))
        panel = Image.alpha_composite(panel, dark)
        
    if char_img:
        # Scale char to fit nicely
        iw, ih = char_img.size
        # Make character take up ~80% of panel height
        target_h = int(ph * 0.9)
        ratio = target_h / ih
        new_w, new_h = int(iw * ratio), target_h
        res_char = char_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        px = (pw - new_w) // 2
        py = ph - new_h # align bottom
        panel.paste(res_char, (px, py), res_char)
        
    draw_bg.paste(panel, (box[0], box[1]))

# Top half: Chelcapu (has his own bg since it's a jpg)
fill_panel(bg, (0, 0, W, 400), img_chelcapu, None)

# Bottom Left: Quevedo
fill_panel(bg, (0, 400, 300, 800), img_quevedo, bg1)

# Bottom Right: Enemigo
fill_panel(bg, (300, 400, 600, 800), img_enemigo, bg2)

# Overlap Jamon and Tutto
jw = 120
jh = int(img_jamon.height * (jw / img_jamon.width))
img_j_res = img_jamon.resize((jw, jh), Image.Resampling.LANCZOS).rotate(25, expand=True)

tw = 120
th = int(img_tutto.height * (tw / img_tutto.width))
img_t_res = img_tutto.resize((tw, th), Image.Resampling.LANCZOS).rotate(-20, expand=True)

bg.paste(img_j_res, (200, 450), img_j_res)
bg.paste(img_t_res, (W - tw - 150, 480), img_t_res)

# Draw Borders
draw = ImageDraw.Draw(bg)
border_w = 10
# Outer
draw.rectangle([0, 0, W, H], outline="black", width=border_w)
# Horizontal
draw.line([(0, 400), (W, 400)], fill="black", width=border_w)
# Vertical
draw.line([(300, 400), (300, 800)], fill="black", width=border_w)

# Title: grand theft auto CHELCAPU
try:
    font_gta = ImageFont.truetype("pricedown.ttf", 80) # Classic GTA font if installed
except:
    try:
        font_gta = ImageFont.truetype("impact.ttf", 60)
    except:
        font_gta = ImageFont.load_default()

text1 = "grand theft auto"
text2 = "CHELCAPU"

bbox1 = draw.textbbox((0, 0), text1, font=font_gta)
tw1, th1 = bbox1[2] - bbox1[0], bbox1[3] - bbox1[1]

bbox2 = draw.textbbox((0, 0), text2, font=font_gta)
tw2, th2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]

tx1 = (W - tw1) // 2
ty1 = 340
tx2 = (W - tw2) // 2
ty2 = ty1 + th1 - 10

def draw_outlined(x, y, txt, font, fill, outline):
    for ox in range(-3, 4):
        for oy in range(-3, 4):
            draw.text((x+ox, y+oy), txt, font=font, fill=outline)
    draw.text((x, y), txt, font=font, fill=fill)

draw_outlined(tx1, ty1, text1, font_gta, "white", "black")
draw_outlined(tx2, ty2, text2, font_gta, "white", "black")

bg.convert("RGB").save(os.path.join(path, "caratula.jpg"), "JPEG", quality=95)
bg.save(os.path.join(path, "caratula.png"), "PNG")
print("Final absolute grid cover done")
