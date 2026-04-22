# Download Manrope fonts from Google Fonts CDN
$fonts = @(
    @{weight=400; url='https://fonts.gstatic.com/s/manrope/v15/NWc0_24KjIVe2nIrH2dEz8kSDc0.woff2'; file='Manrope-400.woff2'},
    @{weight=400; url='https://fonts.gstatic.com/s/manrope/v15/NWc0_24KjIVe2nIrH2dEz8kSDc1.woff'; file='Manrope-400.woff'},
    @{weight=500; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzxU1Pdcbh8k.woff2'; file='Manrope-500.woff2'},
    @{weight=500; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzxU1Pdcbh8l.woff'; file='Manrope-500.woff'},
    @{weight=600; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz7k1Pdcbh8k.woff2'; file='Manrope-600.woff2'},
    @{weight=600; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz7k1Pdcbh8l.woff'; file='Manrope-600.woff'},
    @{weight=700; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz5k1Pdcbh8k.woff2'; file='Manrope-700.woff2'},
    @{weight=700; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz5k1Pdcbh8l.woff'; file='Manrope-700.woff'},
    @{weight=800; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzyk1Pdcbh8k.woff2'; file='Manrope-800.woff2'},
    @{weight=800; url='https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzyk1Pdcbh8l.woff'; file='Manrope-800.woff'}
)

foreach ($font in $fonts) {
    Write-Host "Downloading $($font.file)..."
    try {
        Invoke-WebRequest -Uri $font.url -OutFile $font.file -UseBasicParsing
        Write-Host "✓ Downloaded $($font.file)"
    } catch {
        Write-Host "✗ Failed to download $($font.file): $_"
    }
}

Write-Host ""
Write-Host "Font download complete! Files:"
Get-ChildItem -Filter "Manrope-*.woff*" | ForEach-Object { Write-Host "  - $_.Name" }
