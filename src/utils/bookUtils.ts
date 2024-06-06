// src/utils/bookUtils.ts
import axios from 'axios'
import {useBookStore} from '../stores/bookStore'
import {Book} from '../types/Book'

// Fonction pour interroger l'API Google Books et récupérer les données du livre
export const fetchBookDataFromGoogleBooks = async (isbn: string): Promise<Book | null> => {
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
        const bookData = response.data.items?.[0]

        if (!bookData) {
            console.warn('No book found with this ISBN.')
            return null
        }

        const volumeInfo = bookData.volumeInfo
        return {
            isbn,
            title: volumeInfo.title || "Unknown Title",
            authors: volumeInfo.authors || ["Unknown Author"],
            publicationDate: volumeInfo.publishedDate || "Unknown Date",
            publishers: volumeInfo.publisher ? [volumeInfo.publisher] : ["Unknown Publisher"],
            cover: volumeInfo.imageLinks?.thumbnail || null
        }
    } catch (error) {
        console.error('Error fetching book data from Google Books:', error)
        return null
    }
}

// Fonction pour ajouter un livre au store après l'avoir récupéré via l'API Google Books
export const fetchAndAddBook = async (isbn: string) => {
    const book = await fetchBookDataFromGoogleBooks(isbn)
    if (book) {
        const existingBooks = useBookStore.getState().books
        const isBookExists = existingBooks.some(existingBook => existingBook.isbn === isbn)
        if (!isBookExists) {
            useBookStore.getState().addBook(book)
        } else {
            console.warn(`Book with ISBN ${isbn} already exists in the store.`)
        }
    }
}
