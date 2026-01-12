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
        // Use node-fetch style with proper headers
        const url = `https://api.psacard.com/publicapi/cert/GetByCertNumber/${certNumber}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.psacard.com/',
                'Origin': 'https://www.psacard.com'
            }
        });

        const text = await response.text();
        
        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse response:', text);
            return res.status(500).json({ 
                error: 'Invalid response from PSA',
                details: 'Response was not valid JSON',
                raw: text.substring(0, 200)
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `PSA API returned ${response.status}`,
                data: data
            });
        }

        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch PSA data',
            details: error.message,
            stack: error.stack
        });
    }
}
