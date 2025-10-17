export type FetchMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface FetchRequestOptions extends Omit<RequestInit, 'body'> {
  method?: FetchMethod;
  body?: object;
}

export async function fetchRequest<T>(
  url: string,
  token: string,
  options: FetchRequestOptions = {},
  meta: boolean = false,
): Promise<T> {
  try {
    const formattedToken = token.startsWith('Bearer ')
      ? token
      : `Bearer ${token}`;

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: formattedToken,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }

    const { data } = await response.json();

    if (meta) return data;

    return data.data ?? data;
  } catch (error) {
    console.log(error);

    // console.error('API Request Error:', error.message);
    throw new Error(
      `Internal error: Fetch request to External Api failed - ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
