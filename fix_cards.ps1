$html = Get-Content src/index.html -Raw

# Add light background to the courses section
$html = $html -replace '<section class="py-lg-13 py-8" id="courses">', '<section class="py-lg-13 py-8 bg-light bg-opacity-50" id="courses">'

# Fix card body padding, heading size, and paragraph line-height
$html = $html -replace '<div class="card-body p-6">\s*<h3 class="mb-1 fs-6">', '<div class="card-body p-5 p-lg-6"><h3 class="mb-3 fs-5 fw-bold text-dark">'
$html = $html -replace '<p class="text-muted small mt-2 mb-0">', '<p class="text-muted small lh-lg mb-2">'

Set-Content src/index.html -Value $html
Write-Host "Fixed card styling and section background!"
