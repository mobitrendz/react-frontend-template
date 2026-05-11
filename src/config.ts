import { env } from "./env";

export const getApiBaseUrl = () => {
  return env.VITE_API_URL;
};
