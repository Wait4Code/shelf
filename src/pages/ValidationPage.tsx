// src/pages/ValidationPage.tsx
import React from 'react';
import {Box, Button, CircularProgress, List, ListItem, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {ResearchStatus, useSearchStore} from '../stores/searchStore';
import {LibraryDocumentInterface} from '../types';

const getAuthors = (contributors: LibraryDocumentInterface['contributors']) => contributors.map(contributor => `${contributor.firstName ?? ''} ${contributor.lastName}`).join(', ');

const getPublication = (publication: LibraryDocumentInterface['publication']) => publication ? `${publication.publisher ?? 'Unknown Publisher'}, ${publication.publicationDate}` : 'Unknown Publication';

const compareDocuments = (doc1: LibraryDocumentInterface, doc2: LibraryDocumentInterface) => {
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
    const researches = useSearchStore(state => state.researches);
    const clearScans = useSearchStore(state => state.clear);
    const navigate = useNavigate();

    const validate = () => {
        // Logique pour valider et ajouter les livres à la bibliothèque
        clearScans();
        navigate('/');
    };

    return (
        <Box>
            <Typography variant="h2" gutterBottom>Validation des Scans</Typography>
            <List>
                {researches.map(({documents, status, identifiers}) => (
                    <ListItem key={identifiers.join('_')} divider>
                        <Box>
                            <Typography variant="h6">Code-barres: {identifiers}</Typography>
                            {status === ResearchStatus.Pending && <CircularProgress/>}
                            {status === ResearchStatus.Error &&
                                <Typography color="error">Erreur lors de la recherche</Typography>}
                            {status === ResearchStatus.Success && documents.length === 0 && (
                                <Typography>Aucun document trouvé</Typography>
                            )}
                            {status === ResearchStatus.Success && documents.length === 1 && documents.map((result, index) => (
                                <Box key={`${identifiers}_${index}`} mb={2}>
                                    <Typography variant="subtitle1">{result.title}</Typography>
                                    {result.subtitle &&
                                        <Typography variant="subtitle2">{result.subtitle}</Typography>}
                                    <Typography
                                        variant="body2">Auteurs: {getAuthors(result.contributors)}</Typography>
                                    <Typography
                                        variant="body2">Publication: {getPublication(result.publication)}</Typography>
                                </Box>
                            ))}
                            {status === ResearchStatus.Success && documents.length > 1 && (
                                <Box mt={2}>
                                    <Typography variant="h6">Points de divergence :</Typography>
                                    {compareDocuments(documents[0], documents[1]).map(diff => (
                                        <Typography key={diff} variant="body2" color="error">{diff}</Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={validate}>
                Valider
            </Button>
        </Box>
    );
};

export default ValidationPage;
