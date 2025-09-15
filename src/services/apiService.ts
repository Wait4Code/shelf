// src/services/apiService.ts
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json',
  },
});

// Intercepteur pour forcer le Content-Type sur toutes les requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Forcer le Content-Type pour toutes les requêtes POST/PUT/PATCH
    if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
      config.headers['Content-Type'] = 'application/ld+json';
    }
    // Forcer l'Accept pour toutes les requêtes
    config.headers['Accept'] = 'application/ld+json';
    
    console.log('🚀 Requête API:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Types pour l'API JSON-LD (correspondant à l'entité ResearchedItem du backend)
export interface ApiResearchedItem {
  '@id': string;
  '@type': string;
  id: string;
  status: 0 | 1 | 2; // 0=ERROR, 1=PENDING, 2=SUCCESS
  fromScan: boolean;
  fromBnf: boolean;
  barcode?: string;
  competingDocuments: any[]; // Les documents seront gérés séparément
  createdAt: string;
}

export interface CreateResearchedItemRequest {
  '@type': string;
  id: string; // ID généré par uuidv4() côté frontend
  status: 0 | 1 | 2; // 0=ERROR, 1=PENDING, 2=SUCCESS
  fromScan: boolean;
  fromBnf: boolean;
  barcode?: string;
  // competingDocuments sera géré séparément via des IRIs
}

export interface UpdateResearchedItemRequest {
  '@type'?: string;
  status?: 0 | 1 | 2; // 0=ERROR, 1=PENDING, 2=SUCCESS
  fromScan?: boolean;
  fromBnf?: boolean;
  barcode?: string;
  competingDocuments?: any[];
}

// Service API pour les recherches
export const researchedItemApi = {
  // Récupérer toutes les recherches
  getAll: async (): Promise<ApiResearchedItem[]> => {
    const response = await apiClient.get('/researched_items');
    return response.data['hydra:member'] || response.data;
  },

  // Récupérer une recherche par ID
  getById: async (id: string): Promise<ApiResearchedItem> => {
    const response = await apiClient.get(`/researched_items/${id}`);
    return response.data;
  },

  // Créer une nouvelle recherche
  create: async (data: CreateResearchedItemRequest): Promise<ApiResearchedItem> => {
    // Le @type est déjà inclus dans data, pas besoin de l'ajouter
    const response = await apiClient.post('/researched_items', data);
    return response.data;
  },

  // Mettre à jour une recherche
  update: async (id: string, data: UpdateResearchedItemRequest): Promise<ApiResearchedItem> => {
    // Le @type est déjà inclus dans data, pas besoin de l'ajouter
    const response = await apiClient.put(`/researched_items/${id}`, data);
    return response.data;
  },

  // Supprimer une recherche
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/researched_items/${id}`);
  },
};

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse API reçue:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Erreur API:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Fonction de test pour vérifier les headers
export const testHeaders = async () => {
  console.log('🧪 Test des headers...');
  
  try {
    // Test simple avec une requête GET
    const response = await apiClient.get('/researched_items');
    console.log('✅ Test GET réussi');
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Test GET échoué:', error);
    return { success: false, error: error.message };
  }
};

export default apiClient;
