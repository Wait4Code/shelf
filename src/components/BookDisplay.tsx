// src/components/BookDisplay.tsx
import React from 'react';
import {useBookStore} from '../stores/bookStore';

interface BookDisplayProps {
    isbn: string;
}

const BookDisplay: React.FC<BookDisplayProps> = ({isbn}) => {
    const getBookByISBN = useBookStore(state => state.getBookByISBN);
    const book = getBookByISBN(isbn);

    if (!book) {
        return <div>Book not found</div>;
    }

    return (
        <div>
            <h1>{book.title}</h1>
            <h2>By {book.authors.join(', ')}</h2>
            <p><strong>Published on:</strong> {book.publicationDate}</p>
            <p><strong>Summary:</strong> {book.summary}</p>
            {book.cover && <img src={book.cover} alt={`${book.title} cover`}/>}
        </div>
    );
};

export default BookDisplay;
