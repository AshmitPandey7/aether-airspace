import https from 'node:https';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { lamin, lamax, lomin, lomax } = req.query;

  const params = new URLSearchParams();
  if (lamin) params.set('lamin', lamin);
  if (lamax) params.set('lamax', lamax);
  if (lomin) params.set('lomin', lomin);
  if (lomax) params.set('lomax', lomax);

  const targetUrl = `https://opensky-network.org/api/states/all?${params.toString()}`;

  return new Promise((resolve) => {
    const authHeader = req.headers['authorization'];
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const request = https.get(
      targetUrl,
      {
        headers,
        family: 4, // CRITICAL: Force IPv4 to prevent AWS/Vercel IPv6 DNS hanging
        timeout: 9000
      },
      (upstreamRes) => {
        let rawData = '';
        upstreamRes.setEncoding('utf8');

        upstreamRes.on('data', (chunk) => {
          rawData += chunk;
        });

        upstreamRes.on('end', () => {
          res.setHeader('Content-Type', 'application/json');
          if (upstreamRes.statusCode === 200) {
            res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
            res.status(200).send(rawData);
          } else {
            res.status(upstreamRes.statusCode || 502).send(rawData);
          }
          resolve();
        });
      }
    );

    request.on('timeout', () => {
      request.destroy();
      res.status(504).json({ error: 'OpenSky gateway timeout' });
      resolve();
    });

    request.on('error', (err) => {
      res.status(502).json({ error: err.message || 'OpenSky transport error' });
      resolve();
    });
  });
}
