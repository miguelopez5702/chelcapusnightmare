Add-Type -AssemblyName System.Drawing

$width = 600
$height = 800

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.Clear([System.Drawing.Color]::Black)

$path = "C:\Users\migue\OneDrive\Escritorio\Antigravity"
$brainPath = "C:\Users\migue\.gemini\antigravity-cli\brain\349f0b64-4f8a-45b0-8ef5-f4f51ffa44ad"

# Load Game Images
$imgChelcapu = [System.Drawing.Image]::FromFile("$path\chelcapu.jpg")
$imgQuevedo  = [System.Drawing.Image]::FromFile("$path\quevedo.png")
$imgEnemigo  = [System.Drawing.Image]::FromFile("$path\enemigo1.png")
$imgJamon    = [System.Drawing.Image]::FromFile("$path\jamon.png")
$imgTutto    = [System.Drawing.Image]::FromFile("$path\tutto.png")

# Load Backgrounds
$bgQuevedo = [System.Drawing.Image]::FromFile("$brainPath\bg_quevedo_1782235581895.jpg")
$bgEnemigo = [System.Drawing.Image]::FromFile("$brainPath\bg_enemigo_1782235598469.jpg")

# 1. Top Panel (Chelcapu)
$srcH = [math]::Min($imgChelcapu.Height, $imgChelcapu.Width * (400.0/600.0))
$srcRect = New-Object System.Drawing.Rectangle(0, 0, $imgChelcapu.Width, $srcH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, 600, 400)
$graphics.DrawImage($imgChelcapu, $destRect, 0, 0, $imgChelcapu.Width, $srcH, [System.Drawing.GraphicsUnit]::Pixel)

# 2. Bottom Left Panel (Quevedo)
$rect2 = New-Object System.Drawing.Rectangle(0, 410, 295, 390)
$graphics.DrawImage($bgQuevedo, $rect2)
# Center Quevedo in the panel
$qW = 200
$qH = 200 * ($imgQuevedo.Height / $imgQuevedo.Width)
$graphics.DrawImage($imgQuevedo, (0 + (295 - $qW)/2), (410 + (390 - $qH)/2), $qW, $qH)

# 3. Bottom Right Panel (Enemigo)
$rect3 = New-Object System.Drawing.Rectangle(305, 410, 295, 390)
$graphics.DrawImage($bgEnemigo, $rect3)
# Center Enemigo in the panel
$eW = 220
$eH = 220 * ($imgEnemigo.Height / $imgEnemigo.Width)
$graphics.DrawImage($imgEnemigo, (305 + (295 - $eW)/2), (410 + (390 - $eH)/2), $eW, $eH)

# Draw Borders
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 10)
$graphics.DrawRectangle($pen, 0, 0, 600, 800)
$graphics.DrawLine($pen, 0, 405, 600, 405)
$graphics.DrawLine($pen, 300, 405, 300, 800)

# Draw Items overlapping the borders (GTA style)
$graphics.DrawImage($imgJamon, 200, 360, 100, 100 * ($imgJamon.Height / $imgJamon.Width))
$graphics.DrawImage($imgTutto, 320, 350, 120, 120 * ($imgTutto.Height / $imgTutto.Width))

# Draw Title text at the bottom with a cool banner
$bannerRect = New-Object System.Drawing.Rectangle(40, 710, 520, 70)
$bannerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 0, 0, 0))
$graphics.FillRectangle($bannerBrush, $bannerRect)

$font1 = New-Object System.Drawing.Font("Impact", 45, [System.Drawing.FontStyle]::Italic)
$brushText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushOutline = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::HotPink)

$text = "CHELCAPU'S NIGHTMARE"
$offsets = @(-3, -2, -1, 1, 2, 3)

foreach ($ox in $offsets) {
    foreach ($oy in $offsets) {
        $graphics.DrawString($text, $font1, $brushOutline, (45 + $ox), (715 + $oy))
    }
}
$graphics.DrawString($text, $font1, $brushText, 45, 715)

$bmp.Save("$path\caratula.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$path\caratula.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Clean up
$graphics.Dispose()
$bmp.Dispose()
$imgChelcapu.Dispose()
$imgQuevedo.Dispose()
$imgEnemigo.Dispose()
$imgJamon.Dispose()
$imgTutto.Dispose()
$bgQuevedo.Dispose()
$bgEnemigo.Dispose()
$pen.Dispose()
$bannerBrush.Dispose()
$brushText.Dispose()
$brushOutline.Dispose()
$font1.Dispose()
