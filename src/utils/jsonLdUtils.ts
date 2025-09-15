// src/utils/jsonLdUtils.ts
// Utilitaires pour gérer les IDs JSON-LD d'API Platform

/**
 * Extrait l'ID d'un objet JSON-LD d'API Platform
 * @param item Objet JSON-LD avec @id ou id
 * @returns L'ID extrait de l'URL ou l'ID simple
 */
export const extractIdFromJsonLd = (item: { '@id'?: string; id?: string }): string => {
  if (item['@id']) {
    // Extraire l'ID de l'URL JSON-LD (ex: /api/researched_items/123 -> 123)
    return item['@id'].split('/').pop() || item.id || '';
  }
  return item.id || '';
};

/**
 * Vérifie si un objet est au format JSON-LD
 * @param item Objet à vérifier
 * @returns true si l'objet a @id et @type
 */
export const isJsonLdObject = (item: any): item is { '@id': string; '@type': string } => {
  return item && typeof item === 'object' && '@id' in item && '@type' in item;
};

/**
 * Convertit un objet JSON-LD en objet simple (sans @id, @type)
 * @param jsonLdItem Objet JSON-LD
 * @returns Objet simple avec id extrait
 */
export const jsonLdToSimple = <T extends { '@id'?: string; '@type'?: string }>(
  jsonLdItem: T
): Omit<T, '@id' | '@type'> & { id: string } => {
  const { '@id': id, '@type': type, ...rest } = jsonLdItem;
  return {
    ...rest,
    id: extractIdFromJsonLd(jsonLdItem),
  } as Omit<T, '@id' | '@type'> & { id: string };
};
