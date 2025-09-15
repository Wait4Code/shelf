// src/hooks/useResearchedItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchedItemApi, CreateResearchedItemRequest, UpdateResearchedItemRequest } from '../services/apiService';

// Clés de requête
export const researchedItemsKeys = {
  all: ['researchedItems'] as const,
  lists: () => [...researchedItemsKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...researchedItemsKeys.lists(), { filters }] as const,
  details: () => [...researchedItemsKeys.all, 'detail'] as const,
  detail: (id: string) => [...researchedItemsKeys.details(), id] as const,
};

// Hook pour récupérer toutes les recherches
export const useResearchedItems = () => {
  return useQuery({
    queryKey: researchedItemsKeys.lists(),
    queryFn: researchedItemApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer une recherche par ID
export const useResearchedItem = (id: string) => {
  return useQuery({
    queryKey: researchedItemsKeys.detail(id),
    queryFn: () => researchedItemApi.getById(id),
    enabled: !!id,
  });
};

// Hook pour créer une recherche
export const useCreateResearchedItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResearchedItemRequest) => researchedItemApi.create(data),
    onSuccess: () => {
      // Invalider et refetch la liste des recherches
      queryClient.invalidateQueries({ queryKey: researchedItemsKeys.lists() });
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la recherche:', error);
    },
  });
};

// Hook pour mettre à jour une recherche
export const useUpdateResearchedItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResearchedItemRequest }) =>
      researchedItemApi.update(id, data),
    onSuccess: (updatedItem) => {
      // Mettre à jour le cache avec la nouvelle donnée
      queryClient.setQueryData(researchedItemsKeys.detail(updatedItem.id), updatedItem);
      // Invalider la liste pour s'assurer qu'elle est à jour
      queryClient.invalidateQueries({ queryKey: researchedItemsKeys.lists() });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la recherche:', error);
    },
  });
};

// Hook pour supprimer une recherche
export const useDeleteResearchedItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => researchedItemApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Supprimer l'item du cache
      queryClient.removeQueries({ queryKey: researchedItemsKeys.detail(deletedId) });
      // Invalider la liste
      queryClient.invalidateQueries({ queryKey: researchedItemsKeys.lists() });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la recherche:', error);
    },
  });
};
