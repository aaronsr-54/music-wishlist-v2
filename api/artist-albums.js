export default async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    const url = `https://api.deezer.com/artist/${id}/albums?limit=50`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    console.error('Error in artist-albums:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
