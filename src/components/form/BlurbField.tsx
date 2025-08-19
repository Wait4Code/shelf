import React from "react";
import {Box,  TextField, Typography} from "@mui/material";
import {useField, useFormikContext} from "formik";

export type BlurbFieldProps = Readonly<{
    name: string
    visibleSubFields?: string[]
}>

export const BlurbField: React.FC<BlurbFieldProps> = ({name, visibleSubFields}) => {
    const {values, setFieldValue} = useFormikContext<Record<string, any>>();

    const current = (values as any)[name];

    React.useEffect(() => {
        if (current === null) {
            setFieldValue(name, {text: '', source: ''});
        }
    }, [current, name, setFieldValue]);

    const [textField, textMeta] = useField(`${name}.text`);
    const [sourceField, sourceMeta] = useField(`${name}.source`);

    const showAll = !visibleSubFields || visibleSubFields.length === 0;
    const show = (f: string) => showAll || visibleSubFields?.includes(f);

    if (current === null) {
        return (
            <Box>
                <Typography variant="h6">Résumé</Typography>
            </Box>
        );
    }



    return (
        <Box>
            <Typography variant="h6">Résumé</Typography>
            <Box sx={{pl: 2}}>
                {show('text') && (
                <TextField fullWidth margin={"dense"} variant={"standard"}
                    label={"Résumé"}
                    error={textMeta.touched && Boolean(textMeta.error)}
                    helperText={textMeta.touched && textMeta.error}
                    {...textField}
                />)}
                {show('source') && (
                <TextField fullWidth margin={"dense"} variant={"standard"}
                    label={"Source du résumé"}
                    error={sourceMeta.touched && Boolean(sourceMeta.error)}
                    helperText={sourceMeta.touched && sourceMeta.error}
                    {...sourceField}
                />)}
            </Box>
        </Box>
    );
}
