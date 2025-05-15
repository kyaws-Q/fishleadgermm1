import { NextApiRequest, NextApiResponse } from 'next';

const MARITIME_API_KEY = process.env.MARITIME_API_KEY || '3fd4a9f30amsh950562621999ec2p1b32c8jsnf7faa1c1fd1f';
const MARITIME_API_HOST = 'maritime-ships-and-ports-database.p.rapidapi.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract search parameters
  const { query, imo, mmsi, type, flag, origin, destination } = req.query;

  try {
    const queryParams = new URLSearchParams();
    
    // Handle IMO number search
    if (imo) {
      // Validate IMO number format (7 digits)
      if (!/^\d{7}$/.test(String(imo))) {
        return res.status(400).json({ error: 'Invalid IMO number format. Must be 7 digits.' });
      }
      queryParams.append('imo', String(imo));
    }
    // Handle general search query
    else if (query) {
      queryParams.append('name', String(query));
    }
    
    // Add other search parameters
    if (mmsi) queryParams.append('mmsi', String(mmsi));
    if (type) queryParams.append('type', String(type));
    if (flag) queryParams.append('flag', String(flag));
    if (origin) queryParams.append('origin', String(origin));
    if (destination) queryParams.append('destination', String(destination));
    
    // Always filter for cargo ships when no specific type is provided
    if (!type) {
      queryParams.append('type', 'cargo');
    }

    const url = `https://${MARITIME_API_HOST}/api/v0/vessel_find?${queryParams.toString()}`;

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
    
    // If no vessels found and it's an IMO search, try a general search
    if (imo && (!data.vessels || data.vessels.length === 0)) {
      const generalQueryParams = new URLSearchParams();
      generalQueryParams.append('name', String(imo));
      if (type) generalQueryParams.append('type', String(type));
      
      const generalUrl = `https://${MARITIME_API_HOST}/api/v0/vessel_find?${generalQueryParams.toString()}`;
      
      const generalResponse = await fetch(generalUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': MARITIME_API_HOST,
          'x-rapidapi-key': MARITIME_API_KEY,
        },
      });
      
      if (generalResponse.ok) {
        const generalData = await generalResponse.json();
        if (generalData.vessels && generalData.vessels.length > 0) {
          return res.status(200).json(generalData);
        }
      }
      
      // If still no results, return a more specific error
      return res.status(404).json({ 
        error: `No vessel found with IMO number ${imo}`,
        searchType: 'imo',
        searchValue: imo
      });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching vessel data:', error);
    return res.status(500).json({ error: 'Failed to fetch vessel data' });
  }
}
