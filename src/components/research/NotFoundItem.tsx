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
    const [isInvalid, setIsInvalid] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [document, setDocument] = React.useState<LibraryDocumentInterface | null>(null);
    const {addDocumentsToResearch, hasAnyIdentifierWithDocuments} = useSearchStore();

    const cancel = () => {
        selectDocument(null);
        handleClose();
    }

    const selectDocument = (selectedDocument: LibraryDocumentInterface | null) => {
        console.log(selectedDocument,identifiers);
        setIsInvalid(false);
        setDocument(selectedDocument);
        if (!selectedDocument) {
            return;
        }
        if (hasAnyIdentifierWithDocuments(...selectedDocument.getIdentifiers())) {
            setIsInvalid(true);
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
            <DialogTitle>Recherche élargie</DialogTitle>
            <DialogContent>
                <Box sx={{gap: 2, display: 'flex', flexDirection: 'column'}}>
                    {isInvalid && (<Alert severity="error">
                        Ce document est déjà dans vos documents recherchés.
                    </Alert>)}

                    <ManualResearch callback={selectDocument}
                                    renderInput={params =>
                                        <TextField {...params} label="Titre, Auteur, édition, ..." fullWidth
                                                   variant="standard" autoFocus/>}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancel}>Annuler</Button>
                <Button onClick={validateManualResearch} disabled={isInvalid}>Valider</Button>
            </DialogActions>
        </Dialog>
    </>
}
