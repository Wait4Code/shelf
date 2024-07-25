// src/stores/bookStore.ts
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {LibraryDocument} from '../types'



interface DocumentStore {
    documents: LibraryDocument[]
    addDocument: (document: LibraryDocument) => void
}

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
        }
    )
)
