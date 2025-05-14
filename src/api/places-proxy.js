// pages/api/places-proxy.js
export default async function handler(req, res) {
    try {
      const { location } = req.query;
      const apiUrl = `http://localhost:3000/api/places?location=${encodeURIComponent(location)}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      res.status(200).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  }