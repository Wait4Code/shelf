// src/pages/ValidationPage.tsx
import React from 'react';
import {useBarcodeStore} from '../stores/barcodeStore';
import {Box, Button, List, ListItem, ListItemText} from '@mui/material';
import {useNavigate} from 'react-router-dom';

export const ValidationPage: React.FC = () => {
    const barcodes = useBarcodeStore(state => state.barcodes);
    const clearBarcodes = useBarcodeStore(state => state.clear);
    const navigate = useNavigate();

    const handleValidation = () => {
        // Logique pour valider et ajouter les livres à la bibliothèque
        clearBarcodes();
        navigate('/');
    };

    return (
        <Box>
            <h2>Validation des Scans</h2>
            <List>
                {barcodes.map(barcode => (
                    <ListItem key={barcode}>
                        <ListItemText primary={barcode}/>
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={handleValidation}>
                Valider
            </Button>
        </Box>
    );
};
