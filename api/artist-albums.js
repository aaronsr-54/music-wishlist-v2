export default async (req, res) => {
  const { id } = req.query;

  console.log('artist-albums request:', { id });

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    const url = `https://api.deezer.com/artist/${id}/albums?limit=50`;
    console.log('Fetching from Deezer:', url);
    const response = await fetch(url);
    const data = await response.json();

    console.log('Deezer response:', data);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    console.error('Error in artist-albums:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
