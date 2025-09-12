// src/pages/SearchPage.tsx
import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, alpha, InputBase, SxProps, Theme, Button, List, ListItem, CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { useSearchStore } from '../stores/searchStore';
import { useBookStore } from '../stores/bookStore';
import { LibraryDocument, LibraryDocumentInterface } from "../types";
import { HeaderContext } from "../stores/header";
import { ManualResearch } from "../components/research/ManualResearch";
import { ResearchItem } from "../components/ResearchItem";
import { ResearchStatus } from "../stores/searchStore";

type Styles = {
    [key: string]: SxProps<Theme>
}

const useStyles: Styles = {
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
        minHeight: '100vh',
    },
    headerTitleContainer: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
    },
    searchContainer: {
        width: '100%',
        maxWidth: 800,
        marginBottom: 4,
    },
    resultsContainer: {
        width: '100%',
        maxWidth: 1000,
    },
    autocompleteContainer: theme => ({
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
        },
        padding: 2,
        boxShadow: theme.shadows[2],
    }),
    autocompleteInput: {
        color: 'text.primary',
        fontSize: '1.2rem',
        '& .MuiInputBase-input': {
            padding: 2,
        },
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        marginBottom: 1,
    },
    researchContent: {
        flexGrow: 1,
    },
    addButton: {
        marginTop: 3,
        alignSelf: 'center',
    }
};

export const SearchPage: React.FC = () => {
    const [selectedDocuments, setSelectedDocuments] = useState<{ [k: string]: LibraryDocumentInterface }>({});
    const addDocument = useBookStore(state => state.addDocument);
    const researches = useSearchStore(state => state.researches);    
    const { addResearch, removeResearch, count: researchCount } = useSearchStore();
    const { setHeaderStyles, setToolbarStyles, setContent } = useContext(HeaderContext);
    const { enqueueSnackbar } = useSnackbar();

    // Fonction pour vérifier s'il y a des refresh en cours
    const researchesAreRefreshing = (): boolean => {
        return Object.values(researches).some(research => research.status === ResearchStatus.Pending);
    };

    // Fonctions de gestion des documents sélectionnés
    const selectDocument = (id: string, document: LibraryDocumentInterface | null) => {
        if (!document) {
            delete selectedDocuments[id];
            setSelectedDocuments({ ...selectedDocuments });
        } else {
            setSelectedDocuments({ ...selectedDocuments, [id]: document });
        }
    };

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
        const researchIds = Object.keys(selectedDocuments);
        researchIds.forEach(id => {
            removeResearch(id);
        });

        // Vider la sélection
        setSelectedDocuments({});
    };

    const handleRemoveResearch = (researchId: string) => {
        removeResearch(researchId);
        // Supprimer aussi de la sélection si elle était sélectionnée
        if (selectedDocuments[researchId]) {
            delete selectedDocuments[researchId];
            setSelectedDocuments({ ...selectedDocuments });
        }
    };

    useEffect(() => {
        setHeaderStyles(useStyles.appbar);
        setToolbarStyles(useStyles.toolbar);

        setContent(
            <Box sx={useStyles.headerTitleContainer}>
                <Typography variant="h6" sx={useStyles.headerTitle}>
                    Recherche
                </Typography>
            </Box>
        );

        return () => {
            setHeaderStyles({});
            setToolbarStyles({});
            setContent(<></>);
        };
    }, [setHeaderStyles, setToolbarStyles, setContent]);

    return (
        <Box sx={useStyles.container}>
            <Box sx={useStyles.searchContainer}>
                <ManualResearch
                    callback={(result: LibraryDocument | null, fromBnf: boolean) => {
                        if (!result) {
                            return;
                        }
                        addResearch([result], fromBnf);
                        enqueueSnackbar(`"${result.title}" ajouté à la liste de recherche`, {
                            variant: 'success',
                            autoHideDuration: 3000,
                            anchorOrigin: { vertical: 'bottom', horizontal: 'right' }
                        });
                    }}
                    containerStyles={useStyles.autocompleteContainer}
                    renderInput={params => {
                        const { InputProps: { ref } } = params;
                        const inputParams: Partial<typeof params> = params;
                        delete inputParams["InputLabelProps"]
                        delete inputParams["InputProps"]

                        return (
                            <div ref={ref}>
                                <InputBase
                                    autoFocus
                                    sx={useStyles.autocompleteInput}
                                    placeholder="Cherchez par le titre, l'auteur, l'ISBN, ..." {...inputParams} />
                            </div>
                        );
                    }}
                />
            </Box>

            {/* Affichage des résultats de recherche */}
            {researchCount() > 0 && (
                <Box sx={useStyles.resultsContainer}>
                    <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                        Résultats de recherche ({researchCount()})
                    </Typography>

                    <List>
                        {Object.values(researches).map(({ documents, status, id }) => (
                            <ListItem key={id} sx={useStyles.listItem}>
                                <Box sx={useStyles.researchContent}>
                                    {status === ResearchStatus.Pending && documents.length === 0 && <CircularProgress />}
                                    {status === ResearchStatus.Error && (
                                        <Typography color="error">Erreur lors de la recherche</Typography>
                                    )}
                                    {(status === ResearchStatus.Success || (status === ResearchStatus.Pending && documents.length > 0)) &&
                                        <ResearchItem researchId={id} onSelected={(document) => selectDocument(id, document)} />
                                    }
                                </Box>
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveResearch(id)}
                                    disabled={status === ResearchStatus.Pending}
                                    aria-label="Supprimer cette recherche"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/* Bouton pour ajouter à la bibliothèque - toujours visible */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddToLibrary}
                disabled={Object.keys(selectedDocuments).length === 0 || researchesAreRefreshing()}
                sx={useStyles.addButton}
                size="large"
            >
                Ajouter à la bibliothèque {Object.keys(selectedDocuments).length > 0 && `(${Object.keys(selectedDocuments).length})`}
            </Button>
        </Box>
    );
};
