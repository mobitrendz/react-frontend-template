export const getApiBaseUrl = () => {
  // If we're on macbook.local or any other host, try to use that for the backend too
  // Default to localhost:8000 if we can't determine it
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8000`;
  }
  return 'http://localhost:8000';
};
