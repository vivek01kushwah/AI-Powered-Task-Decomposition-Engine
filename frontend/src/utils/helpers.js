// String utilities
export const truncateString = (str, length) => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

// Date utilities
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US');
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Sorting utilities
export const sortByDate = (arr, key = 'createdAt', ascending = false) => {
  return [...arr].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Filtering utilities
export const filterByStatus = (arr, status) => {
  return arr.filter((item) => item.status === status);
};

export const filterByPriority = (arr, priority) => {
  return arr.filter((item) => item.priority === priority);
};
