// 教材サイトのBasic認証つき配信Worker。
// 認証情報はCloudflareダッシュボードのSecrets(BASIC_AUTH_USER / BASIC_AUTH_PASSWORD)で設定する。
// 未設定の間は認証なしでそのまま配信する(デプロイしただけではロックされない)。

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Rootia Curriculum", charset="UTF-8"',
      'Cache-Control': 'no-store'
    }
  });
}

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const user = env.BASIC_AUTH_USER;
    const pass = env.BASIC_AUTH_PASSWORD;

    // Secrets未設定なら認証をスキップして静的アセットを配信
    if (user && pass) {
      const auth = request.headers.get('Authorization') || '';
      if (!auth.startsWith('Basic ')) return unauthorized();
      let decoded;
      try {
        decoded = atob(auth.slice(6));
      } catch {
        return unauthorized();
      }
      const sep = decoded.indexOf(':');
      if (sep < 0) return unauthorized();
      const okUser = timingSafeEqual(decoded.slice(0, sep), user);
      const okPass = timingSafeEqual(decoded.slice(sep + 1), pass);
      if (!okUser || !okPass) return unauthorized();
    }

    return env.ASSETS.fetch(request);
  }
};
