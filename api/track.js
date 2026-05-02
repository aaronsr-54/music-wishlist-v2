export default async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    const response = await fetch(`https://api.deezer.com/track/${id}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch track: ${response.status}` });
    }

    const track = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({
      id: track.id,
      title: track.title,
      preview: track.preview,
      album: track.album,
      artist: track.artist,
    });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
