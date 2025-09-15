# Guide d'intégration React Query + Zustand pour la synchronisation API

## Vue d'ensemble

Cette intégration permet de synchroniser automatiquement ton store Zustand avec ton API backend. Chaque opération sur le store local est maintenant propagée vers l'API.

## Architecture

```
Frontend Store (Zustand) <---> React Query <---> API Backend (Symfony)
```

## Fichiers créés

1. **`src/services/apiService.ts`** - Service API pour communiquer avec le backend
2. **`src/hooks/useResearchedItems.ts`** - Hooks React Query pour les opérations CRUD
3. **`src/services/syncService.ts`** - Utilitaires pour mapper les données entre frontend/backend
4. **`src/stores/searchStoreWithSync.ts`** - Version modifiée du store avec synchronisation
5. **`src/providers/SyncProvider.tsx`** - Provider pour injecter React Query dans Zustand
6. **`src/config/queryClient.ts`** - Configuration React Query
7. **`src/AppWithSync.tsx`** - Wrapper d'application avec synchronisation

## Migration étape par étape

### 1. Configuration de l'environnement

Ajoute cette variable d'environnement dans ton `.env` :

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 2. Modification de ton App.tsx principal

```tsx
// Dans ton index.tsx ou App.tsx principal
import { AppWithSync } from './AppWithSync';
import { YourExistingApp } from './App';

function Root() {
  return (
    <AppWithSync>
      <YourExistingApp />
    </AppWithSync>
  );
}
```

### 3. Migration du store

Remplace les imports de ton store existant :

```tsx
// Avant
import { useSearchStore } from './stores/searchStore';

// Après
import { useSearchStore } from './stores/searchStoreWithSync';
```

Le store fonctionne exactement de la même manière, mais maintenant :
- Chaque recherche créée est envoyée à l'API
- Chaque mise à jour est synchronisée
- Les suppressions sont propagées
- Un flag `synced` indique l'état de synchronisation

### 4. Nouveaux champs dans les recherches

Les recherches ont maintenant deux nouveaux champs optionnels :
- `synced?: boolean` - Indique si la recherche est synchronisée avec l'API
- `apiId?: string` - ID de l'objet dans l'API backend

## Utilisation

### Opérations automatiquement synchronisées

Toutes les opérations existantes sont maintenant synchronisées :

```tsx
const { scan, addResearch, removeResearch, bnfRefresh } = useSearchStore();

// Crée localement ET envoie à l'API
await scan('9782123456789');

// Met à jour localement ET synchronise
await bnfRefresh(researchId);

// Supprime localement ET de l'API
removeResearch(researchId);
```

### Synchronisation manuelle

Si tu veux forcer une synchronisation :

```tsx
const { syncResearchToApi, syncAllResearchesToApi } = useSearchStore();

// Synchroniser une recherche spécifique
await syncResearchToApi(researchId);

// Synchroniser toutes les recherches non synchronisées
await syncAllResearchesToApi();
```

### Vérification du statut de synchronisation

```tsx
const { researches } = useSearchStore();

Object.values(researches).forEach(research => {
  if (research.synced) {
    console.log('✅ Recherche synchronisée');
  } else {
    console.log('⏳ En attente de synchronisation');
  }
});
```

## Gestion des erreurs

Le système gère automatiquement :
- **Retry automatique** : Les requêtes échouées sont automatiquement retentées
- **Fonctionnement offline** : Les opérations continuent de fonctionner localement
- **Synchronisation différée** : Les changements sont synchronisés dès que la connexion est rétablie

### Personnalisation de la gestion d'erreur

```tsx
// Dans queryClient.ts, tu peux modifier la stratégie de retry
retry: (failureCount, error) => {
  // Logique personnalisée
  return failureCount < 3;
}
```

## API Backend requise

Ton API Symfony doit exposer ces endpoints pour `ResearchedItem` :

- `GET /api/researched_items` - Liste toutes les recherches
- `GET /api/researched_items/{id}` - Récupère une recherche
- `POST /api/researched_items` - Crée une recherche
- `PUT /api/researched_items/{id}` - Met à jour une recherche
- `DELETE /api/researched_items/{id}` - Supprime une recherche

## Monitoring et Debug

### React Query Devtools

En mode développement, les devtools React Query sont automatiquement activés et te permettent de :
- Voir les requêtes en cours
- Inspecter le cache
- Forcer des refetch
- Voir les erreurs

### Logs de synchronisation

Les erreurs de synchronisation sont loggées dans la console avec des préfixes clairs :
- `Erreur de synchronisation lors de la création:`
- `Erreur de synchronisation lors de la mise à jour:`
- etc.

## Points d'attention

1. **IDs multiples** : Chaque recherche a maintenant un ID local (Zustand) et potentiellement un ID API différent
2. **Persistence** : Le store persiste toujours dans localStorage, y compris les états de synchronisation
3. **Performance** : La synchronisation est optimiste (UI d'abord, API ensuite)
4. **Réseau** : L'application continue de fonctionner même sans réseau

## Prochaines étapes recommandées

1. ✅ Tester la création/modification/suppression de recherches
2. ✅ Vérifier la synchronisation avec les devtools
3. ✅ Tester le comportement hors ligne
4. ✅ Configurer la gestion d'erreurs spécifique à ton app
5. ✅ Ajouter des indicateurs visuels de synchronisation dans l'UI
