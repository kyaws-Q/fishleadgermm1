
import { FishPurchase } from "@/types";

// Mock fish data
const fishTypes = [
  "Tuna", "Salmon", "Cod", "Trout", "Haddock", "Mackerel", 
  "Coral", "Snapper", "Tilapia", "Sardine", "Grouper"
];

// Generate random date within the last year
const getRandomDate = () => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  return pastDate.toISOString();
};

// Generate a random fish purchase record
const generateRandomPurchase = (id: string): FishPurchase => {
  const sizeKg = Number((Math.random() * 10 + 0.5).toFixed(1));
  const quantity = Math.floor(Math.random() * 5) + 1;
  const pricePerUnit = Number((Math.random() * 20 + 5).toFixed(2));
  
  return {
    id,
    fishName: fishTypes[Math.floor(Math.random() * fishTypes.length)],
    sizeKg,
    quantity,
    pricePerUnit,
    purchaseDate: getRandomDate(),
    totalPrice: Number((sizeKg * quantity * pricePerUnit).toFixed(2))
  };
};

// Generate a specified number of mock purchases
export const generateMockPurchases = (count: number): FishPurchase[] => {
  const purchases: FishPurchase[] = [];
  
  for (let i = 0; i < count; i++) {
    purchases.push(generateRandomPurchase(`purchase-${i}`));
  }
  
  // Sort by date, newest first
  return purchases.sort((a, b) => {
    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
  });
};

// Filter purchases by date range
export const filterPurchasesByDateRange = (
  purchases: FishPurchase[], 
  startDate: Date, 
  endDate: Date
): FishPurchase[] => {
  return purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.purchaseDate);
    return purchaseDate >= startDate && purchaseDate <= endDate;
  });
};

// Calculate the total spending
export const calculateTotalSpending = (purchases: FishPurchase[]): number => {
  return purchases.reduce((total, purchase) => {
    return total + (purchase.totalPrice || 0);
  }, 0);
};

// Calculate spending by fish type
export const calculateSpendingByFishType = (purchases: FishPurchase[]): Record<string, number> => {
  const spendingByType: Record<string, number> = {};
  
  purchases.forEach(purchase => {
    if (!spendingByType[purchase.fishName]) {
      spendingByType[purchase.fishName] = 0;
    }
    spendingByType[purchase.fishName] += (purchase.totalPrice || 0);
  });
  
  return spendingByType;
};

// Get purchases by month
export const getPurchasesByMonth = (purchases: FishPurchase[]): Record<string, number> => {
  const purchasesByMonth: Record<string, number> = {};
  
  purchases.forEach(purchase => {
    const date = new Date(purchase.purchaseDate);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!purchasesByMonth[monthYear]) {
      purchasesByMonth[monthYear] = 0;
    }
    
    purchasesByMonth[monthYear] += (purchase.totalPrice || 0);
  });
  
  return purchasesByMonth;
};

// Initial mock data
export const initialMockPurchases = generateMockPurchases(30);
