import React from "react";
import {Box, Button, TextField, Typography} from "@mui/material";
import {FieldArray, useField, useFormikContext} from "formik";

export type EuropeanArticleNumbersFieldProps = Readonly<{ name: string; visibleSubFields?: string[] }>;

const EanItem: React.FC<{ baseName: string; onRemove: () => void; visibleSubFields?: string[] }> = ({baseName, onRemove, visibleSubFields}) => {
    const [numberField, numberMeta] = useField(`${baseName}.number`);
    const [qualifierField, qualifierMeta] = useField(`${baseName}.qualifier`);
    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);

    return (
        <Box sx={{mb: 2, pl: 2}}>
            {show('number') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"EAN"} error={numberMeta.touched && Boolean(numberMeta.error)} helperText={numberMeta.touched && numberMeta.error} {...numberField}/>)}
            {show('qualifier') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Qualificatif"} error={qualifierMeta.touched && Boolean(qualifierMeta.error)} helperText={qualifierMeta.touched && qualifierMeta.error} {...qualifierField}/>)}
            <Button variant="text" color="secondary" onClick={onRemove}>Supprimer cet EAN</Button>
        </Box>
    );
}

export const EuropeanArticleNumbersField: React.FC<EuropeanArticleNumbersFieldProps> = ({name, visibleSubFields}) => {
    const {values} = useFormikContext<Record<string, any>>();
    const current = (values as any)[name] as any[];

    return (
        <>
        <Typography variant="h6">EAN</Typography>
        <FieldArray name={name}>
            {({push, remove}) => (
                <Box>
                    {current?.map((_, index) => (
                        <EanItem key={index} baseName={`${name}.${index}`} onRemove={() => remove(index)} visibleSubFields={visibleSubFields} />
                    ))}
                    <Button variant="outlined" onClick={() => push({number: '', qualifier: null})}>Ajouter un EAN</Button>
                </Box>
            )}
        </FieldArray>
        </>
    );
}
