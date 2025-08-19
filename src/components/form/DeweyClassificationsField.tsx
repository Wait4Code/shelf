import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { FieldArray, useField, useFormikContext } from "formik";

export type DeweyClassificationFieldProps = Readonly<{ name: string; visibleSubFields?: string[] }>;

const DeweyClassificationItem: React.FC<{ baseName: string; onRemove: () => void; visibleSubFields?: string[] }> = ({ baseName, onRemove, visibleSubFields }) => {
    const [indexField, indexMeta] = useField(`${baseName}.index`);
    const [editionField, editionMeta] = useField(`${baseName}.edition`);
    const [titleField, titleMeta] = useField(`${baseName}.title`);
    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);

    return (
        <Box sx={{ mb: 2 }}>
            {show('index') && (<TextField fullWidth label={"Indice"} error={indexMeta.touched && Boolean(indexMeta.error)} helperText={indexMeta.touched && indexMeta.error} {...indexField} />)}
            {show('edition') && (<TextField fullWidth label={"Édition"} error={editionMeta.touched && Boolean(editionMeta.error)} helperText={editionMeta.touched && editionMeta.error} {...editionField} />)}
            {show('title') && (<TextField fullWidth label={"Titre"} error={titleMeta.touched && Boolean(titleMeta.error)} helperText={titleMeta.touched && titleMeta.error} {...titleField} />)}
            <Button variant="text" color="secondary" onClick={onRemove}>Supprimer cette classification</Button>
        </Box>
    );
}

export const DeweyClassificationField: React.FC<DeweyClassificationFieldProps> = ({ name, visibleSubFields }) => {
    const { values } = useFormikContext<Record<string, any>>();
    const current = (values as any)[name] as any[];

    return (<>
        <Typography variant="h6">Classification Dewey</Typography>
        <FieldArray name={name}>

            {({ push, remove }) => (
                <Box>
                    {current?.map((_, index) => (
                        <DeweyClassificationItem key={index} baseName={`${name}.${index}`} onRemove={() => remove(index)} visibleSubFields={visibleSubFields} />
                    ))}
                    <Button variant="outlined" onClick={() => push({ index: '', edition: null, title: null })}>Ajouter une classification</Button>
                </Box>
            )}
        </FieldArray>
    </>
    );
}
