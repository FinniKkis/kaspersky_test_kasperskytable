import { Cat } from '../types';

const API_BASE = 'https://api.thecatapi.com/v1';
const API_KEY = import.meta.env.VITE_CAT_API_KEY as string;

const headers: HeadersInit = {
  'x-api-key': API_KEY,
};

export async function fetchCats(page = 0, limit = 25): Promise<Cat[]> {
  const response = await fetch(
    `${API_BASE}/images/search?limit=${limit}&page=${page}&order=Rand&mime_types=jpg,png`,
    { headers },
  );
  if (!response.ok) {
    throw new Error(`TheCatAPI error: ${response.status}`);
  }
  return response.json();
}
