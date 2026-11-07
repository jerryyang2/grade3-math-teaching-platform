const loginPath = '/_classroom/login';
const logoutPath = '/_classroom/logout';
const cookieName = '__Host-classroom';
const sessionSeconds = 8 * 60 * 60;
const encoder = new TextEncoder();
const toHex = bytes => Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
const fromHex = hex => Uint8Array.from(hex.match(/../g), value => parseInt(value, 16));

function authHeaders() {
  return {
    'Cache-Control': 'private, no-store',
    'Referrer-Policy': 'same-origin',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff',
  };
}

function loginPage(destination, status = 401, message = '') {
  const escaped = destination.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  return new Response(`<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>網站登入｜數學學習教室</title>
<link rel="icon" type="image/svg+xml" href="/classroom-login.svg">
<style>
  * { box-sizing: border-box; }
  body { min-height: 100dvh; margin: 0; display: grid; place-items: center; padding: 1rem;
    font: 1rem/1.6 system-ui, sans-serif; background: #e9f0e3; color: #203c32; }
  main { width: min(100%, 28rem); padding: clamp(1.25rem, 6vw, 2.5rem); border-radius: 1.25rem;
    background: #fffdf5; border: 1px solid #acbca5; }
  h1 { margin: .3rem 0; font-size: clamp(1.6rem, 6vw, 2rem); line-height: 1.3; }
  p { margin: 0 0 1.1rem; }
  label { display: block; font-weight: 700; margin-bottom: .4rem; }
  input, button { width: 100%; min-height: 48px; border-radius: .6rem; padding: .55rem .7rem; font: inherit; }
  input { border: 1px solid #627b70; background: white; }
  button { margin-top: .85rem; border: 0; background: #245548; color: white; font-weight: 750; cursor: pointer; }
  :focus-visible { outline: 3px solid #925518; outline-offset: 3px; }
  [role="alert"] { color: #942b2b; margin-top: .7rem; }
</style>
</head>
<body><main>
<p>慢慢把數學玩懂</p>
<h1>數學學習教室</h1>
<p>請輸入課堂密碼，進入整學年的數學課程。</p>
<form action="${loginPath}" method="post">
<input type="hidden" name="next" value="${escaped}">
<label for="password">課堂密碼</label>
<input type="password" id="password" name="password" autocomplete="current-password" maxlength="128" required>
${message ? `<p role="alert">${message}</p>` : ''}
<button type="submit">進入學習教室</button>
</form>
</main></body></html>`, {
    status,
    headers: {
      ...authHeaders(),
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}

function safeDestination(candidate, origin) {
  if (typeof candidate !== 'string' || !candidate.startsWith('/')) return '/';
  try {
    const target = new URL(candidate, origin);
    if (target.origin === origin && target.pathname !== loginPath && !target.pathname.startsWith('//')) {
      return target.pathname + target.search;
    }
  } catch (_) {}
  return '/';
}

async function attemptTracker(request, key) {
  const address = request.headers.get('CF-Connecting-IP');
  if (!address || !globalThis.caches?.default) return null;
  const tag = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode('attempt:' + address)));
  const cacheKey = new Request(new URL('/_classroom/attempt/' + tag, request.url));
  const cache = caches.default;
  const previous = await cache.match(cacheKey);
  const attempts = previous ? Number(await previous.text()) || 0 : 0;
  return {
    limited: attempts >= 8,
    async fail() {
      await cache.put(cacheKey, new Response(String(attempts + 1), { headers: { 'Cache-Control': 'max-age=60' } }));
    },
  };
}

async function checkSession(request, key, now) {
  const cookies = request.headers.get('Cookie') || '';
  const token = cookies.split(/;\s*/).find(value => value.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  const match = token?.match(/^(\d{10})\.([a-f0-9]{64})$/);
  if (!match || Number(match[1]) <= now || Number(match[1]) > now + sessionSeconds) return false;
  return crypto.subtle.verify('HMAC', key, fromHex(match[2]), encoder.encode('session:' + match[1]));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/classroom-login.svg' && ['GET', 'HEAD'].includes(request.method)) {
      return env.ASSETS.fetch(new Request(new URL('/assets/icons/semester-book.svg', url), { method: request.method }));
    }

    if (url.pathname === logoutPath && request.method === 'POST') {
      if (request.headers.get('Origin') !== url.origin) {
        return new Response(null, { status: 403, headers: authHeaders() });
      }
      return new Response(null, {
        status: 303,
        headers: {
          ...authHeaders(),
          'Location': '/',
          'Set-Cookie': `${cookieName}=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax`,
        },
      });
    }

    const secret = env.CLASSROOM_AUTH?.match(/^([a-f0-9]{64}):([a-f0-9]{64})$/);
    if (!secret) {
      return new Response('學習教室暫時無法登入。', { status: 503, headers: authHeaders() });
    }
    const key = await crypto.subtle.importKey('raw', fromHex(secret[1]), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
    const now = Math.floor(Date.now() / 1000);

    if (url.pathname === loginPath && request.method === 'POST') {
      if (request.headers.get('Origin') !== url.origin ||
          request.headers.get('Content-Type')?.split(';')[0] !== 'application/x-www-form-urlencoded') {
        return new Response(null, { status: 403, headers: authHeaders() });
      }
      const tracker = await attemptTracker(request, key);
      if (tracker?.limited) return loginPage('/', 429, '嘗試次數過多，請稍等一分鐘再試。');
      if (Number(request.headers.get('Content-Length')) > 4096) {
        return new Response(null, { status: 413, headers: authHeaders() });
      }
      const body = await request.text();
      if (body.length > 4096) return new Response(null, { status: 413, headers: authHeaders() });
      const form = new URLSearchParams(body);
      const destination = safeDestination(form.get('next'), url.origin);
      const password = form.get('password') || '';
      const valid = password.length <= 128 &&
        await crypto.subtle.verify('HMAC', key, fromHex(secret[2]), encoder.encode('password:' + password));
      if (!valid) {
        await tracker?.fail();
        return loginPage(destination, 401, '密碼不正確，請再試一次。');
      }

      const expires = now + sessionSeconds;
      const signature = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode('session:' + expires)));
      return new Response(null, {
        status: 303,
        headers: {
          ...authHeaders(),
          'Location': destination,
          'Set-Cookie': `${cookieName}=${expires}.${signature}; Max-Age=${sessionSeconds}; Path=/; Secure; HttpOnly; SameSite=Lax`,
        },
      });
    }

    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response(null, { status: 405, headers: { ...authHeaders(), 'Allow': 'GET, HEAD' } });
    }
    if (url.pathname === loginPath) return loginPage('/');
    if (!await checkSession(request, key, now)) {
      if (request.method === 'GET' && request.headers.get('Accept')?.includes('text/html')) {
        return loginPage(url.pathname + url.search);
      }
      return new Response(null, { status: 401, headers: authHeaders() });
    }

    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    for (const [name, value] of Object.entries(authHeaders())) response.headers.set(name, value);
    return response;
  },
};
