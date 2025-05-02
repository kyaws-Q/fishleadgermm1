import { FishPurchase } from "@/types";

// Generate random price between min and max
const randomPrice = (min: number, max: number) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

// Generate random quantity between min and max
const randomQuantity = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Calculate date X days ago
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Sample fish purchase data
export const mockPurchases: FishPurchase[] = [
  {
    id: "p1",
    companyName: "Ocean Fresh Ltd",
    buyerName: "John Seafood Inc",
    date: daysAgo(2),
    purchaseDate: daysAgo(2),
    fishName: "ROHU-G",
    sizeKg: 3.5,
    quantity: 120,
    pricePerUnit: 5.75,
    total: 2415,
    totalPrice: 2415
  },
  {
    id: "p2",
    companyName: "Global Fish Corp",
    buyerName: "Alice Restaurant",
    date: daysAgo(5),
    purchaseDate: daysAgo(5),
    fishName: "KATLA-G",
    sizeKg: 2.8,
    quantity: 80,
    pricePerUnit: 7.20,
    total: 2415,
    totalPrice: 576
  },
  {
    id: "p3",
    companyName: "Aqua Exports",
    buyerName: "Bob's Bistro",
    date: daysAgo(10),
    purchaseDate: daysAgo(10),
    fishName: "TILAPIA-W",
    sizeKg: 1.5,
    quantity: 200,
    pricePerUnit: 3.50,
    total: 2415,
    totalPrice: 700
  },
  {
    id: "p4",
    companyName: "Marine Harvest Co",
    buyerName: "Charlie's Cafe",
    date: daysAgo(15),
    purchaseDate: daysAgo(15),
    fishName: "MRIGAL",
    sizeKg: 4.0,
    quantity: 60,
    pricePerUnit: 6.00,
    total: 2415,
    totalPrice: 360
  },
  {
    id: "p5",
    companyName: "Coastal Seafoods",
    buyerName: "Diana's Diner",
    date: daysAgo(20),
    purchaseDate: daysAgo(20),
    fishName: "BASA FILLET",
    sizeKg: 0.8,
    quantity: 300,
    pricePerUnit: 4.25,
    total: 2415,
    totalPrice: 1275
  },
  {
    id: "p6",
    companyName: "Fresh Catch Inc",
    buyerName: "Eva's Eatery",
    date: daysAgo(25),
    purchaseDate: daysAgo(25),
    fishName: "PANGUS",
    sizeKg: 2.2,
    quantity: 90,
    pricePerUnit: 5.50,
    total: 2415,
    totalPrice: 495
  },
  {
    id: "p7",
    companyName: "Deep Sea Imports",
    buyerName: "Frank's Fish Market",
    date: daysAgo(30),
    purchaseDate: daysAgo(30),
    fishName: "SNAPPER",
    sizeKg: 1.2,
    quantity: 150,
    pricePerUnit: 8.00,
    total: 2415,
    totalPrice: 1200
  },
  {
    id: "p8",
    companyName: "Atlantic Fisheries",
    buyerName: "Grace's Grill",
    date: daysAgo(35),
    purchaseDate: daysAgo(35),
    fishName: "HILSA",
    sizeKg: 0.6,
    quantity: 400,
    pricePerUnit: 9.50,
    total: 2415,
    totalPrice: 3800
  },
  {
    id: "p9",
    companyName: "Pacific Rim Seafoods",
    buyerName: "Henry's Hot Pot",
    date: daysAgo(40),
    purchaseDate: daysAgo(40),
    fishName: "PRAWN",
    sizeKg: 0.4,
    quantity: 500,
    pricePerUnit: 12.00,
    total: 2415,
    totalPrice: 6000
  },
  {
    id: "p10",
    companyName: "Southern Ocean Ltd",
    buyerName: "Ivy's Ice Box",
    date: daysAgo(45),
    purchaseDate: daysAgo(45),
    fishName: "CARP",
    sizeKg: 3.0,
    quantity: 110,
    pricePerUnit: 4.75,
    total: 2415,
    totalPrice: 522.5
  }
];

// Function to filter purchases by date range
export const filterPurchasesByDate = (purchases: FishPurchase[], startDate: Date, endDate: Date) => {
  return purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.purchaseDate);
    return purchaseDate >= startDate && purchaseDate <= endDate;
  });
};

// Function to calculate total sales
export const calculateTotalSales = (purchases: FishPurchase[]) => {
  return purchases.reduce((total, purchase) => total + purchase.totalPrice, 0);
};

// Function to group purchases by fish type
export const groupByFishType = (purchases: FishPurchase[]) => {
  const groupedPurchases: Record<string, number> = {};
  
  purchases.forEach(purchase => {
    if (groupedPurchases[purchase.fishName]) {
      groupedPurchases[purchase.fishName] += purchase.totalPrice;
    } else {
      groupedPurchases[purchase.fishName] = purchase.totalPrice;
    }
  });
  
  return Object.entries(groupedPurchases).map(([fishName, totalAmount]) => ({
    fishName,
    totalAmount
  }));
};
