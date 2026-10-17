export default async function handler(req, res) {
  // Enable CORS for all incoming client requests
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

  try {
    const authHeader = req.headers['authorization'];
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `OpenSky returned HTTP ${response.status}`,
        details: errText
      });
    }

    const data = await response.json();
    // Cache for 5s on edge to mitigate OpenSky anonymous rate limits
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to proxy OpenSky API' });
  }
}
