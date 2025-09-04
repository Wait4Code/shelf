// src/pages/SearchResultsHandlingPage.tsx
import React, {useContext, useEffect} from 'react';
import {Box, Button, CircularProgress, List, ListItem, Typography, IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {ResearchStatus, useSearchStore} from '../stores/searchStore';
import {useBookStore} from '../stores/bookStore';
import {LibraryDocumentInterface} from "../types";
import {ResearchItem} from "../components/ResearchItem";
import {HeaderContext} from '../stores/header';
import {intersection} from 'lodash';


const useStyles = {
    container: {},

    appbar: {
        zIndex: 1000,
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
    listItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    researchContent: {
        flexGrow: 1,
    },
};


export const SearchResultsHandlingPage: React.FC = () => {
    const [selectedDocuments, setSelectedDocuments] = React.useState<{ [k: string]: LibraryDocumentInterface }>({});
    const researches = useSearchStore(state => state.researches);
    const removeResearch = useSearchStore(state => state.removeResearch);
    const addDocument = useBookStore(state => state.addDocument);
    const documents = useBookStore(state => state.documents);
    const {setHeaderStyles, setToolbarStyles, setContent} = useContext(HeaderContext);

    // Fonction pour vérifier si un document existe déjà dans le bookstore
    const isDocumentAlreadyInLibrary = (document: LibraryDocumentInterface): boolean => {
        const documentIdentifiers = document.getIdentifiers();
        return documents.some(libraryDoc => {
            const libraryIdentifiers = libraryDoc.getIdentifiers();
            return intersection(documentIdentifiers, libraryIdentifiers).length > 0;
        });
    };
    useEffect(() => {
        setHeaderStyles(useStyles.appbar);
        setToolbarStyles(useStyles.toolbar);

        setContent(<Box sx={useStyles.titleContainer}>
            <Typography variant="h6" align="center">
                Résultats de recherche
            </Typography>
        </Box>)
        return () => {
            setHeaderStyles({});
            setToolbarStyles({});
            setContent(<></>);
        };
    }, [setHeaderStyles, setToolbarStyles, setContent]);

    const selectDocument = (identifiers: Array<string>, document: LibraryDocumentInterface | null) => {
        if (!document) {
            delete selectedDocuments[identifiers.join('-')];
            setSelectedDocuments({...selectedDocuments});
        } else {
            setSelectedDocuments({...selectedDocuments, [identifiers.join('-')]: document});
        }
    }

    const handleAddToLibrary = () => {
        const selectedDocs = Object.values(selectedDocuments);
        
        if (selectedDocs.length === 0) {
            return; // Aucun document sélectionné
        }

        // Ajouter chaque document sélectionné au bookstore
        selectedDocs.forEach(document => {
            addDocument(document);
        });

        // Grouper les identifiants par recherche pour les supprimer correctement
        const researchKeys = Object.keys(selectedDocuments);
        researchKeys.forEach(key => {
            const identifiers = key.split('-');
            removeResearch(identifiers);
        });

        // Vider la sélection
        setSelectedDocuments({});
    };

    const handleRemoveResearch = (identifiers: Array<string>) => {
        removeResearch(identifiers);
        // Supprimer aussi de la sélection si elle était sélectionnée
        const key = identifiers.join('-');
        if (selectedDocuments[key]) {
            delete selectedDocuments[key];
            setSelectedDocuments({...selectedDocuments});
        }
    };

    return (
        <Box>
            <Box sx={useStyles.container}>
                <List>
                    {researches.map(({documents, status, identifiers}) => (
                        <ListItem key={identifiers.join('-')} divider sx={useStyles.listItem}>
                            <Box sx={useStyles.researchContent}>
                                {status === ResearchStatus.Pending && documents.length === 0 && <CircularProgress/>}
                                {status === ResearchStatus.Error && (
                                    <Typography color="error">Erreur lors de la recherche</Typography>
                                )}
                                {(status === ResearchStatus.Success || (status === ResearchStatus.Pending && documents.length > 0)) &&
                                    <ResearchItem documents={documents} identifiers={identifiers}
                                                  onSelected={selectDocument}
                                                  isDocumentAlreadyInLibrary={isDocumentAlreadyInLibrary}
                                                  isRefreshing={status === ResearchStatus.Pending && documents.length > 0}/>
                                }
                            </Box>
                            <IconButton 
                                color="error" 
                                onClick={() => handleRemoveResearch(identifiers)}
                                aria-label="Supprimer cette recherche"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleAddToLibrary}
                    disabled={Object.keys(selectedDocuments).length === 0}
                >
                    Ajouter à la bibliothèque {Object.keys(selectedDocuments).length > 0 && `(${Object.keys(selectedDocuments).length})`}
                </Button>
            </Box>
        </Box>
    );
};
