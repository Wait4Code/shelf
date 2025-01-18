import React from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from "@mui/material";
import {ManualResearch} from './ManualResearch';
import {LibraryDocumentInterface} from "../../types";
import {useSearchStore} from "../../stores/searchStore";


interface NotFoundItemProps {
    identifiers: Array<string>
}

export const NotFoundItem: React.FC<NotFoundItemProps> = ({identifiers}) => {
    const [open, setOpen] = React.useState(false);
    const [isValid, setIsValid] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [document, setDocument] = React.useState<LibraryDocumentInterface | null>(null);
    const {addDocumentsToResearch, hasAnyIdentifier} = useSearchStore();

    const cancel = () => {
        selectDocument(null);
        handleClose();
    }

    const selectDocument = (selectedDocument: LibraryDocumentInterface | null) => {
        setIsValid(false);
        setDocument(selectedDocument);
        if (!selectedDocument) {
            return;
        }
        if (hasAnyIdentifier(...selectedDocument.getIdentifiers())) {
            setIsValid(true);
        }
    }


    const validateManualResearch = () => {
        if (document) {
            void addDocumentsToResearch(identifiers, document);
        }
        handleClose()
    }

    return <>
        <Typography>
            Aucun document trouvé pour "<strong>{identifiers.join(', ')}</strong>"
        </Typography>
        <Button onClick={handleOpen}>
            Rechercher
        </Button>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Recherche manuelle</DialogTitle>
            <DialogContent>
                <Box sx={{gap: 2, display: 'flex', flexDirection: 'column'}}>
                    {isValid && (<Alert severity="error">
                        Ce document est déjà dans vos documents recherchés.
                    </Alert>)}

                    <ManualResearch callback={selectDocument}
                                    renderInput={params =>
                                        <TextField {...params} label="Titre, Auteur, édition, ..." fullWidth
                                                   variant="standard"/>}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancel}>Annuler</Button>
                <Button autoFocus onClick={validateManualResearch} disabled={isValid}>Valider</Button>
            </DialogActions>
        </Dialog>
    </>
}
