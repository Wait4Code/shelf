import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { array, mixed, number, object, ObjectSchema, setLocale, string } from "yup";
import { Box, MenuItem, TextField } from "@mui/material";
import {
    Blurb,
    Collection,
    Contributor,
    DeweyClassification,
    DocumentType,
    Ean,
    Isbn,
    LibraryDocument,
    LibraryDocumentInterface,
    Publication,
    Series,
    Subject
} from "../../types";
import { fr } from 'yup-locales';
import { emptyStringToNull, emptyNumberToNull, emptyObjectToNull } from "../../utils/yupTransformers";
import ContributorsField from "./ContributorsField";
import { BlurbField } from "./BlurbField";
import { PublicationField } from "./PublicationField";
import { SeriesField } from "./SeriesField";
import { CollectionField } from "./CollectionField";
import { SubjectsField } from "./SubjectsField";
import { DeweyClassificationField } from "./DeweyClassificationsField";
import { InternationalSerialBookNumbersField } from "./InternationalSerialBookNumbersField";
import { EuropeanArticleNumbersField } from "./EuropeanArticleNumbersField";

setLocale(fr);
const ContributorSchema: ObjectSchema<Contributor> = object({
    lastName: string().required(),
    firstName: string().optional().nullable().default(null).transform(emptyStringToNull),
    role: string().optional().nullable().default(null).transform(emptyStringToNull),
    identifier: string().optional().nullable().default(null).transform(emptyStringToNull),
})
const IsbnSchema: ObjectSchema<Isbn> = object({
    number: string().required(),
    qualifier: string().optional().nullable().default(null).transform(emptyStringToNull),
})
const EanSchema: ObjectSchema<Ean> = object({
    number: string().required(),
    qualifier: string().optional().nullable().default(null).transform(emptyStringToNull),
})
const BlurbSchema: ObjectSchema<Blurb> = object({
    text: string().required(),
    source: string().optional().nullable().default(null).transform(emptyStringToNull),
}).transform(emptyObjectToNull)
const PublicationSchema: ObjectSchema<Publication> = object({
    publisher: string().required(),
    publicationDate: string().optional().nullable().default(null).transform(emptyStringToNull),
}).transform(emptyObjectToNull)
const SubjectSchema: ObjectSchema<Subject> = object({
    title: string().required(),
    identifier: string().optional().nullable().default(null).transform(emptyStringToNull),
    clarification: string().optional().nullable().default(null).transform(emptyStringToNull),
    subjectSubdivision: string().optional().nullable().default(null).transform(emptyStringToNull),
    geographicSubdivision: string().optional().nullable().default(null).transform(emptyStringToNull),
    chronologicalSubdivision: string().optional().nullable().default(null).transform(emptyStringToNull),
})
const DeweyClassificationSchema: ObjectSchema<DeweyClassification> = object({
    index: string().required(),
    edition: number().optional().nullable().default(null).transform(emptyNumberToNull),
    title: string().optional().nullable().default(null).transform(emptyStringToNull)
})
const SeriesSchema: ObjectSchema<Series> = object({
    title: string().required(),
    recordNumber: string().optional().nullable().default(null).transform(emptyStringToNull),
    number: number().optional().nullable().default(null).transform(emptyNumberToNull),
    issn: string().optional().nullable().default(null).transform(emptyStringToNull),
    publicationDate: string().optional().nullable().default(null).transform(emptyStringToNull),
}).transform(emptyObjectToNull)
const CollectionSchema: ObjectSchema<Collection> = object({
    title: string().required(),
    recordNumber: string().optional().nullable().default(null).transform(emptyStringToNull),
    number: number().optional().nullable().default(null).transform(emptyNumberToNull),
    issn: string().optional().nullable().default(null).transform(emptyStringToNull),
    publicationDate: string().optional().nullable().default(null).transform(emptyStringToNull),
}).transform(emptyObjectToNull)


const LibraryDocumentSchema: ObjectSchema<Omit<LibraryDocumentInterface, "getIdentifiers" | "isComicBook" | "getVolumeNumber">> = object({
    title: string().required(),
    coverImageUrl: string().optional().nullable().default(null).transform(emptyStringToNull),
    contributors: array().of(ContributorSchema).optional().min(1).default([]),
    physicalDescription: string().optional().nullable().default(null).transform(emptyStringToNull),
    subtitle: string().optional().nullable().default(null),
    edition: string().optional().nullable().default(null).transform(emptyStringToNull),
    internationalSerialBookNumbers: array().of(IsbnSchema).optional().default([]),
    europeanArticleNumbers: array().of(EanSchema).optional().default([]),
    issn: string().optional().nullable().default(null).transform(emptyStringToNull),
    numbering: string().optional().nullable().default(null).transform(emptyStringToNull),
    periodicity: string().optional().nullable().default(null).transform(emptyStringToNull),
    blurb: BlurbSchema.optional().nullable().default(null),
    publication: PublicationSchema.optional().nullable().default(null),
    subjects: array().of(SubjectSchema).optional().default([]),
    deweyClassifications: array().of(DeweyClassificationSchema).optional().default([]),
    series: SeriesSchema.optional().nullable().default(null),
    collection: CollectionSchema.optional().nullable().default(null),
    notes: string().optional().nullable().transform(emptyStringToNull).default(null),
    recordIdentifier: string().optional().nullable().default(null).transform(emptyStringToNull),
    arkIdentifier: string().optional().nullable().default(null).transform(emptyStringToNull),
    type: mixed<DocumentType>().oneOf(Object.values(DocumentType)).optional().nonNullable().default(DocumentType.Other),
    partNumber: string().optional().nullable().default(null).transform(emptyStringToNull),
    partTitle: string().optional().nullable().default(null).transform(emptyStringToNull),
})

export type LibraryDocumentFormProps = Readonly<{
    visibleFields?: string[]
    onSubmit?: (values: LibraryDocumentInterface) => void
    initialValues?: Partial<LibraryDocumentInterface>
}>;

export interface LibraryDocumentFormRef {
    submitForm: () => void;
}

export const LibraryDocumentForm = React.forwardRef<LibraryDocumentFormRef, LibraryDocumentFormProps>(({ visibleFields, onSubmit, initialValues }, ref) => {
    let formikRef: FormikProps<any> | null = null;

    React.useImperativeHandle(ref, () => ({
        submitForm: () => {
            if (formikRef) {
                formikRef.submitForm();
            }
        }
    }));

    function isVisible(visibleFields: string[] | undefined, field: string): boolean {
        if (!visibleFields || visibleFields.length === 0) return true;
        return visibleFields.includes(field);
    }

    function extractSubFields(visibleFields: string[] | undefined, prefix: string): string[] | undefined {
        if (!visibleFields || visibleFields.length === 0) return undefined;
        const prefixDot = prefix + '.';
        const subs = visibleFields
            .filter(f => f === prefix || f.startsWith(prefixDot))
            .map(f => f === prefix ? '' : f.substring(prefixDot.length))
            .filter(f => f.length > 0);
        return subs.length === 0 ? undefined : subs;
    }

    return (
        <Formik
            initialValues={initialValues ? { ...new LibraryDocument('', DocumentType.Other), ...initialValues } : new LibraryDocument('', DocumentType.Other)}
            onSubmit={(values, { setSubmitting }) => {
                if (onSubmit) {
                    onSubmit(LibraryDocument.fromJson(LibraryDocumentSchema.cast(values)));
                }
                setSubmitting(false);
            }}
            validationSchema={LibraryDocumentSchema}
        >
            {(formikProps) => {
                // Stocker la référence pour pouvoir déclencher le submit depuis l'extérieur
                formikRef = formikProps;
                const { values, handleChange, handleBlur, touched, errors } = formikProps;

                return (
                    <Form>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {(() => {
                                const fieldRenderers: Record<string, () => React.ReactNode> = {
                                    title: () => (
                                        <TextField
                                            fullWidth
                                            margin={"dense"}
                                            variant={"standard"}
                                            name={"title"}
                                            label={"Titre"}
                                            value={values.title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.title && Boolean(errors.title)}
                                            helperText={touched.title && errors.title}
                                        />
                                    ),
                                    subtitle: () => (
                                        <TextField
                                            fullWidth
                                            margin={"dense"}
                                            variant={"standard"}
                                            name={"subtitle"}
                                            label={"Sous-titre"}
                                            value={values.subtitle ?? ''}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.subtitle && Boolean(errors.subtitle)}
                                            helperText={touched.subtitle && errors.subtitle}
                                        />
                                    ),
                                    edition: () => (
                                        <TextField
                                            fullWidth
                                            margin={"dense"}
                                            variant={"standard"}
                                            name={"edition"}
                                            label={"Édition"}
                                            value={values.edition ?? ''}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.edition && Boolean(errors.edition)}
                                            helperText={touched.edition && errors.edition}
                                        />
                                    ),
                                    coverImageUrl: () => (
                                        <TextField
                                            fullWidth
                                            margin={"dense"}
                                            variant={"standard"}
                                            name={"coverImageUrl"}
                                            label={"URL de couverture"}
                                            value={values.coverImageUrl ?? ''}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.coverImageUrl && Boolean(errors.coverImageUrl)}
                                            helperText={touched.coverImageUrl && errors.coverImageUrl}
                                        />
                                    ),
                                    type: () => (
                                        <TextField
                                            select
                                            fullWidth
                                            margin={"dense"}
                                            variant={"standard"}
                                            name={"type"}
                                            label={"Type de document"}
                                            value={values.type}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.type && Boolean(errors.type)}
                                            helperText={touched.type && errors.type}
                                        >
                                            {Object.entries(DocumentType).map(([label, value]) => (
                                                <MenuItem key={label} value={value}>{label}</MenuItem>
                                            ))}
                                        </TextField>
                                    ),
                                    arkIdentifier: () => (
                                        <TextField
                                            fullWidth
                                            margin={"dense"}
                                            variant={"standard"}
                                            name={"arkIdentifier"}
                                            label={"Identifiant ARK"}
                                            value={values.arkIdentifier ?? ''}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.arkIdentifier && Boolean(errors.arkIdentifier)}
                                            helperText={touched.arkIdentifier && errors.arkIdentifier}
                                        />
                                    ),
                                    recordIdentifier: () => (
                                        <TextField
                                            fullWidth
                                            margin={"dense"}
                                            variant={"standard"}
                                            name={"recordIdentifier"}
                                            label={"Identifiant de notice"}
                                            value={values.recordIdentifier ?? ''}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.recordIdentifier && Boolean(errors.recordIdentifier)}
                                            helperText={touched.recordIdentifier && errors.recordIdentifier}
                                        />
                                    ),
                                    internationalSerialBookNumbers: () => (
                                        <InternationalSerialBookNumbersField name={"internationalSerialBookNumbers"}
                                            visibleSubFields={extractSubFields(visibleFields, 'internationalSerialBookNumbers')} />
                                    ),
                                    europeanArticleNumbers: () => (
                                        <EuropeanArticleNumbersField name={"europeanArticleNumbers"}
                                            visibleSubFields={extractSubFields(visibleFields, 'europeanArticleNumbers')} />
                                    ),
                                    issn: () => (
                                        <TextField fullWidth margin={"dense"} variant={"standard"} name={"issn"} label={"ISSN"}
                                            value={values.issn ?? ''} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.issn && Boolean(errors.issn)}
                                            helperText={touched.issn && errors.issn} />
                                    ),
                                    numbering: () => (
                                        <TextField fullWidth margin={"dense"} variant={"standard"} name={"numbering"} label={"Numérotation"}
                                            value={values.numbering ?? ''} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.numbering && Boolean(errors.numbering)}
                                            helperText={touched.numbering && errors.numbering} />
                                    ),
                                    periodicity: () => (
                                        <TextField fullWidth margin={"dense"} variant={"standard"} name={"periodicity"} label={"Périodicité"}
                                            value={values.periodicity ?? ''} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.periodicity && Boolean(errors.periodicity)}
                                            helperText={touched.periodicity && errors.periodicity} />
                                    ),
                                    blurb: () => (
                                        <BlurbField name={"blurb"} visibleSubFields={extractSubFields(visibleFields, 'blurb')} />
                                    ),
                                    publication: () => (
                                        <PublicationField name={"publication"} visibleSubFields={extractSubFields(visibleFields, 'publication')} />
                                    ),
                                    subjects: () => (
                                        <SubjectsField name={"subjects"} visibleSubFields={extractSubFields(visibleFields, 'subjects')} />
                                    ),
                                    deweyClassifications: () => (
                                        <DeweyClassificationField name={"deweyClassifications"} visibleSubFields={extractSubFields(visibleFields, 'deweyClassifications')} />
                                    ),
                                    series: () => (
                                        <SeriesField name={"series"} visibleSubFields={extractSubFields(visibleFields, 'series')} />
                                    ),
                                    collection: () => (
                                        <CollectionField name={"collection"} visibleSubFields={extractSubFields(visibleFields, 'collection')} />
                                    ),
                                    notes: () => (
                                        <TextField fullWidth margin={"dense"} variant={"standard"} name={"notes"} label={"Notes"}
                                            value={values.notes ?? ''} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.notes && Boolean(errors.notes)}
                                            helperText={touched.notes && errors.notes} />
                                    ),
                                    physicalDescription: () => (
                                        <TextField fullWidth margin={"dense"} variant={"standard"} name={"physicalDescription"} label={"Description physique"}
                                            value={values.physicalDescription ?? ''} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.physicalDescription && Boolean(errors.physicalDescription)}
                                            helperText={touched.physicalDescription && errors.physicalDescription} />
                                    ),
                                    partNumber: () => (
                                        <TextField fullWidth margin={"dense"} variant={"standard"} name={"partNumber"} label={"Numéro de partie"}
                                            value={values.partNumber ?? ''} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.partNumber && Boolean(errors.partNumber)}
                                            helperText={touched.partNumber && errors.partNumber} />
                                    ),
                                    partTitle: () => (
                                        <TextField fullWidth margin={"dense"} variant={"standard"} name={"partTitle"} label={"Titre de partie"}
                                            value={values.partTitle ?? ''} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.partTitle && Boolean(errors.partTitle)}
                                            helperText={touched.partTitle && errors.partTitle} />
                                    ),
                                    contributors: () => (
                                        <ContributorsField name={"contributors"} visibleSubFields={extractSubFields(visibleFields, 'contributors')} />
                                    ),
                                };

                                const defaultOrder = [
                                    'title', 'subtitle', 'edition', 'coverImageUrl', 'type',
                                    'arkIdentifier', 'recordIdentifier',
                                    'internationalSerialBookNumbers', 'europeanArticleNumbers', 'issn', 'numbering', 'periodicity',
                                    'blurb', 'publication', 'subjects', 'deweyClassifications', 'series', 'collection',
                                    'notes', 'physicalDescription', 'partNumber', 'partTitle', 'contributors'
                                ];

                                const orderKeys = (visibleFields && visibleFields.length > 0)
                                    ? Array.from(new Set(visibleFields.map(f => f.split('.')[0])))
                                    : defaultOrder;

                                return orderKeys
                                    .filter(k => !!fieldRenderers[k] && isVisible(visibleFields, k))
                                    .map((k) => <React.Fragment key={k}>{fieldRenderers[k]()}</React.Fragment>);
                            })()}
                        </Box>
                    </Form>
                );
            }}
        </Formik>
    );
});
