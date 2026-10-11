import { NextRequest, NextResponse } from 'next/server';
import { CRITICAL_STYLED_JSX_CSS } from './critical-styles';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new NextResponse('Missing target URL parameter', { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return new NextResponse('Invalid URL format', { status: 400 });
    }

    // Security check: Only allow approved hosts (e.g. .vercel.app, localhost)
    const hostname = parsedUrl.hostname;
    const allowedHostsEnv = process.env.ALLOWED_PREVIEW_HOSTS || '.vercel.app,.nexus-clients.com';
    const allowedSuffixes = allowedHostsEnv.split(',').map((s) => s.trim());

    const isHostApproved =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      allowedSuffixes.some((suffix) => hostname.endsWith(suffix));

    if (!isHostApproved) {
      return new NextResponse(
        `Security Policy: Host ${hostname} is not permitted for live preview framing.`,
        { status: 403 }
      );
    }

    // Fetch the target webpage
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 HextorqStudio/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return new NextResponse(
        `Target deployment returned status ${response.status} ${response.statusText}`,
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      // Direct pass-through for non-html assets
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    let html = await response.text();
    const origin = parsedUrl.origin;

    // Rewrite all asset paths across the entire document
    html = html.replaceAll('/_next/', `${origin}/_next/`);
    html = html.replaceAll('/brand/', `${origin}/brand/`);
    html = html.replaceAll('/slides/', `${origin}/slides/`);
    html = html.replaceAll('/icons/', `${origin}/icons/`);
    html = html.replaceAll('/fonts/', `${origin}/fonts/`);
    html = html.replaceAll("url('/", `url('${origin}/`);
    html = html.replaceAll('url("/', `url("${origin}/`);

    // Rewrite standard attributes for any remaining root paths
    html = html.replace(/(src|href|poster)=["']\/([^"'\/][^"']*)["']/gi, (match, attr, path) => {
      return `${attr}="${origin}/${path}"`;
    });

    // Replace the SSR slider loading placeholder with the real luxury hero slider
    const ssrPlaceholderPattern = /<div class="[^"]*slider-container[^"]*justify-content-center[^"]*">[\s\S]*?Loading slider\.\.\.[\s\S]*?<\/div>\s*<\/div>/i;
    const realHeroSlider = `
    <div class="jsx-b46bd62176148f33 slider-container" id="hero">
      <div class="slide" id="hextorq-hero-slide" style="cursor: pointer; opacity: 1;">
        <img id="hextorq-hero-img" alt="Harry Clinton Atelier 1" loading="eager" decoding="async" class="jsx-b46bd62176148f33 slide-media" src="https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261006160524_6500ED59-E1EA-4CD2-BB65-4CD1E72710FC.png">
      </div>
      <button type="button" id="hextorq-hero-prev" aria-label="Previous slide" class="jsx-b46bd62176148f33 custom-arrow custom-prev">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="jsx-b46bd62176148f33"><polyline points="15 18 9 12 15 6" class="jsx-b46bd62176148f33"></polyline></svg>
      </button>
      <button type="button" id="hextorq-hero-next" aria-label="Next slide" class="jsx-b46bd62176148f33 custom-arrow custom-next">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="jsx-b46bd62176148f33"><polyline points="9 18 15 12 9 6" class="jsx-b46bd62176148f33"></polyline></svg>
      </button>
      <div class="jsx-b46bd62176148f33 slider-dots" id="hextorq-hero-dots">
        <button type="button" data-dot-idx="0" aria-label="Go to slide 1" class="jsx-b46bd62176148f33 slider-dot active"></button>
        <button type="button" data-dot-idx="1" aria-label="Go to slide 2" class="jsx-b46bd62176148f33 slider-dot"></button>
        <button type="button" data-dot-idx="2" aria-label="Go to slide 3" class="jsx-b46bd62176148f33 slider-dot"></button>
        <button type="button" data-dot-idx="3" aria-label="Go to slide 4" class="jsx-b46bd62176148f33 slider-dot"></button>
      </div>
    </div>
    `;

    if (ssrPlaceholderPattern.test(html)) {
      html = html.replace(ssrPlaceholderPattern, realHeroSlider);
    }

    // Strip meta Content-Security-Policy if present
    html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');

    // Injected styles and bridge script
    const studioInjection = `
    <base href="${origin}/" />
    <style id="hextorq-critical-site-css">
      ${CRITICAL_STYLED_JSX_CSS}
    </style>
    <style id="hextorq-bridge-overrides">
      /* Ensure full scrollability */
      html, body {
        overflow-y: auto !important;
        min-height: 100% !important;
        -webkit-overflow-scrolling: touch !important;
      }
      /* Dismiss blocking full-screen intro video overlay */
      div[role="dialog"][aria-label*="intro"],
      div[class*="z-[100]"][class*="fixed"] {
        display: none !important;
      }
      /* Ensure live pins layer is glued to the document and scrolls with content */
      #hextorq-pins-layer {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        min-height: 100% !important;
        pointer-events: none !important;
        z-index: 999999 !important;
      }
      .hextorq-live-pin {
        position: absolute !important;
        transform: translate(-50%, -50%) !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        z-index: 1000000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 28px !important;
        height: 28px !important;
        border-radius: 9999px !important;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease !important;
        user-select: none !important;
      }
      .hextorq-live-pin:hover {
        transform: translate(-50%, -50%) scale(1.18) !important;
      }
      .hextorq-pin-selected {
        background: #fbbf24 !important;
        color: #09090b !important;
        border: 2px solid #ffffff !important;
        box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.4), 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
      }
      .hextorq-pin-default {
        background: #18181b !important;
        color: #f4f4f5 !important;
        border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
        box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.5) !important;
      }
      .hextorq-pin-resolved {
        background: #27272a !important;
        color: #a1a1aa !important;
        border: 1px solid #3f3f46 !important;
        opacity: 0.8 !important;
      }
      .hextorq-pin-tooltip {
        position: absolute !important;
        top: 100% !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        margin-top: 8px !important;
        background: #0e1017 !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        color: #f4f4f5 !important;
        border-radius: 8px !important;
        padding: 6px 10px !important;
        font-size: 11px !important;
        font-family: sans-serif !important;
        font-weight: 500 !important;
        white-space: nowrap !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8) !important;
        pointer-events: none !important;
        display: none !important;
        z-index: 1000001 !important;
      }
      .hextorq-live-pin:hover .hextorq-pin-tooltip {
        display: block !important;
      }
      /* Pin dropping mode overlay inside iframe */
      body.hextorq-pin-mode-active {
        cursor: crosshair !important;
      }
      body.hextorq-pin-mode-active * {
        cursor: crosshair !important;
      }
    </style>
    <script id="hextorq-bridge-script">
      (function() {
        var isPinMode = false;
        var pinsData = [];
        var activePinId = null;

        // Ensure pins layer container exists in document body
        function ensurePinsLayer() {
          var layer = document.getElementById('hextorq-pins-layer');
          if (!layer && document.body) {
            layer = document.createElement('div');
            layer.id = 'hextorq-pins-layer';
            document.body.appendChild(layer);
          }
          return layer;
        }

        // Auto-dismiss blocking intro overlay if present
        function dismissIntro() {
          try {
            var skipBtn = document.querySelector('button[aria-label*="Skip"], button[aria-label*="skip"]');
            if (skipBtn) skipBtn.click();
            var intro = document.querySelector('div[role="dialog"][aria-label*="intro"], div[class*="z-[100]"][class*="fixed"]');
            if (intro) {
              intro.remove();
              document.body.style.overflow = 'auto';
            }
          } catch(e) {}
        }
        document.addEventListener('DOMContentLoaded', dismissIntro);
        setTimeout(dismissIntro, 200);
        setTimeout(dismissIntro, 800);

        // Interactive Hero Carousel handler
        var slideImages = [
          'https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261006160524_6500ED59-E1EA-4CD2-BB65-4CD1E72710FC.png',
          'https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261006160638_86ED0509-9250-4195-948E-21D3236F3875.png',
          'https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261006160548_C7E1925C-741C-4DE7-9D8F-B826FF1D02E5.png',
          'https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261006160608_1ED192E6-D31E-4813-A7D6-9883584852BE.png'
        ];
        var currentSlideIdx = 0;

        function setSlide(idx) {
          currentSlideIdx = (idx + slideImages.length) % slideImages.length;
          var img = document.getElementById('hextorq-hero-img');
          if (img) {
            img.src = slideImages[currentSlideIdx];
          }
          var dots = document.querySelectorAll('#hextorq-hero-dots button');
          dots.forEach(function(dot, i) {
            if (i === currentSlideIdx) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }

        document.addEventListener('DOMContentLoaded', function() {
          var prevBtn = document.getElementById('hextorq-hero-prev');
          var nextBtn = document.getElementById('hextorq-hero-next');
          if (prevBtn) prevBtn.addEventListener('click', function(e) { e.preventDefault(); setSlide(currentSlideIdx - 1); });
          if (nextBtn) nextBtn.addEventListener('click', function(e) { e.preventDefault(); setSlide(currentSlideIdx + 1); });

          var dots = document.querySelectorAll('#hextorq-hero-dots button');
          dots.forEach(function(dot, i) {
            dot.addEventListener('click', function(e) { e.preventDefault(); setSlide(i); });
          });

          // Auto-advance slides every 5 seconds
          setInterval(function() {
            setSlide(currentSlideIdx + 1);
          }, 5000);

          // Hamburger toggle
          var hamburger = document.querySelector('.hamburger');
          var topmenu = document.querySelector('.topmenu');
          if (hamburger && topmenu) {
            hamburger.addEventListener('click', function(e) {
              e.preventDefault();
              hamburger.classList.toggle('active');
              topmenu.classList.toggle('show');
            });
          }
        });

        // Render pins directly inside the document so they scroll with page natively
        function renderPins() {
          var layer = ensurePinsLayer();
          if (!layer) return;
          layer.innerHTML = '';

          pinsData.forEach(function(anno) {
            var pinEl = document.createElement('div');
            pinEl.className = 'hextorq-live-pin ' + (anno.id === activePinId ? 'hextorq-pin-selected' : anno.status === 'resolved' ? 'hextorq-pin-resolved' : 'hextorq-pin-default');
            
            // Calculate document Y position
            var docY = anno.document_y !== undefined ? anno.document_y : (anno.position_y / 100) * (anno.viewport_height || 900);
            pinEl.style.left = anno.position_x + '%';
            pinEl.style.top = docY + 'px';

            pinEl.innerHTML = '<span>' + anno.pin_number + '</span>' +
              '<div class="hextorq-pin-tooltip">' +
                '<strong>' + (anno.title || 'Pin #' + anno.pin_number) + '</strong><br/>' +
                '<span style="opacity: 0.7; text-transform: uppercase; font-size: 9px;">' + (anno.priority || 'medium') + ' · ' + (anno.status || 'open') + '</span>' +
              '</div>';

            pinEl.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              window.parent.postMessage({
                type: 'HEXTORQ_SELECT_PIN',
                pinId: anno.id
              }, '*');
            });

            layer.appendChild(pinEl);
          });
        }

        // Broadcast scroll events to parent window
        function reportScroll() {
          try {
            var scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            var scrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
            window.parent.postMessage({
              type: 'HEXTORQ_STUDIO_SCROLL',
              scrollY: scrollY,
              scrollX: scrollX,
              scrollHeight: document.documentElement.scrollHeight || document.body.scrollHeight || 0,
              clientHeight: document.documentElement.clientHeight || window.innerHeight || 0
            }, '*');
          } catch(e) {}
        }

        window.addEventListener('scroll', reportScroll, { passive: true });
        window.addEventListener('resize', reportScroll, { passive: true });
        document.addEventListener('DOMContentLoaded', reportScroll);
        setTimeout(reportScroll, 300);
        setTimeout(reportScroll, 1000);

        // Click interceptor when Pin Dropping Mode is active
        document.addEventListener('click', function(e) {
          if (!isPinMode) return;
          if (e.target && e.target.closest('#hextorq-pins-layer')) return;

          e.preventDefault();
          e.stopPropagation();

          var scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          var scrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
          var docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);

          var pageX = e.pageX !== undefined ? e.pageX : e.clientX + scrollX;
          var pageY = e.pageY !== undefined ? e.pageY : e.clientY + scrollY;

          var posX = Number(((pageX / docWidth) * 100).toFixed(2));
          var posY = Number(((e.clientY / window.innerHeight) * 100).toFixed(2));

          window.parent.postMessage({
            type: 'HEXTORQ_PIN_DROPPED',
            position_x: posX,
            position_y: posY,
            document_y: pageY,
            viewport_y: e.clientY
          }, '*');
        }, true);

        // Listen for control messages from parent ReviewStudio
        window.addEventListener('message', function(event) {
          if (!event.data) return;

          if (event.data.type === 'HEXTORQ_SET_PIN_MODE') {
            isPinMode = !!event.data.enabled;
            if (isPinMode) {
              document.body.classList.add('hextorq-pin-mode-active');
            } else {
              document.body.classList.remove('hextorq-pin-mode-active');
            }
          }

          if (event.data.type === 'HEXTORQ_SYNC_PINS') {
            pinsData = event.data.pins || [];
            activePinId = event.data.activePinId || null;
            renderPins();
          }

          if (event.data.type === 'HEXTORQ_SCROLL_TO') {
            window.scrollTo({
              top: event.data.top,
              behavior: 'smooth'
            });
          }
        });

        // Request initial pin sync from parent once DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
          ensurePinsLayer();
          window.parent.postMessage({ type: 'HEXTORQ_FRAME_READY' }, '*');
        });
      })();
    </script>
    `;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n${studioInjection}`);
    } else {
      html = `<head>${studioInjection}</head>${html}`;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err.message}`, { status: 500 });
  }
}
