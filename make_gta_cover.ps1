Add-Type -AssemblyName System.Drawing

$path = "C:\Users\migue\OneDrive\Escritorio\Antigravity"
$bgGta = [System.Drawing.Image]::FromFile("$path\gta.png")

$width = $bgGta.Width
$height = $bgGta.Height

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($bgGta, 0, 0, $width, $height)

# Load images
$imgChelcapu = [System.Drawing.Image]::FromFile("$path\chelcapu.jpg")
$imgQuevedo  = [System.Drawing.Image]::FromFile("$path\quevedo.png")
$imgEnemigo  = [System.Drawing.Image]::FromFile("$path\enemigo1.png")
$imgJamon    = [System.Drawing.Image]::FromFile("$path\jamon.png")
$imgTutto    = [System.Drawing.Image]::FromFile("$path\tutto.png")

# Draw thick borders to make it look like comic panels
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 15)

# Chelcapu Top Left
$w1 = $width * 0.45
$h1 = $w1 * ($imgChelcapu.Height / $imgChelcapu.Width)
$graphics.DrawImage($imgChelcapu, 10, 10, $w1, $h1)
$graphics.DrawRectangle($pen, 10, 10, $w1, $h1)

# Quevedo Top Right
$w2 = $width * 0.45
$h2 = $w2 * ($imgQuevedo.Height / $imgQuevedo.Width)
$graphics.DrawImage($imgQuevedo, ($width - $w2 - 10), 10, $w2, $h2)
$graphics.DrawRectangle($pen, [int]($width - $w2 - 10), 10, [int]$w2, [int]$h2)

# Enemigo Bottom Right
$w3 = $width * 0.45
$h3 = $w3 * ($imgEnemigo.Height / $imgEnemigo.Width)
$y3 = $height - $h3 - 10
$graphics.DrawImage($imgEnemigo, ($width - $w3 - 10), $y3, $w3, $h3)
$graphics.DrawRectangle($pen, [int]($width - $w3 - 10), [int]$y3, [int]$w3, [int]$h3)

# Jamon and Tutto Bottom Left
$w4 = $width * 0.25
$h4 = $w4 * ($imgJamon.Height / $imgJamon.Width)
$graphics.DrawImage($imgJamon, 20, ($height - $h4 - 20), $w4, $h4)
$graphics.DrawImage($imgTutto, (30 + $w4), ($height - $h4 - 40), $w4, $h4)

# Draw Title "GTA CHELCAPU" in the center
$fontSize = [math]::Max(20, $width / 12)
$font1 = New-Object System.Drawing.Font("Impact", $fontSize, [System.Drawing.FontStyle]::Italic)
$brushText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushOutline = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$text1 = "GTA"
$text2 = "CHELCAPU"

$tx1 = $width / 2 - ($graphics.MeasureString($text1, $font1).Width / 2)
$ty1 = $height / 2 - $fontSize - 10
$tx2 = $width / 2 - ($graphics.MeasureString($text2, $font1).Width / 2)
$ty2 = $height / 2 + 10

$offsets = @(-4, -3, -2, -1, 1, 2, 3, 4)

foreach ($ox in $offsets) {
    foreach ($oy in $offsets) {
        $graphics.DrawString($text1, $font1, $brushOutline, ($tx1 + $ox), ($ty1 + $oy))
        $graphics.DrawString($text2, $font1, $brushOutline, ($tx2 + $ox), ($ty2 + $oy))
    }
}
$graphics.DrawString($text1, $font1, $brushText, $tx1, $ty1)
$graphics.DrawString($text2, $font1, $brushText, $tx2, $ty2)

$bmp.Save("$path\caratula.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("$path\caratula.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Clean up
$graphics.Dispose()
$bmp.Dispose()
$bgGta.Dispose()
$imgChelcapu.Dispose()
$imgQuevedo.Dispose()
$imgEnemigo.Dispose()
$imgJamon.Dispose()
$imgTutto.Dispose()
$brushText.Dispose()
$brushOutline.Dispose()
$font1.Dispose()
$pen.Dispose()
