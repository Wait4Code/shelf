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
    researchId: string;
    barcode: string;
}

export const NotFoundItem: React.FC<NotFoundItemProps> = ({researchId, barcode}) => {
    const [open, setOpen] = React.useState(false);
    const [isInvalid, setIsInvalid] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [document, setDocument] = React.useState<LibraryDocumentInterface | null>(null);
    const {completeScanResearch, hasSomeResearchedDocument} = useSearchStore();

    const cancel = () => {
        selectDocument(null);
        handleClose();
    }

    const selectDocument = (selectedDocument: LibraryDocumentInterface | null) => {
        setIsInvalid(false);
        setDocument(selectedDocument);
        if (!selectedDocument) {
            return;
        }
        if (hasSomeResearchedDocument(selectedDocument)) {
            setIsInvalid(true);
        }
    }


    const validateManualResearch = () => {
        if (document) {
            console.log(document)
            void completeScanResearch(researchId, document);
        }
        handleClose()
    }

    return <>
        <Typography>
            Aucun document trouvé pour "<strong>{barcode}</strong>"
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
