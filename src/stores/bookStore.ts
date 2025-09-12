// src/stores/bookStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LibraryDocumentInterface, LibraryDocument } from '../types'
import { intersection } from 'lodash'



interface DocumentStore {
    documents: LibraryDocumentInterface[]
    addDocument: (document: LibraryDocumentInterface) => void
    hasSomeDocument: (document: LibraryDocumentInterface, comparisonAttribute?: keyof LibraryDocumentInterface) => boolean
}

// Fonction pour réhydrater les documents depuis le localStorage
const rehydrateDocuments = (documents: LibraryDocumentInterface[]): LibraryDocumentInterface[] => {
    return documents.map(doc => LibraryDocument.fromJson(doc));
};

export const useBookStore = create(
    persist<DocumentStore>(
        (set, get) => ({
            documents: [],
            addDocument: document =>
                set(state => ({
                    documents: [...state.documents, document],
                })),
            hasSomeDocument: (document, comparisonAttribute = 'getIdentifiers') => get().documents.some(doc => {
                const docValue = doc[comparisonAttribute];
                const documentValue = document[comparisonAttribute];

                return intersection(
                    [typeof docValue === "function" ? docValue.bind(doc)() : docValue].flat(),
                    [typeof documentValue === "function" ? documentValue.bind(document)() : documentValue].flat()
                ).length > 0
            }),
        }),
        {
            name: 'document-storage', // Nom de l'entrée dans le local storage
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.documents = rehydrateDocuments(state.documents);
                }
            },
        }
    )
)
