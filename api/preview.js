export default async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(decodeURIComponent(url), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.deezer.com/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch audio: ${response.status}` });
    }

    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    return res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
