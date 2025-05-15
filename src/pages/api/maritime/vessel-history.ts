import { NextApiRequest, NextApiResponse } from 'next';

const MARITIME_API_KEY = process.env.MARITIME_API_KEY || '3fd4a9f30amsh950562621999ec2p1b32c8jsnf7faa1c1fd1f';
const MARITIME_API_HOST = 'maritime-ships-and-ports-database.p.rapidapi.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract vessel identifier parameters (assuming imo or mmsi)
  const { imo, mmsi } = req.query;

  if (!imo && !mmsi) {
    return res.status(400).json({ error: 'Either IMO or MMSI parameter is required' });
  }

  try {
    const queryParams = new URLSearchParams();
    if (imo) queryParams.append('imo', String(imo));
    if (mmsi) queryParams.append('mmsi', String(mmsi));

    const url = `https://${MARITIME_API_HOST}/api/v0/vessel_history?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': MARITIME_API_HOST,
        'x-rapidapi-key': MARITIME_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching vessel history:', error);
    return res.status(500).json({ error: 'Failed to fetch vessel history' });
  }
}
