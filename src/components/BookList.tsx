import React from 'react';
import { useBookStore } from '../stores/bookStore';
import { BookItem } from './BookItem';
import { List, ListItem } from '@mui/material';

export const BookList: React.FC = () => {
    const documents = useBookStore(state => state.documents);

    return (
        <List>
            {documents.map(document => (
                <ListItem key={document.getIdentifiers().join('_')}>
                    <BookItem document={document} />
                </ListItem>
            ))}
        </List>
    );
};
