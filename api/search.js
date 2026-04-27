export default async (req, res) => {
  const { q, type = 'track' } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const endpoint = type === 'album' ? 'search/album' : 'search';
    const url = `https://api.deezer.com/${endpoint}?q=${encodeURIComponent(q)}&limit=10`;

    const response = await fetch(url);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
