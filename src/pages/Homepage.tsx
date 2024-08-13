// src/pages/Homepage.tsx
import React from 'react';
import {Box, Typography} from '@mui/material';
import {BookList} from '../components/BookList';

export const Homepage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>Ma Bibliothèque</Typography>
            <BookList/>
        </Box>
    );
};
