// src/providers/SyncProvider.tsx
import React, { useEffect } from 'react';
import { useCreateResearchedItem, useUpdateResearchedItem, useDeleteResearchedItem } from '../hooks/useResearchedItems';
import { setSyncService } from '../stores/searchStore';

interface SyncProviderProps {
  children: React.ReactNode;
}

/**
 * Provider qui injecte les services React Query dans le store Zustand
 * À utiliser au niveau racine de l'application, après QueryClient
 */
export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const createMutation = useCreateResearchedItem();
  const updateMutation = useUpdateResearchedItem();
  const deleteMutation = useDeleteResearchedItem();

  useEffect(() => {
    // Injection des services React Query dans le store Zustand
    setSyncService({
      createResearch: async (data) => {
        const result = await createMutation.mutateAsync(data);
        return result;
      },
      updateResearch: async (id, data) => {
        const result = await updateMutation.mutateAsync({ id, data });
        return result;
      },
      deleteResearch: async (id) => {
        await deleteMutation.mutateAsync(id);
      },
    });

    // Cleanup - retirer le service lors du démontage
    return () => {
      setSyncService(null);
    };
  }, [createMutation, updateMutation, deleteMutation]);

  return <>{children}</>;
};
