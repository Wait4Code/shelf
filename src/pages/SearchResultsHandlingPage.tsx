// src/pages/SearchResultsHandlingPage.tsx
import React, {useContext, useEffect} from 'react';
import {Box, Button, CircularProgress, List, ListItem, Typography} from '@mui/material';
import {ResearchStatus, useSearchStore} from '../stores/searchStore';
import {LibraryDocumentInterface} from "../types";
import {ResearchItem} from "../components/ResearchItem";
import {HeaderContext} from '../stores/header';


const useStyles = {
    container: {},

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


export const SearchResultsHandlingPage: React.FC = () => {
    const [selectedDocuments, setSelectedDocuments] = React.useState<{ [k: string]: LibraryDocumentInterface }>({});
    const researches = useSearchStore(state => state.researches);
    const clearScans = useSearchStore(state => state.clear);
    const {setHeaderStyles, setToolbarStyles, setContent} = useContext(HeaderContext);
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
        console.log(Object.values(selectedDocuments));
        // clearScans();
        // navigate('/');
    };

    return (
        <Box>
            <Box sx={useStyles.container}>
                <List>
                    {researches.map(({documents, status, identifiers}) => (
                        <ListItem key={identifiers.join('-')} divider>
                            {status === ResearchStatus.Pending && <CircularProgress/>}
                            {status === ResearchStatus.Error && (
                                <Typography color="error">Erreur lors de la recherche</Typography>
                            )}
                            {status === ResearchStatus.Success &&
                                <ResearchItem documents={documents} identifiers={identifiers}
                                              onSelected={selectDocument}/>
                            }
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
