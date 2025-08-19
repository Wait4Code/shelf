import React from "react";
import {Box, Button, TextField, Typography} from "@mui/material";
import {FieldArray, useField, useFormikContext} from "formik";

export type InternationalSerialBookNumbersFieldProps = Readonly<{ name: string; visibleSubFields?: string[] }>;

const IsbnItem: React.FC<{ baseName: string; onRemove: () => void; visibleSubFields?: string[] }> = ({baseName, onRemove, visibleSubFields}) => {
    const [numberField, numberMeta] = useField(`${baseName}.number`);
    const [qualifierField, qualifierMeta] = useField(`${baseName}.qualifier`);
    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);

    return (
        <Box sx={{mb: 2, pl: 2}}>
            {show('number') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"ISBN"} error={numberMeta.touched && Boolean(numberMeta.error)} helperText={numberMeta.touched && numberMeta.error} {...numberField}/>)}
            {show('qualifier') && (<TextField fullWidth margin={"dense"} variant={"standard"} label={"Qualificatif"} error={qualifierMeta.touched && Boolean(qualifierMeta.error)} helperText={qualifierMeta.touched && qualifierMeta.error} {...qualifierField}/>)}
            <Button variant="text" color="secondary" onClick={onRemove}>Supprimer cet ISBN</Button>
        </Box>
    );
}

export const InternationalSerialBookNumbersField: React.FC<InternationalSerialBookNumbersFieldProps> = ({name, visibleSubFields}) => {
    const {values} = useFormikContext<Record<string, any>>();
    const current = (values as any)[name] as any[];

    return (
        <>
        <Typography variant="h6">ISBN</Typography>
        <FieldArray name={name}>
            {({push, remove}) => (
                <Box>
                    {current?.map((_, index) => (
                        <IsbnItem key={index} baseName={`${name}.${index}`} onRemove={() => remove(index)} visibleSubFields={visibleSubFields} />
                    ))}
                    <Button variant="outlined" onClick={() => push({number: '', qualifier: null})}>Ajouter un ISBN</Button>
                </Box>
            )}
        </FieldArray>
        </>
    );
}
