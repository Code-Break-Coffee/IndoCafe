/**
 * Generate and manage unique customer ID for unauthenticated orders
 * This allows us to track which customer placed orders from which table
 */

const CUSTOMER_ID_KEY = 'indoCafe_customerId';

export const getOrCreateCustomerId = () => {
  try {
    // Check if customer ID already exists
    let customerId = localStorage.getItem(CUSTOMER_ID_KEY);

    if (!customerId) {
      // Generate new unique customer ID (using timestamp + random)
      customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(CUSTOMER_ID_KEY, customerId);
    }

    return customerId;
  } catch (e) {
    console.error('Failed to get/create customer ID', e);
    // Fallback: generate temporary ID
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export const getCustomerId = () => {
  try {
    return localStorage.getItem(CUSTOMER_ID_KEY) || getOrCreateCustomerId();
  } catch {
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export const clearCustomerId = () => {
  try {
    localStorage.removeItem(CUSTOMER_ID_KEY);
  } catch (e) {
    console.error('Failed to clear customer ID', e);
  }
};
