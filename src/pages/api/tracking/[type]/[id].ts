// Simulated vessel data for the Myanmar-Singapore-Dubai route
const SIMULATED_VESSELS = [
  {
    tracking_id: "d31zmgq5-qemq-tdwk-ulxm-wiykzxpqxy3j",
    mmsi: "123456789",
    imo: "9876543",
    ship_name: "FISH CARRIER 1",
    latitude: 16.8661,
    longitude: 96.1951,
    speed: 12,
    course: 165,
    status: "En Route to Singapore",
    timestamp: new Date().toISOString(),
    dsrc: "AIS",
    eta: "2024-05-15T14:00:00Z",
    type: "Fish Carrier",
    cargo: "Frozen Fish",
    details: {
      origin: {
        port: "Yangon Port",
        country: "Myanmar",
        departure: "2024-05-10T08:00:00Z"
      },
      destination: {
        port: "Port of Singapore",
        country: "Singapore",
        arrival: "2024-05-15T14:00:00Z"
      },
      cargo: {
        type: "Frozen Fish",
        quantity: "2500 MT",
        temperature: -18,
        containers: [
          { number: "MRKU1234567", type: "Reefer", temperature: -18 },
          { number: "MRKU1234568", type: "Reefer", temperature: -18 },
          { number: "MRKU1234569", type: "Reefer", temperature: -18 }
        ]
      },
      route: {
        name: "Myanmar - Singapore",
        distance: 1647, // nautical miles
        completed: 35, // percentage
        waypoints: [
          {
            name: "Yangon Port",
            lat: 16.8661,
            lng: 96.1951,
            status: "Departed",
            timestamp: "2024-05-10T08:00:00Z"
          },
          {
            name: "Malacca Strait",
            lat: 3.1390,
            lng: 100.6869,
            status: "In Transit",
            timestamp: "2024-05-12T15:30:00Z"
          },
          {
            name: "Port of Singapore",
            lat: 1.3521,
            lng: 103.8198,
            status: "Pending",
            eta: "2024-05-15T14:00:00Z"
          }
        ]
      },
      vessel: {
        length: 180,
        beam: 28,
        draft: 10.5,
        flag: "Panama",
        built: 2018,
        reefer_capacity: 2800, // TEU
        speed_max: 20, // knots
        speed_average: 15 // knots
      }
    }
  },
  {
    tracking_id: "e42yngr6-pemr-uexl-vmyn-xjzlayqryz4k",
    mmsi: "987654321",
    imo: "1234567",
    ship_name: "SEAFOOD EXPRESS",
    latitude: 3.1390,
    longitude: 101.6869,
    speed: 15,
    course: 45,
    status: "En Route to Dubai",
    timestamp: new Date().toISOString(),
    dsrc: "AIS",
    eta: "2024-05-20T08:00:00Z",
    type: "Reefer",
    cargo: "Frozen Seafood",
    details: {
      origin: {
        port: "Port of Singapore",
        country: "Singapore",
        departure: "2024-05-18T10:00:00Z"
      },
      destination: {
        port: "Port of Dubai",
        country: "UAE",
        arrival: "2024-05-20T08:00:00Z"
      },
      cargo: {
        type: "Mixed Frozen Seafood",
        quantity: "1800 MT",
        temperature: -20,
        containers: [
          { number: "SEGU7654321", type: "Reefer", temperature: -20 },
          { number: "SEGU7654322", type: "Reefer", temperature: -20 }
        ]
      },
      route: {
        name: "Singapore - Dubai",
        distance: 3852, // nautical miles
        completed: 15, // percentage
        waypoints: [
          {
            name: "Port of Singapore",
            lat: 1.3521,
            lng: 103.8198,
            status: "Departed",
            timestamp: "2024-05-18T10:00:00Z"
          },
          {
            name: "Strait of Malacca",
            lat: 3.1390,
            lng: 101.6869,
            status: "In Transit",
            timestamp: "2024-05-19T06:00:00Z"
          },
          {
            name: "Port of Dubai",
            lat: 25.2048,
            lng: 55.2708,
            status: "Pending",
            eta: "2024-05-20T08:00:00Z"
          }
        ]
      },
      vessel: {
        length: 165,
        beam: 25,
        draft: 9.8,
        flag: "Singapore",
        built: 2020,
        reefer_capacity: 2200, // TEU
        speed_max: 18, // knots
        speed_average: 14 // knots
      }
    }
  }
];

// Predefined routes with more details
const ROUTES = {
  MYANMAR_SINGAPORE: {
    name: "Myanmar - Singapore",
    description: "Main fish cargo route from Myanmar to Singapore",
    distance: 1647,
    duration: "5-6 days",
    waypoints: [
      { 
        lat: 16.8661, 
        lng: 96.1951, 
        name: "Yangon",
        country: "Myanmar",
        type: "Port",
        facilities: ["Reefer Storage", "Container Terminal"]
      },
      { 
        lat: 1.3521, 
        lng: 103.8198, 
        name: "Singapore",
        country: "Singapore",
        type: "Hub Port",
        facilities: ["Reefer Terminal", "Transshipment Hub"]
      }
    ],
    checkpoints: [
      {
        name: "Malacca Strait",
        lat: 3.1390,
        lng: 100.6869,
        type: "Maritime Checkpoint"
      }
    ]
  },
  SINGAPORE_DUBAI: {
    name: "Singapore - Dubai",
    description: "Main distribution route to Middle East",
    distance: 3852,
    duration: "10-12 days",
    waypoints: [
      { 
        lat: 1.3521, 
        lng: 103.8198, 
        name: "Singapore",
        country: "Singapore",
        type: "Hub Port",
        facilities: ["Reefer Terminal", "Transshipment Hub"]
      },
      { 
        lat: 25.2048, 
        lng: 55.2708, 
        name: "Dubai",
        country: "UAE",
        type: "Destination Port",
        facilities: ["Cold Storage", "Distribution Center"]
      }
    ],
    checkpoints: [
      {
        name: "Strait of Hormuz",
        lat: 26.5920,
        lng: 56.2474,
        type: "Maritime Checkpoint"
      }
    ]
  }
};

// Helper function to validate tracking IDs
const validateTrackingId = (id: string, type: string): boolean => {
  switch (type) {
    case 'tracking':
      // UUID-style tracking ID
      return /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/.test(id);
    case 'container':
      // Container number format: 4 letters + 7 numbers (e.g., MEDU1234567)
      return /^[A-Z]{4}\d{7}$/.test(id);
    case 'vessel':
      // IMO number format: "IMO" + 7 numbers or vessel name
      return /^(IMO\d{7}|[A-Za-z0-9\s-]{2,50})$/.test(id);
    default:
      return false;
  }
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, id } = req.query;

  if (!type || !id || typeof type !== 'string' || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  if (!validateTrackingId(id, type)) {
    return res.status(400).json({ error: 'Invalid tracking ID format' });
  }

  try {
    if (type === 'tracking') {
      // Find vessel by tracking ID
      const vessel = SIMULATED_VESSELS.find(v => v.tracking_id === id);

      if (!vessel) {
        return res.status(404).json({ error: 'Tracking ID not found' });
      }

      // Determine current route segment
      const route = vessel.details.route;
      const currentWaypoint = route.waypoints.find(wp => wp.status === 'In Transit');
      
      return res.status(200).json({
        tracking_id: vessel.tracking_id,
        vessel: {
          name: vessel.ship_name,
          imo: vessel.imo,
          mmsi: vessel.mmsi,
          type: vessel.type,
          flag: vessel.details.vessel.flag,
          specs: vessel.details.vessel
        },
        position: {
          latitude: vessel.latitude,
          longitude: vessel.longitude,
          speed: vessel.speed,
          course: vessel.course,
          last_update: vessel.timestamp
        },
        route: {
          name: route.name,
          distance: route.distance,
          progress: route.completed,
          current_segment: currentWaypoint?.name || 'Unknown',
          origin: vessel.details.origin,
          destination: vessel.details.destination,
          waypoints: route.waypoints
        },
        cargo: vessel.details.cargo,
        eta: vessel.eta,
        status: vessel.status
      });
    }

    if (type === 'vessel') {
      // For now, return simulated data
      const vessel = SIMULATED_VESSELS.find(v => 
        v.mmsi === id || 
        v.imo === id || 
        v.ship_name.toLowerCase() === id.toString().toLowerCase()
      );

      if (!vessel) {
        return res.status(404).json({ error: 'Vessel not found' });
      }

      return res.status(200).json({
        vessel,
        route: vessel.latitude > 10 ? ROUTES.MYANMAR_SINGAPORE : ROUTES.SINGAPORE_DUBAI
      });
    }

    if (type === 'route') {
      const route = ROUTES[id as keyof typeof ROUTES];
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }

      // Find vessels on this route
      const vessels = SIMULATED_VESSELS.filter(vessel => {
        // Simple check if vessel is near the route
        const isNearRoute = route.waypoints.some(waypoint => {
          const distance = calculateDistance(
            vessel.latitude,
            vessel.longitude,
            waypoint.lat,
            waypoint.lng
          );
          return distance < 500; // Within 500km of any waypoint
        });
        return isNearRoute;
      });

      return res.status(200).json({
        route,
        vessels
      });
    }

    return res.status(400).json({ error: 'Invalid tracking type' });
  } catch (error) {
    console.error('Tracking API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch tracking information' });
  }
}

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number) {
  return degrees * (Math.PI / 180);
} 