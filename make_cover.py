from PIL import Image, ImageDraw, ImageFont
import os

path = r"C:\Users\migue\OneDrive\Escritorio\Antigravity"

try:
    bg_gta = Image.open(os.path.join(path, "gta.png")).convert("RGBA")
except Exception as e:
    print(f"Error loading gta.png: {e}")
    exit(1)

width, height = bg_gta.size

# Load images
img_chelcapu = Image.open(os.path.join(path, "chelcapu.jpg")).convert("RGBA")
img_quevedo = Image.open(os.path.join(path, "quevedo.png")).convert("RGBA")
img_enemigo = Image.open(os.path.join(path, "enemigo1.png")).convert("RGBA")
img_jamon = Image.open(os.path.join(path, "jamon.png")).convert("RGBA")
img_tutto = Image.open(os.path.join(path, "tutto.png")).convert("RGBA")

draw = ImageDraw.Draw(bg_gta)

w_panel = int(width * 0.40)

def resize_to_fit(img, target_w):
    w, h = img.size
    ratio = target_w / float(w)
    target_h = int(float(h) * float(ratio))
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)

img_chelcapu = resize_to_fit(img_chelcapu, w_panel)
img_quevedo = resize_to_fit(img_quevedo, w_panel)
img_enemigo = resize_to_fit(img_enemigo, w_panel)
img_jamon = resize_to_fit(img_jamon, int(width * 0.25))
img_tutto = resize_to_fit(img_tutto, int(width * 0.25))

# Panel backgrounds so transparent pngs pop out and look cool
# Draw some cool comic-style panels beneath the transparent images
def draw_panel_bg(x, y, w, h, color):
    draw.rectangle([x, y, x+w, y+h], fill=color, outline="black", width=8)

# Top Left
draw_panel_bg(20, 20, img_chelcapu.width, img_chelcapu.height, "darkorange")
bg_gta.paste(img_chelcapu, (20, 20), img_chelcapu)
draw.rectangle([20, 20, 20 + img_chelcapu.width, 20 + img_chelcapu.height], outline="black", width=8)

# Top Right
qx = width - w_panel - 20
draw_panel_bg(qx, 20, img_quevedo.width, img_quevedo.height, "purple")
bg_gta.paste(img_quevedo, (qx, 20), img_quevedo)
draw.rectangle([qx, 20, qx + img_quevedo.width, 20 + img_quevedo.height], outline="black", width=8)

# Bottom Right
y_enemigo = height - img_enemigo.height - 20
ex = width - w_panel - 20
draw_panel_bg(ex, y_enemigo, img_enemigo.width, img_enemigo.height, "darkred")
bg_gta.paste(img_enemigo, (ex, y_enemigo), img_enemigo)
draw.rectangle([ex, y_enemigo, ex + img_enemigo.width, y_enemigo + img_enemigo.height], outline="black", width=8)

# Bottom Left
y_jamon = height - img_jamon.height - 40
bg_gta.paste(img_jamon, (40, y_jamon), img_jamon)

y_tutto = height - img_tutto.height - 80
bg_gta.paste(img_tutto, (40 + img_jamon.width + 10, y_tutto), img_tutto)

# Add "GTA CHELCAPU" Text in the center
try:
    font1 = ImageFont.truetype("impact.ttf", int(width/6))
    font2 = ImageFont.truetype("impact.ttf", int(width/8))
except:
    font1 = ImageFont.load_default()
    font2 = font1

text1 = "GTA"
text2 = "CHELCAPU"

bbox1 = draw.textbbox((0, 0), text1, font=font1)
tw1 = bbox1[2] - bbox1[0]
th1 = bbox1[3] - bbox1[1]

bbox2 = draw.textbbox((0, 0), text2, font=font2)
tw2 = bbox2[2] - bbox2[0]
th2 = bbox2[3] - bbox2[1]

tx1 = (width - tw1) // 2
ty1 = (height // 2) - th1 - 10
tx2 = (width - tw2) // 2
ty2 = (height // 2) + 10

# Draw text with outline
def draw_text_outlined(x, y, text, font, fill, outline):
    for ox in range(-4, 5):
        for oy in range(-4, 5):
            draw.text((x + ox, y + oy), text, font=font, fill=outline)
    draw.text((x, y), text, font=font, fill=fill)

draw_text_outlined(tx1, ty1, text1, font1, "white", "black")
draw_text_outlined(tx2, ty2, text2, font2, "white", "black")

bg_gta.convert("RGB").save(os.path.join(path, "caratula.jpg"), "JPEG")
bg_gta.save(os.path.join(path, "caratula.png"), "PNG")
print("Done")
