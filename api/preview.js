export default async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(decodeURIComponent(url));

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch audio' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    return res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
