import React, { ChangeEvent } from 'react';
import { Box, Checkbox, Radio, RadioGroup, Chip, CircularProgress } from "@mui/material";
import { DocumentItem } from "./DocumentItem";
import { LibraryDocumentInterface } from "../types";
import { NotFoundItem } from "./research/NotFoundItem";
import { useSearchStore, ResearchStatus } from "../stores/searchStore";
import { useBookStore } from '../stores/bookStore';

type ResearchItemProps = {
    researchId: string;
    onSelected: (document: LibraryDocumentInterface | null) => void;
};

const useStyles = {
    resultItem: {
        marginLeft: '16px',
        padding: '8px',
        borderLeft: '2px solid gray',
    },
}

export const ResearchItem: React.FC<ResearchItemProps> = ({ researchId, onSelected }) => {
    const { researches: { [researchId]: research } } = useSearchStore();
    const { hasSomeDocument: libraryHasSomeDocument } = useBookStore();

    const [disabledCheckbox, setDisabledCheckbox] = React.useState(research.documents.length > 1);
    const [checked, setChecked] = React.useState(false);
    const [currentDocument, setCurrentDocument] = React.useState<LibraryDocumentInterface | null>(research.documents.length === 1 ? research.documents[0] : null);

    const selectDocument = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        setCurrentDocument(research.documents[parseInt(value, 10)]);
        setDisabledCheckbox(false);
        if (checked) {
            onSelected(research.documents[parseInt(value, 10)])
        }
    }

    const selectItem = () => {
        if (!checked) {
            onSelected(currentDocument)
            setChecked(true);
        } else {
            onSelected(null)
            setChecked(false)
        }

    }

    if (research.documents.length === 0 && research.fromScan) {
        return <NotFoundItem researchId={researchId} barcode={research.barcode} />
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox onChange={selectItem} disabled={disabledCheckbox} checked={checked} />

                {research.status === ResearchStatus.Pending && (
                    <CircularProgress size={16} />
                )}
            </Box>
            {research.documents.length === 1 ? (
                <Box key={research.id}>
                    {libraryHasSomeDocument(research.documents[0]) && (
                        <Chip
                            label="Déjà en bibliothèque"
                            color="success"
                            size="small"
                            variant="outlined"
                        />
                    )}
                    <DocumentItem document={research.documents[0]} />
                </Box>
            ) : (
                <RadioGroup>
                    {research.documents.map((document, index) => (
                        <Box key={`${research.id}_${index}`} sx={useStyles.resultItem}>
                            <Radio value={index} onChange={selectDocument} />
                            {libraryHasSomeDocument(document, 'arkIdentifier') && (
                                <Chip
                                    label="Déjà en bibliothèque"
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            <DocumentItem document={document} />
                        </Box>
                    ))}
                </RadioGroup>
            )}
        </>
    )
}
