// src/pages/ValidationPage.tsx
import React from 'react';
import {Box, Button, CircularProgress, List, ListItem, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {SearchState, useScanStore} from '../stores/scanStore';
import {LibraryDocument} from '../types';

const getAuthors = (contributors: LibraryDocument['contributors']) => contributors.map(contributor => `${contributor.firstName ?? ''} ${contributor.lastName}`).join(', ');

const getPublication = (publication: LibraryDocument['publication']) => publication ? `${publication.publisher ?? 'Unknown Publisher'}, ${publication.publicationDate}` : 'Unknown Publication';

const compareDocuments = (doc1: LibraryDocument, doc2: LibraryDocument) => {
    const diffs: string[] = [];
    if (doc1.title !== doc2.title) {
        diffs.push(`Titre: "${doc1.title}" vs "${doc2.title}"`)
    }
    if (doc1.subtitle !== doc2.subtitle) {
        diffs.push(`Sous-titre: "${doc1.subtitle}" vs "${doc2.subtitle}"`)
    }
    if (getAuthors(doc1.contributors) !== getAuthors(doc2.contributors)) {
        diffs.push(`Auteurs: "${getAuthors(doc1.contributors)}" vs "${getAuthors(doc2.contributors)}"`)
    }
    if (getPublication(doc1.publication) !== getPublication(doc2.publication)) {
        diffs.push(`Publication: "${getPublication(doc1.publication)}" vs "${getPublication(doc2.publication)}"`)
    }
    return diffs;
};

export const ValidationPage: React.FC = () => {
    const scans = useScanStore(state => state.scans);
    const clearScans = useScanStore(state => state.clear);
    const navigate = useNavigate();

    const handleValidation = () => {
        // Logique pour valider et ajouter les livres à la bibliothèque
        clearScans();
        navigate('/');
    };

    return (
        <Box>
            <Typography variant="h2" gutterBottom>Validation des Scans</Typography>
            <List>
                {Object.entries(scans).map(([barcode, {state, results}]) => (
                    <ListItem key={barcode} divider>
                        <Box>
                            <Typography variant="h6">Code-barres: {barcode}</Typography>
                            {state === SearchState.Pending && <CircularProgress/>}
                            {state === SearchState.Error &&
                                <Typography color="error">Erreur lors de la recherche</Typography>}
                            {state === SearchState.Success && results.length === 0 && (
                                <Typography>Aucun document trouvé</Typography>
                            )}
                            {state === SearchState.Success && results.length > 0 && results.map((result, index) => (
                                <Box key={index} mb={2}>
                                    <Typography variant="subtitle1">{result.title}</Typography>
                                    {result.subtitle && <Typography variant="subtitle2">{result.subtitle}</Typography>}
                                    <Typography variant="body2">Auteurs: {getAuthors(result.contributors)}</Typography>
                                    <Typography
                                        variant="body2">Publication: {getPublication(result.publication)}</Typography>
                                </Box>
                            ))}
                            {state === SearchState.Success && results.length > 1 && (
                                <Box mt={2}>
                                    <Typography variant="h6">Points de divergence :</Typography>
                                    {compareDocuments(results[0], results[1]).map(diff => (
                                        <Typography key={diff} variant="body2" color="error">{diff}</Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={handleValidation}>
                Valider
            </Button>
        </Box>
    );
};

export default ValidationPage;
