// Predefined shipping routes for the fish cargo tracking demo
export const PREDEFINED_ROUTES = {
  MYANMAR_TO_SINGAPORE: {
    name: "Myanmar to Singapore Route",
    description: "Shipping route from Yangon, Myanmar to Singapore",
    waypoints: [
      {
        name: "Yangon Port, Myanmar",
        lat: 16.7689,
        lng: 96.1711,
        timestamp: "2024-05-01T08:00:00Z"
      },
      {
        name: "Andaman Sea",
        lat: 12.5000,
        lng: 96.5000,
        timestamp: "2024-05-03T14:00:00Z"
      },
      {
        name: "Malacca Strait",
        lat: 6.2500,
        lng: 99.8000,
        timestamp: "2024-05-06T10:00:00Z"
      },
      {
        name: "Singapore Port",
        lat: 1.2655,
        lng: 103.8242,
        timestamp: "2024-05-10T16:00:00Z"
      }
    ]
  },
  MYANMAR_TO_DUBAI: {
    name: "Myanmar to Dubai Route",
    description: "Shipping route from Yangon, Myanmar to Dubai, UAE",
    waypoints: [
      {
        name: "Yangon Port, Myanmar",
        lat: 16.7689,
        lng: 96.1711,
        timestamp: "2024-05-01T08:00:00Z"
      },
      {
        name: "Bay of Bengal",
        lat: 15.0000,
        lng: 90.0000,
        timestamp: "2024-05-04T12:00:00Z"
      },
      {
        name: "Arabian Sea",
        lat: 14.5000,
        lng: 70.0000,
        timestamp: "2024-05-10T09:00:00Z"
      },
      {
        name: "Gulf of Oman",
        lat: 24.0000,
        lng: 60.0000,
        timestamp: "2024-05-15T14:00:00Z"
      },
      {
        name: "Persian Gulf",
        lat: 26.0000,
        lng: 54.0000,
        timestamp: "2024-05-18T10:00:00Z"
      },
      {
        name: "Dubai Port, UAE",
        lat: 25.2697,
        lng: 55.3094,
        timestamp: "2024-05-20T08:00:00Z"
      }
    ]
  }
};
