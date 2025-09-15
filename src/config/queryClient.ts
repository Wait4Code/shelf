// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// Configuration du client React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Temps pendant lequel les données sont considérées comme fraîches
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Retry automatique en cas d'erreur
      retry: (failureCount, error: any) => {
        // Ne pas retry pour les erreurs 4xx (erreurs client)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      // Refetch en arrière-plan quand la fenêtre reprend le focus
      refetchOnWindowFocus: false,
      // Refetch quand la connexion est rétablie
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry automatique pour les mutations
      retry: (failureCount, error: any) => {
        // Ne pas retry pour les erreurs 4xx
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry une seule fois pour les mutations
        return failureCount < 1;
      },
    },
  },
});

export default queryClient;
