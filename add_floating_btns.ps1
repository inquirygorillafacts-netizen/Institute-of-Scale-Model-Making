$html = Get-Content src/index.html -Raw

$css = @"
  <style>
    /* Floating Action Buttons */
    .floating-btn-container {
      position: fixed;
      bottom: 25px;
      z-index: 9999;
    }
    .floating-btn-container.left { left: 25px; }
    .floating-btn-container.right { right: 25px; }
    
    .floating-btn {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      position: relative;
      transition: transform 0.3s ease;
    }
    .floating-btn:hover {
      transform: scale(1.1);
      color: white;
    }
    .floating-btn.whatsapp { background-color: #25d366; }
    .floating-btn.call { background-color: #007bff; }
    
    .floating-btn .icon {
      width: 32px;
      height: 32px;
      stroke: currentColor;
    }
    
    /* Pulse Animation */
    .pulse-ring {
      content: '';
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      animation: pulse 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
      z-index: -1;
    }
    .floating-btn.whatsapp .pulse-ring { border: 2px solid rgba(37, 211, 102, 0.8); }
    .floating-btn.call .pulse-ring { border: 2px solid rgba(0, 123, 255, 0.8); }

    .pulse-ring.delay {
      animation-delay: 1s;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    
    /* Mobile optimization */
    @media (max-width: 768px) {
      .floating-btn { width: 55px; height: 55px; }
      .floating-btn .icon { width: 26px; height: 26px; }
      .floating-btn-container.left { left: 15px; }
      .floating-btn-container.right { right: 15px; }
    }
  </style>
</head>
"@

$btns = @"
  <!-- Floating Call Button (Left) -->
  <div class="floating-btn-container left d-block d-md-none">
    <a href="tel:+918302806913" class="floating-btn call" title="Call Us">
      <div class="pulse-ring"></div>
      <div class="pulse-ring delay"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
      </svg>
    </a>
  </div>

  <!-- Floating WhatsApp Button (Right) -->
  <div class="floating-btn-container right">
    <a href="https://wa.me/918302806913" target="_blank" class="floating-btn whatsapp" title="Chat on WhatsApp">
      <div class="pulse-ring"></div>
      <div class="pulse-ring delay"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
        <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
      </svg>
    </a>
  </div>

</body>
"@

$html = $html -replace '</head>', $css
$html = $html -replace '</body>', $btns

Set-Content src/index.html -Value $html
Write-Host "Floating buttons added!"
