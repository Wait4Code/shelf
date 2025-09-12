// src/pages/LoansPage.tsx
import React from 'react';
import {Box, Typography} from '@mui/material';
import { LibraryDocumentForm } from '../components/form/LibraryDocumentForm';

export const LoansPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>Prêts de livres</Typography>
            <LibraryDocumentForm 
                onSubmit={(v)=> console.log(v)}
            />
        </Box>
    );
};
