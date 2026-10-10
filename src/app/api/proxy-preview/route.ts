import { NextRequest, NextResponse } from 'next/server';

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

    // Inject <base> tag so all relative assets (CSS, JS, fonts, images) load from target origin
    const baseTag = `<base href="${origin}/" target="_blank" />`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n    ${baseTag}`);
    } else {
      html = `<head>${baseTag}</head>${html}`;
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
