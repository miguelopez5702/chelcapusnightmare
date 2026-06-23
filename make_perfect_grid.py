from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

path = r"C:\Users\migue\OneDrive\Escritorio\Antigravity"
brainPath = r"C:\Users\migue\.gemini\antigravity-cli\brain\349f0b64-4f8a-45b0-8ef5-f4f51ffa44ad"

W, H = 800, 1000
canvas = Image.new("RGBA", (W, H), "black")

# Load characters
char_chelcapu = Image.open(os.path.join(path, "chelcapu.jpg")).convert("RGBA")
char_quevedo = Image.open(os.path.join(path, "quevedo.png")).convert("RGBA")
char_enemigo = Image.open(os.path.join(path, "enemigo1.png")).convert("RGBA")
img_jamon = Image.open(os.path.join(path, "jamon.png")).convert("RGBA")
img_tutto = Image.open(os.path.join(path, "tutto.png")).convert("RGBA")

# Load AI backgrounds
bg_top = Image.open(os.path.join(brainPath, "panel_top_1782236780319.jpg")).convert("RGBA")
bg_left = Image.open(os.path.join(brainPath, "panel_left_1782236798697.jpg")).convert("RGBA")
bg_right = Image.open(os.path.join(brainPath, "panel_right_1782236807753.jpg")).convert("RGBA")

def create_panel(w, h, bg_img, char_img, offset_y=0, scale_char=1.0):
    panel = Image.new("RGBA", (w, h), "black")
    
    # Scale and paste bg
    iw, ih = bg_img.size
    ratio = max(w/iw, h/ih)
    new_w, new_h = int(iw * ratio), int(ih * ratio)
    res_bg = bg_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    px = (w - new_w) // 2
    py = (h - new_h) // 2
    panel.paste(res_bg, (px, py))
    
    if char_img:
        # Scale char
        cw, ch = char_img.size
        # Fill height based on scale_char
        target_h = int(h * scale_char)
        ratio_c = target_h / ch
        new_cw, new_ch = int(cw * ratio_c), target_h
        res_char = char_img.resize((new_cw, new_ch), Image.Resampling.LANCZOS)
        
        # Color correct char to blend better
        enh = ImageEnhance.Color(res_char)
        res_char = enh.enhance(1.2)
        enh = ImageEnhance.Contrast(res_char)
        res_char = enh.enhance(1.1)
        
        # Paste char
        cx = (w - new_cw) // 2
        cy = h - new_ch + offset_y
        
        # Drop shadow for transparent pngs
        if char_img.mode == "RGBA" and "chelcapu.jpg" not in char_img.filename if hasattr(char_img, 'filename') else True:
            shadow = Image.new('RGBA', res_char.size, (0, 0, 0, 0))
            shadow.paste((0,0,0,180), (0,0), res_char.split()[-1])
            shadow = shadow.filter(ImageFilter.GaussianBlur(5))
            panel.paste(shadow, (cx+10, cy+10), shadow)
            
        panel.paste(res_char, (cx, cy), res_char if res_char.mode == "RGBA" else None)
        
    return panel

# We will do a 3-panel GTA layout
# Top Panel: Chelcapu
h_top = 450
panel1 = create_panel(W, h_top, bg_top, char_chelcapu, offset_y=0, scale_char=0.9)
canvas.paste(panel1, (0, 0))

# Bottom Left Panel: Quevedo
w_left = 400
h_bottom = H - h_top
panel2 = create_panel(w_left, h_bottom, bg_left, char_quevedo, offset_y=20, scale_char=0.8)
canvas.paste(panel2, (0, h_top))

# Bottom Right Panel: Enemigo
w_right = W - w_left
panel3 = create_panel(w_right, h_bottom, bg_right, char_enemigo, offset_y=20, scale_char=0.8)
canvas.paste(panel3, (w_left, h_top))

# Draw the thick black GTA borders
draw = ImageDraw.Draw(canvas)
b_w = 14
# Outer
draw.rectangle([0, 0, W, H], outline="black", width=b_w)
# Horizontal split
draw.line([(0, h_top), (W, h_top)], fill="black", width=b_w)
# Vertical split
draw.line([(w_left, h_top), (w_left, H)], fill="black", width=b_w)

# Add Jamon and Tutto floating OVER the borders slightly (classic GTA motif)
jw = 140
jh = int(img_jamon.height * (jw / img_jamon.width))
res_jamon = img_jamon.resize((jw, jh), Image.Resampling.LANCZOS).rotate(25, expand=True)
shadow_j = Image.new('RGBA', res_jamon.size, (0,0,0,0))
shadow_j.paste((0,0,0,150), (0,0), res_jamon.split()[-1])
shadow_j = shadow_j.filter(ImageFilter.GaussianBlur(5))
jx, jy = 100, h_top - 50
canvas.paste(shadow_j, (jx+8, jy+8), shadow_j)
canvas.paste(res_jamon, (jx, jy), res_jamon)

tw = 140
th = int(img_tutto.height * (tw / img_tutto.width))
res_tutto = img_tutto.resize((tw, th), Image.Resampling.LANCZOS).rotate(-15, expand=True)
shadow_t = Image.new('RGBA', res_tutto.size, (0,0,0,0))
shadow_t.paste((0,0,0,150), (0,0), res_tutto.split()[-1])
shadow_t = shadow_t.filter(ImageFilter.GaussianBlur(5))
tx, ty = W - 250, h_top - 40
canvas.paste(shadow_t, (tx+8, ty+8), shadow_t)
canvas.paste(res_tutto, (tx, ty), res_tutto)

# GTA CHELCAPU Logo in Center
text1 = "grand theft auto"
text2 = "CHELCAPU"

try:
    font1 = ImageFont.truetype("pricedown.ttf", 60)
except:
    font1 = ImageFont.truetype("impact.ttf", 50)

try:
    font2 = ImageFont.truetype("impact.ttf", 90)
except:
    font2 = ImageFont.load_default()

bbox1 = draw.textbbox((0,0), text1, font=font1)
tw1, th1 = bbox1[2]-bbox1[0], bbox1[3]-bbox1[1]

bbox2 = draw.textbbox((0,0), text2, font=font2)
tw2, th2 = bbox2[2]-bbox2[0], bbox2[3]-bbox2[1]

cx1 = (W - tw1) // 2
cy1 = h_top - th1 - 20
cx2 = (W - tw2) // 2
cy2 = h_top + 10

def draw_outlined(x, y, txt, font, fill, outline, w):
    for ox in range(-w, w+1):
        for oy in range(-w, w+1):
            draw.text((x+ox, y+oy), txt, font=font, fill=outline)
    draw.text((x, y), txt, font=font, fill=fill)

draw_outlined(cx1, cy1, text1, font1, "white", "black", 4)
draw_outlined(cx2, cy2, text2, font2, (255, 180, 0), "black", 6)

canvas.convert("RGB").save(os.path.join(path, "caratula.jpg"), "JPEG", quality=95)
canvas.save(os.path.join(path, "caratula.png"), "PNG")
print("Absolute masterpiece RAW grid done")
