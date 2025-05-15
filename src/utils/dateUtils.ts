import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @param formatStr The format string (defaults to 'MMM d, yyyy')
 * @returns Formatted date string or fallback to original if invalid
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    if (!dateString) return 'N/A';
    
    // Try to parse the date
    const date = parseISO(dateString);
    
    // Check if the date is valid
    if (!isValid(date)) {
      return dateString;
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Compare two dates for filtering
 * @param date The date to compare
 * @param filterDate The filter date to compare against
 * @returns True if date is same day as filter date
 */
export const isSameDay = (date: string, filterDate: Date): boolean => {
  try {
    const parsedDate = parseISO(date);
    return (
      parsedDate.getDate() === filterDate.getDate() &&
      parsedDate.getMonth() === filterDate.getMonth() &&
      parsedDate.getFullYear() === filterDate.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is within a specific time frame (today, week, month, etc.)
 * @param date The date to check
 * @param timeFrame The time frame to check against
 * @returns True if date is within time frame
 */
export const isWithinTimeFrame = (date: string, timeFrame: string): boolean => {
  try {
    const parsedDate = parseISO(date);
    const today = new Date();
    
    switch (timeFrame) {
      case 'today':
        return (
          parsedDate.getDate() === today.getDate() &&
          parsedDate.getMonth() === today.getMonth() &&
          parsedDate.getFullYear() === today.getFullYear()
        );
      case 'week':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return parsedDate >= oneWeekAgo;
      case 'month':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return parsedDate >= oneMonthAgo;
      case '3months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return parsedDate >= threeMonthsAgo;
      case '6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return parsedDate >= sixMonthsAgo;
      case 'year':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        return parsedDate >= oneYearAgo;
      case 'all':
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking time frame:', error);
    return false;
  }
}; 