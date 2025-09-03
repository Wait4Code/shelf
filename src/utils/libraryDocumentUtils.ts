import axios from 'axios';
import { convertXML } from 'simple-xml-to-json';
import {
    Blurb,
    Collection,
    DeweyClassification,
    DocumentType,
    DocumentTypeConverter,
    Ean,
    LibraryDocument,
    LibraryDocumentInterface,
    Publication,
    Series,
    Subject
} from '../types';
import { BNFResponse, DataFieldInterface, RecordDatum } from "../types/BnfSchema";
import he from 'he';
import { has } from "lodash";
import { Nullable } from './Nullable';


function getSubFieldValue(dataField: DataFieldInterface, code: string): string;
function getSubFieldValue<N extends boolean, T extends 'string' | 'number'>(dataField: DataFieldInterface, code: string, nullable: N, type: T): N extends true ? (T extends 'string' ? string : number) | null : T extends 'string' ? string : number;
function getSubFieldValue<N extends boolean>(dataField: DataFieldInterface, code: string, nullable: N): N extends true ? string | null : string
function getSubFieldValue(dataField: DataFieldInterface, code: string, nullable = false, type = 'string'): string | number | null {
    const subfield = dataField["mxc:datafield"].children.find(subField => subField["mxc:subfield"].code === code);
    if (!subfield) {
        if (nullable) {
            return null;
        }
        throw new Error(`Unknown subField with code "${code}" for dataField with tag "${dataField["mxc:datafield"].tag}"`);
    }
    const content = he.decode(subfield["mxc:subfield"].content);

    return type === 'string' ? content : parseInt(content, 10);
}


// Fonction pour interroger l'API BNF SRU et parser le résultat XML en une liste de LibraryDocuments
export const searchBNFDocument = async (query: string): Promise<LibraryDocumentInterface[]> => {
    const bnfApiUrl = new URL(`${process.env.REACT_APP_BNF_URL}/api/SRU`)
    bnfApiUrl.searchParams.set("version", "1.2");
    bnfApiUrl.searchParams.set("operation", "searchRetrieve");
    bnfApiUrl.searchParams.set("query", `bib.anywhere all "${query}" and bib.doctype any "a"`);
    bnfApiUrl.searchParams.set("recordSchema", "intermarcXchange");

    const response = await axios.get(bnfApiUrl.toString());

    const result = convertXML(response.data) as BNFResponse;
    const records = result["srw:searchRetrieveResponse"].children[3]["srw:records"].children ?? [];

    const documents: LibraryDocumentInterface[] = [];
    records.forEach(record => {
        if (!has(record, 'srw:record.children[2].srw:recordData.children[0].mxc:record')) {
            return;
        }

        const recordDatum = new RecordDatum(record["srw:record"].children[2]["srw:recordData"].children[0]);
        const dataFields = recordDatum.getDataFields();

        const title = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '245')?.getSubFieldValue('a') as string;
        const encodedData = recordDatum.findControlField(dataField => dataField['mxc:controlfield'].tag === '009')?.["mxc:controlfield"].content as string;
        const document = new LibraryDocument(title, DocumentTypeConverter.convert(encodedData?.at(4) ?? DocumentType.Other));


        const CONTRIBUTORS_TAGS = ['100','101','110','111','700', '701', '702', '703', '710', '711', '712', '713'];

        dataFields.filter(dataField => CONTRIBUTORS_TAGS.includes(dataField["mxc:datafield"].tag))
            .forEach(dataField => {
                try {
                    document.contributors.push({
                        lastName: dataField.getSubFieldValue('a'),
                        firstName: getSubFieldValue(dataField, 'm', true),
                        role: getSubFieldValue(dataField, '4', true),
                        identifier: getSubFieldValue(dataField, '1', true)
                    });
                } catch (e) {
                }
            });

        document.subjects = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "606")
            .map((dataField): Subject => ({
                title: getSubFieldValue(dataField, 'a'),
                identifier: getSubFieldValue(dataField, '3', true),
                clarification: getSubFieldValue(dataField, 'g', true),
                subjectSubdivision: getSubFieldValue(dataField, 'x', true),
                geographicSubdivision: getSubFieldValue(dataField, 'y', true),
                chronologicalSubdivision: getSubFieldValue(dataField, 'z', true),
            }));


        document.deweyClassifications = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "676")
            .map((dataField): DeweyClassification => ({
                index: getSubFieldValue(dataField, 'i'),
                edition: getSubFieldValue(dataField, 'v', true) ? parseInt(getSubFieldValue(dataField, 'v'), 10) : null,
                title: getSubFieldValue(dataField, 'a', true)
            }));


        document.publication = dataFields
            .filter(dataField => (dataField["mxc:datafield"].tag === "260"))
            .map((dataField): Publication => ({
                publisher: getSubFieldValue(dataField, 'c', true),
                publicationDate: getSubFieldValue(dataField, 'd', true)
            })).pop() ?? null;


        document.blurb = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "830")
            .map((dataField): Blurb => ({
                text: getSubFieldValue(dataField, 'a'),
                source: getSubFieldValue(dataField, '2', true)
            })).pop() ?? null;


        const collection = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "410")
            .map((dataField): Nullable<Collection> => ({
                title: getSubFieldValue(dataField, 't', true),
                number: getSubFieldValue(dataField, 'v', true, "number"),
                issn: getSubFieldValue(dataField, 'x', true),
                recordNumber: getSubFieldValue(dataField, '3', true),
            })).pop() ?? null;

        document.collection = dataFields
        .filter(dataField => dataField["mxc:datafield"].tag === "295")
        .map((dataField): Collection => {
            return ({
                title: collection?.title ?? getSubFieldValue(dataField, 'a'),
                number: collection?.number ?? getSubFieldValue(dataField, 'v', true, "number"),
                issn: collection?.issn ?? getSubFieldValue(dataField, 'x', true),
                recordNumber: collection?.recordNumber ?? null
            });
        }).pop() ?? null;;



        document.series = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "460")
            .map((dataField): Series => ({
                recordNumber: getSubFieldValue(dataField, '3', true),
                title: getSubFieldValue(dataField, 't'),
                number: getSubFieldValue(dataField, 'v', true, 'number'),
                publicationDate: getSubFieldValue(dataField, 'd', true),
                issn: getSubFieldValue(dataField, 'y', true),
            })).pop() ?? null;

        dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "020")
            .forEach(dataField => {
                try {
                    document.internationalSerialBookNumbers.push({
                        number: getSubFieldValue(dataField, 'a'),
                        qualifier: getSubFieldValue(dataField, 'b', true)
                    });
                } catch (e) {

                }
            });

        document.europeanArticleNumbers = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "038")
            .map((dataField): Ean => ({
                number: getSubFieldValue(dataField, 'a'),
                qualifier: getSubFieldValue(dataField, 'b', true)
            }));

        document.numbering = dataFields.filter(dataFields => dataFields["mxc:datafield"].tag === "255").map((dataField) => {

            const numbers = [getSubFieldValue(dataField, 'a', true), getSubFieldValue(dataField, 'b', true)].filter(v => v);

            return numbers.join('-') || null
        }).pop() ?? null

        document.coverImageUrl = dataFields.filter(dataFields => dataFields["mxc:datafield"].tag === "950").map((dataField) => {
            const id = getSubFieldValue(dataField, 'a', true);
            const cover = getSubFieldValue(dataField, 'b', true)?.slice(-1);


            if (!id) {
                return null;
            }
            return `https://catalogue.bnf.fr/couverture?appName=NE&idImage=${id}&couverture=${cover}`
        }).shift() ?? null


        document.physicalDescription = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '280')?.getSubFieldValue('a', true) ?? null
        document.subtitle = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '245')?.getSubFieldValue('e', true) ?? null;
        document.partNumber = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '245')?.getSubFieldValue('h', true) ?? null;
        document.partTitle = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '245')?.getSubFieldValue('i', true) ?? null;
        document.edition = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '250')?.getSubFieldValue('a', true) ?? null;
        document.issn = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '022')?.getSubFieldValue('a', true) ?? null;
        document.periodicity = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '326')?.getSubFieldValue('a', true) ?? null;
        document.notes = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '300')?.getSubFieldValue('a') ?? null;
        document.recordIdentifier = recordDatum.findControlField(dataField => dataField['mxc:controlfield'].tag === '001')?.["mxc:controlfield"].content as string;
        document.arkIdentifier = recordDatum.findControlField(dataField => dataField['mxc:controlfield'].tag === '003')?.["mxc:controlfield"].content as string;

        console.log(document)
        documents.push(document);
    });
    return documents;
};
