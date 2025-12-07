// ============================================
// FILE: src/services/api.js
// API service for backend communication
// ============================================

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Handle API errors
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // ============================================
  // AUTH
  // ============================================
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  // ============================================
  // INVENTORY
  // ============================================
  getInventory: async () => {
    const res = await fetch(`${API_URL}/inventory`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  addInventoryItem: async (item) => {
    const res = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(item)
    });
    return handleResponse(res);
  },

  updateInventoryItem: async (id, item) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(item)
    });
    return handleResponse(res);
  },

  deleteInventoryItem: async (id) => {
    const res = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // ============================================
  // TRANSACTIONS
  // ============================================
  getTransactions: async () => {
    const res = await fetch(`${API_URL}/transactions`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  addTransaction: async (transaction) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(transaction)
    });
    return handleResponse(res);
  },

  // ============================================
  // SUPPLIERS
  // ============================================
  getSuppliers: async () => {
    const res = await fetch(`${API_URL}/suppliers`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  addSupplier: async (supplier) => {
    const res = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(supplier)
    });
    return handleResponse(res);
  },

  updateSupplier: async (id, supplier) => {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(supplier)
    });
    return handleResponse(res);
  },

  deleteSupplier: async (id) => {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // ============================================
  // CATEGORIES
  // ============================================
  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  addCategory: async (category) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(category)
    });
    return handleResponse(res);
  },

  updateCategory: async (id, category) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(category)
    });
    return handleResponse(res);
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // ============================================
  // ACTIVITY LOGS
  // ============================================
  getActivityLogs: async () => {
    const res = await fetch(`${API_URL}/activity-logs`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // ============================================
  // APPOINTMENTS
  // ============================================
  getAppointments: async () => {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  addAppointment: async (appointment) => {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(appointment)
    });
    return handleResponse(res);
  },

  updateAppointment: async (id, appointment) => {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(appointment)
    });
    return handleResponse(res);
  },

  completeAppointment: async (id) => {
    const res = await fetch(`${API_URL}/appointments/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  cancelAppointment: async (id) => {
    const res = await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // ============================================
  // DAMAGED ITEMS
  // ============================================
  getDamagedItems: async () => {
    const res = await fetch(`${API_URL}/damaged-items`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  updateDamagedItem: async (id, item) => {
    const res = await fetch(`${API_URL}/damaged-items/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(item)
    });
    return handleResponse(res);
  },

  removeDamagedItem: async (id) => {
    const res = await fetch(`${API_URL}/damaged-items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(res);
  }
};