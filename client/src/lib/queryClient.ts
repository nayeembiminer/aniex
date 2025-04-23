import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Optimized API request with cache headers for faster responses
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: HeadersInit = {
    'Cache-Control': method === 'GET' ? 'max-age=300' : 'no-cache', // Cache GET requests for 5 minutes
    'Pragma': method === 'GET' ? 'cache' : 'no-cache',
  };
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add performance optimization with caching headers
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        'Cache-Control': 'max-age=300', // Cache for 5 minutes
        'Pragma': 'cache'
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      gcTime: 1000 * 60 * 30, // 30 minutes cache (was cacheTime in v4)
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});
