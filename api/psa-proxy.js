// api/psa-proxy.js
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { certNumber } = req.query;
    
    if (!certNumber) {
        return res.status(400).json({ error: 'Certificate number required' });
    }

    try {
        const response = await fetch(
            `https://api.psacard.com/publicapi/cert/GetByCertNumber/${certNumber}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`PSA API returned ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch PSA data',
            details: error.message 
        });
    }
}
