// src/hooks/useAutoSync.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useSearchStore } from '../stores/searchStore';

interface UseAutoSyncOptions {
  /** Intervalle de synchronisation automatique en millisecondes (défaut: 30 secondes) */
  interval?: number;
  /** Synchroniser automatiquement au montage du composant */
  syncOnMount?: boolean;
  /** Synchroniser quand la fenêtre reprend le focus */
  syncOnFocus?: boolean;
  /** Synchroniser quand la connexion est rétablie */
  syncOnOnline?: boolean;
}

/**
 * Hook pour gérer la synchronisation automatique des recherches non synchronisées
 */
export const useAutoSync = (options: UseAutoSyncOptions = {}) => {
  const {
    interval = 30000, // 30 secondes par défaut
    syncOnMount = true,
    syncOnFocus = true,
    syncOnOnline = true,
  } = options;

  const { syncAllResearchesToApi, researches } = useSearchStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>();

  // Fonction de synchronisation avec gestion d'erreur
  const performSync = useCallback(async () => {
    try {
      // Vérifier s'il y a des recherches non synchronisées
      const unsyncedCount = Object.values(researches).filter(r => !r.synced).length;
      
      if (unsyncedCount > 0) {
        console.log(`🔄 Synchronisation automatique de ${unsyncedCount} recherche(s)...`);
        await syncAllResearchesToApi();
        console.log('✅ Synchronisation automatique terminée');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la synchronisation automatique:', error);
    }
  }, [researches, syncAllResearchesToApi]);

  // Synchronisation au montage
  useEffect(() => {
    if (syncOnMount) {
      performSync();
    }
  }, [syncOnMount, performSync]);

  // Synchronisation périodique
  useEffect(() => {
    if (interval > 0) {
      intervalRef.current = setInterval(performSync, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [interval, performSync]);

  // Synchronisation lors du focus de la fenêtre
  useEffect(() => {
    if (!syncOnFocus) return;

    const handleFocus = () => {
      performSync();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncOnFocus, performSync]);

  // Synchronisation quand la connexion est rétablie
  useEffect(() => {
    if (!syncOnOnline) return;

    const handleOnline = () => {
      console.log('📡 Connexion rétablie, synchronisation...');
      performSync();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOnOnline, performSync]);

  // Fonctions utilitaires retournées
  return {
    /** Déclencher une synchronisation manuelle */
    sync: performSync,
    /** Arrêter la synchronisation automatique */
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    },
    /** Redémarrer la synchronisation automatique */
    restart: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (interval > 0) {
        intervalRef.current = setInterval(performSync, interval);
      }
    },
    /** Nombre de recherches non synchronisées */
    unsyncedCount: Object.values(researches).filter(r => !r.synced).length,
  };
};

/**
 * Composant wrapper pour activer la synchronisation automatique globale
 */
interface AutoSyncProviderProps extends UseAutoSyncOptions {
  children: React.ReactNode;
}

export const AutoSyncProvider = ({ 
  children, 
  ...options 
}: AutoSyncProviderProps) => {
  useAutoSync(options);
  return <>{children}</>;
};
