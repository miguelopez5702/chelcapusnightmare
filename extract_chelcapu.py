import rembg
from PIL import Image
import os

path = r"C:\Users\migue\OneDrive\Escritorio\Antigravity"
input_path = os.path.join(path, "chelcapu.jpg")
output_path = os.path.join(path, "chelcapu_nobg.png")

print("Removing background from chelcapu.jpg...")
try:
    with open(input_path, 'rb') as i:
        input_data = i.read()
    output_data = rembg.remove(input_data)
    with open(output_path, 'wb') as o:
        o.write(output_data)
    print("Background removed successfully.")
except Exception as e:
    print(f"Error: {e}")
