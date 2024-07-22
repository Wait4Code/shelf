// src/pages/ValidationPage.tsx
import React from 'react';
import {SearchState, useScanStore} from '../stores/scanStore';
import {Box, Button, CircularProgress, List, ListItem, ListItemText} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {map} from "lodash";


export const ValidationPage: React.FC = () => {
    const scans = useScanStore(state => state.scans);
    const clearBarcodes = useScanStore(state => state.clear);
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
                {map(scans, (scanSearch, barcode) =>
                    <ListItem key={barcode}>
                        <ListItemText
                            primary={barcode}
                            secondary={scanSearch.state === SearchState.Pending ?
                                <CircularProgress size={20}/> : scanSearch.results[0]?.title || 'Erreur'}
                        />
                    </ListItem>
                )}

            </List>
            <Button variant="contained" color="primary" onClick={handleValidation}>
                Valider
            </Button>
        </Box>
    );
};
