import React from 'react';
import { useBookStore } from '../stores/bookStore';
import { BookItem } from './BookItem';
import { List, ListItem } from '@mui/material';

export const BookList: React.FC = () => {
    const books = useBookStore(state => state.books);

    return (
        <List>
            {books.map(book => (
                <ListItem key={book.isbn}>
                    <BookItem book={book} />
                </ListItem>
            ))}
        </List>
    );
};
