// src/pages/ValidationPage.tsx
import React from 'react';
import {AppBar, Box, Button, CircularProgress, IconButton, List, ListItem, Toolbar, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useNavigate} from 'react-router-dom';
import {ResearchStatus, useSearchStore} from '../stores/searchStore';
import {DocumentItem} from '../components/DocumentItem';

const useStyles = {
    container: {
        marginTop: '16px',
    },
    resultItem: {
        marginLeft: '16px',
        padding: '8px',
        borderLeft: '2px solid gray',
    },
    appbar: {
        zIndex: 10000,
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
    },
};

export const ValidationPage: React.FC = () => {
    const researches = useSearchStore(state => state.researches);
    const clearScans = useSearchStore(state => state.clear);
    const navigate = useNavigate();

    const handleAddToLibrary = () => {
        clearScans();
        navigate('/');
    };

    return (
        <Box>
            <AppBar position="sticky" sx={useStyles.appbar}>
                <Toolbar sx={useStyles.toolbar}>
                    <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
                        <ArrowBackIcon/>
                    </IconButton>
                    <Box sx={useStyles.titleContainer}>
                        <Typography variant="h6" align="center">
                            Résultats de recherche
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={useStyles.container}>
                <List>
                    {researches.map(({documents, status, identifiers}) => (
                        <ListItem key={identifiers.join('-')} divider>
                            {status === ResearchStatus.Pending && <CircularProgress/>}
                            {status === ResearchStatus.Error && (
                                <Typography color="error">Erreur lors de la recherche</Typography>
                            )}
                            {status === ResearchStatus.Success && documents.length === 0 && (
                                <Typography>
                                    Aucun document trouvé pour "<strong>{identifiers.join(', ')}</strong>"
                                </Typography>
                            )}
                            {status === ResearchStatus.Success && documents.length > 0 && documents.map((document, index) => (
                                <Box key={`${identifiers.join('-')}_${index}`} sx={documents.length > 1 ? useStyles.resultItem : {}}>
                                    <DocumentItem document={document} />
                                </Box>
                            ))}
                        </ListItem>
                    ))}
                </List>
                <Button variant="contained" color="primary" onClick={handleAddToLibrary}>
                    Ajouter à la bibliothèque
                </Button>
            </Box>
        </Box>
    );
};
