// src/stores/bookStore.ts
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {LibraryDocumentInterface, LibraryDocument} from '../types'



interface DocumentStore {
    documents: LibraryDocumentInterface[]
    addDocument: (document: LibraryDocumentInterface) => void
}

// Fonction pour réhydrater les documents depuis le localStorage
const rehydrateDocuments = (documents: LibraryDocumentInterface[]): LibraryDocumentInterface[] => {
    return documents.map(doc => LibraryDocument.fromJson(doc));
};

export const useBookStore = create(
    persist<DocumentStore>(
        set => ({
            documents: [],
            addDocument: document =>
                set(state => ({
                    documents: [...state.documents, document],
                })),
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
