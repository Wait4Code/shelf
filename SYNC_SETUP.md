# Configuration de la synchronisation API

## Variables d'environnement requises

Créez un fichier `.env.local` dans le dossier `shelf-app` avec le contenu suivant :

```env
# Configuration de l'API backend
REACT_APP_API_URL=http://localhost:8000/api
```

## Format JSON-LD

L'application est configurée pour utiliser le format JSON-LD d'API Platform :
- **Content-Type** : `application/ld+json`
- **Accept** : `application/ld+json`
- **Format des données** : Inclut `@id` et `@type` pour les objets

## Test de connexion

Pour tester la connexion à l'API, vous pouvez utiliser les utilitaires de test :

```typescript
import { testApiConnection, testCreateResearch } from './src/utils/testApiConnection';

// Test de connexion
const result = await testApiConnection();
console.log(result);

// Test de création
const createResult = await testCreateResearch();
console.log(createResult);
```

## Installation des dépendances manquantes

Si vous voulez utiliser les devtools React Query, installez le package :

```bash
npm install @tanstack/react-query-devtools
```

Puis décommentez les lignes correspondantes dans `App.tsx`.

## Fonctionnement

Maintenant, votre application est configurée pour :

1. **Synchronisation automatique** : Chaque opération sur le store (scan, ajout, suppression) est automatiquement synchronisée avec l'API backend
2. **Fonctionnement offline** : L'application continue de fonctionner même sans connexion réseau
3. **Synchronisation différée** : Les changements sont synchronisés dès que la connexion est rétablie
4. **Retry automatique** : Les requêtes échouées sont automatiquement retentées

## Vérification

Pour vérifier que la synchronisation fonctionne :

1. Ouvrez les outils de développement du navigateur
2. Regardez la console pour voir les logs de synchronisation
3. Vérifiez que votre API backend reçoit les requêtes

## Dépannage

- **Erreur de connexion** : Vérifiez que l'URL de l'API est correcte dans `.env.local`
- **CORS** : Assurez-vous que votre API backend autorise les requêtes depuis votre frontend
- **Logs** : Consultez la console du navigateur pour voir les erreurs de synchronisation
