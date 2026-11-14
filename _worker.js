/**
 * Cloudflare Worker fronting the static Learning Lab site.
 * Proxies ebook PDFs from the API host so pdf.js can load them (CORS).
 */
const ALLOWED_PREFIXES = [
  'https://alpha25-learning-lab-1.onrender.com/storage/',
  'https://alpha25-learning-lab-1.onrender.com/api/',
];

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Type, Accept-Ranges',
    ...extra,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/pdf-proxy') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }
      if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
      }

      const target = url.searchParams.get('url') || '';
      if (!ALLOWED_PREFIXES.some((prefix) => target.startsWith(prefix))) {
        return new Response('Forbidden', { status: 403, headers: corsHeaders() });
      }

      const upstream = await fetch(target, {
        headers: { Accept: 'application/pdf,*/*' },
        redirect: 'follow',
      });

      return new Response(upstream.body, {
        status: upstream.status,
        headers: corsHeaders({
          'Content-Type': upstream.headers.get('Content-Type') || 'application/pdf',
          'Cache-Control': 'public, max-age=3600',
        }),
      });
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  },
};
