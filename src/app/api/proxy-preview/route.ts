import { NextRequest, NextResponse } from 'next/server';
import { HARRY_CLINTON_STYLES } from './extractedStyles';

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

    // Rewrite all root-relative asset paths in the entire HTML document
    html = html.replaceAll('/_next/', `${origin}/_next/`);
    html = html.replaceAll('"/brand/', `"${origin}/brand/`);
    html = html.replaceAll('\'/brand/', `'${origin}/brand/`);
    html = html.replaceAll('"/slides/', `"${origin}/slides/`);
    html = html.replaceAll('\'/slides/', `'${origin}/slides/`);

    // Rewrite HTML attributes for any remaining root paths
    html = html.replace(/(src|href|poster)=["']\/([^"'\/][^"']*)["']/gi, (match, attr, path) => {
      return `${attr}="${origin}/${path}"`;
    });

    // Replace SSR "Loading slider..." placeholder with high-res interactive carousel slider
    const realSliderHtml = `
    <div class="jsx-b46bd62176148f33 slider-container" id="hero">
      <div class="slide jsx-b46bd62176148f33" style="cursor: pointer; opacity: 1; z-index: 2;">
        <img alt="Harry Clinton Atelier 1" loading="eager" decoding="async" class="jsx-b46bd62176148f33 slide-media" src="https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261006160802_50D5AA40-0A24-4377-AD44-361090B186DA.png">
      </div>
      <div class="slide jsx-b46bd62176148f33" style="cursor: pointer; opacity: 0; z-index: 1;">
        <img alt="Harry Clinton Luxury Casual" loading="lazy" decoding="async" class="jsx-b46bd62176148f33 slide-media" src="https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261006160524_6500ED59-E1EA-4CD2-BB65-4CD1E72710FC.png">
      </div>
      <div class="slide jsx-b46bd62176148f33" style="cursor: pointer; opacity: 0; z-index: 1;">
        <img alt="Harry Clinton Bespoke Suiting" loading="lazy" decoding="async" class="jsx-b46bd62176148f33 slide-media" src="https://git-pipeline.metatronhost.in/hc/Uploads/HARRY_CLINTON/20261009142948_4099040F-0478-4DBF-B47D-336C1D1C0AA2.png">
      </div>
      <button type="button" aria-label="Previous slide" class="jsx-b46bd62176148f33 custom-arrow custom-prev">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="jsx-b46bd62176148f33"><polyline points="15 18 9 12 15 6" class="jsx-b46bd62176148f33"></polyline></svg>
      </button>
      <button type="button" aria-label="Next slide" class="jsx-b46bd62176148f33 custom-arrow custom-next">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="jsx-b46bd62176148f33"><polyline points="9 18 15 12 9 6" class="jsx-b46bd62176148f33"></polyline></svg>
      </button>
      <div class="jsx-b46bd62176148f33 slider-dots">
        <button aria-label="Go to slide 1" class="jsx-b46bd62176148f33 slider-dot active"></button>
        <button aria-label="Go to slide 2" class="jsx-b46bd62176148f33 slider-dot"></button>
        <button aria-label="Go to slide 3" class="jsx-b46bd62176148f33 slider-dot"></button>
      </div>
    </div>
    `;

    html = html.replace(/<div[^>]*class="[^"]*slider-container[^"]*"[^>]*>[\s\S]*?Loading slider\.\.\.[\s\S]*?<\/div>\s*<\/div>/i, realSliderHtml);

    // Inject top announcement ticker banner
    const topTickerHtml = `
    <div class="hc-top-ticker hc-bar-font relative flex h-8 items-center justify-between bg-black px-4 text-xs font-semibold uppercase tracking-widest text-[#E6C687] z-50">
      <button type="button" aria-label="Previous announcement" class="ticker-nav-btn ticker-prev jsx-bceef4e269f1976e">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <div class="mx-auto flex items-center justify-center text-center">
        <span>Linen shirt flat 2000 offer</span>
      </div>
      <button type="button" aria-label="Next announcement" class="ticker-nav-btn ticker-next jsx-bceef4e269f1976e">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>
    `;

    if (/<body[^>]*>/i.test(html)) {
      html = html.replace(/(<body[^>]*>)/i, `$1\n${topTickerHtml}`);
    }

    // Inject <base> tag and complete styled-jsx styles
    const studioInjection = `
    <base href="${origin}/" target="_blank" />
    <style id="hextorq-styled-jsx-complete">
      ${HARRY_CLINTON_STYLES}
    </style>
    <style id="hextorq-studio-overrides">
      /* Ensure proper scrollability and viewport containment */
      html, body {
        overflow-y: auto !important;
        min-height: 100% !important;
        touch-action: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
      /* Ensure mega-menu is closed by default and smoothly toggled */
      .topmenu {
        height: 0px !important;
        overflow: hidden !important;
        position: absolute !important;
        top: 100% !important;
        left: 0 !important;
        right: 0 !important;
      }
      .topmenu.show {
        height: min(340px, calc(100vh - 80px)) !important;
        overflow-y: auto !important;
      }
      /* Dismiss blocking splash overlays */
      div[aria-label="Harry Clinton intro"],
      div[role="dialog"][aria-label*="intro"],
      div[class*="z-[100]"][class*="fixed"] {
        display: none !important;
        pointer-events: none !important;
      }
    </style>
    <script id="hextorq-studio-helper">
      (function() {
        // Intercept relative fetch/XHR
        try {
          var origFetch = window.fetch;
          window.fetch = function(url, init) {
            if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
              url = '${origin}' + url;
            }
            return origFetch.call(this, url, init);
          };
        } catch(e) {}

        // Interactive fallbacks for navigation and hero slider
        document.addEventListener('DOMContentLoaded', function() {
          // 1. Hamburger menu toggle
          document.addEventListener('click', function(e) {
            var hamburger = e.target.closest('.hamburger, [class*="hamburger"]');
            if (hamburger) {
              e.preventDefault();
              e.stopPropagation();
              var topmenu = document.querySelector('.topmenu');
              if (topmenu) {
                var isOpen = topmenu.classList.toggle('show');
                hamburger.classList.toggle('active', isOpen);
              }
              return;
            }

            var closeBtn = e.target.closest('.btn-close, .modal-close');
            if (closeBtn) {
              var modal = closeBtn.closest('.appointment-modal-backdrop, .contact-modal');
              if (modal) {
                modal.style.display = 'none';
              }
            }
          });

          // 2. Carousel Slider Interactive Controls
          var currentSlide = 0;
          var slides = document.querySelectorAll('.slide');
          var dots = document.querySelectorAll('.slider-dot');

          function showSlide(index) {
            if (!slides.length) return;
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function(s, i) {
              s.style.opacity = i === currentSlide ? '1' : '0';
              s.style.zIndex = i === currentSlide ? '2' : '1';
            });
            dots.forEach(function(d, i) {
              if (i === currentSlide) d.classList.add('active');
              else d.classList.remove('active');
            });
          }

          document.addEventListener('click', function(e) {
            var nextBtn = e.target.closest('.custom-next');
            var prevBtn = e.target.closest('.custom-prev');
            if (nextBtn) {
              e.preventDefault();
              showSlide(currentSlide + 1);
              return;
            }
            if (prevBtn) {
              e.preventDefault();
              showSlide(currentSlide - 1);
              return;
            }
            var dot = e.target.closest('.slider-dot');
            if (dot && dots.length) {
              e.preventDefault();
              var dotIdx = Array.from(dots).indexOf(dot);
              if (dotIdx !== -1) {
                showSlide(dotIdx);
              }
            }
          });

          // Auto-advance slides every 5 seconds if idle
          if (slides.length > 1) {
            setInterval(function() {
              showSlide(currentSlide + 1);
            }, 5000);
          }
        });
      })();
    </script>
    `;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n${studioInjection}`);
    } else {
      html = `<head>${studioInjection}</head>${html}`;
    }

    // Strip any meta tags that set frame-ancestors
    html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');

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
