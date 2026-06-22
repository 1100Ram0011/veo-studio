const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const getAuthHeaders = () => {
  const token = localStorage.getItem('veo_token');
  return {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  };
};

export default API_URL
