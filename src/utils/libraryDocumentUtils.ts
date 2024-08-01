import axios from 'axios';
import {convertXML} from 'simple-xml-to-json';
import {
    Blurb,
    Collection,
    Contributor,
    DeweyClassification,
    LibraryDocument,
    Publication,
    Series,
    Subject
} from '../types';
import {BNFResponse, DataFieldInterface, RecordDatum} from "../types/BnfSchema";
import he from 'he';

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
export const searchBNFDocument = async (query: string): Promise<LibraryDocument[]> => {
    const bnfApiUrl = new URL("https://catalogue.bnf.fr/api/SRU")
    bnfApiUrl.searchParams.set("version", "1.2");
    bnfApiUrl.searchParams.set("operation", "searchRetrieve");
    bnfApiUrl.searchParams.set("query", `bib.anywhere all "${query}"`);
    // noinspection SpellCheckingInspection
    bnfApiUrl.searchParams.set("recordSchema", "unimarcXchange");

    const response = await axios.get(`https://corsproxy.io/?${encodeURIComponent(bnfApiUrl.toString())}`);

    const result = convertXML(response.data) as BNFResponse;
    const records = result["srw:searchRetrieveResponse"].children[3]["srw:records"].children;

    return records.map((record): LibraryDocument => {
        const recordDatum = new RecordDatum(record["srw:record"].children[2]["srw:recordData"].children[0]);
        const dataFields = recordDatum.getDataFields();

        const contributors: Contributor[] = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag.startsWith('7'))
            .map((dataField): Contributor => ({
                lastName: dataField.getSubFieldValue('a'),
                firstName: getSubFieldValue(dataField, 'b', true),
                role: getSubFieldValue(dataField, '4', true),
                identifier: getSubFieldValue(dataField, 'o', true)
            }));

        const subjects: Subject[] = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "606")
            .map((dataField): Subject => ({
                title: getSubFieldValue(dataField, 'a'),
                identifier: getSubFieldValue(dataField, '3', true),
                source: getSubFieldValue(dataField, '2')
            }));


        const deweyClassifications: DeweyClassification[] = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "676")
            .map((dataField): DeweyClassification => ({
                index: getSubFieldValue(dataField, 'a'),
                edition: parseInt(getSubFieldValue(dataField, 'v'), 10)
            }));


        let publication: Publication | null = dataFields
            .filter(dataField => (dataField["mxc:datafield"].tag === "214" && dataField['mxc:datafield'].ind2 === '0'))
            .map((dataField): Publication => ({
                publisher: getSubFieldValue(dataField, 'c', true),
                publicationDate: getSubFieldValue(dataField, 'd')
            })).pop() ?? null;

        if (!publication) {
            publication = dataFields
                .filter(dataField => dataField["mxc:datafield"].tag === "210")
                .map((dataField): Publication => ({
                    publisher: getSubFieldValue(dataField, 'c', true),
                    publicationDate: getSubFieldValue(dataField, 'd')
                })).pop() ?? null;
        }

        const blurb: Blurb | null = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "330")
            .map((dataField): Blurb => ({
                text: getSubFieldValue(dataField, 'a'),
                source: getSubFieldValue(dataField, 'b', true)
            })).pop() ?? null;


        const collection: Collection | null = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "410")
            .map((dataField): Collection => ({
                title: getSubFieldValue(dataField, 't'),
                number: getSubFieldValue(dataField, 'v', true, "number"),
                publicationDate: getSubFieldValue(dataField, 'd', true),
                issn: getSubFieldValue(dataField, 'x', true),
                recordNumber: getSubFieldValue(dataField, '0', true),
            })).pop() ?? null;

        const series: Series | null = dataFields
            .filter(dataField => dataField["mxc:datafield"].tag === "461")
            .map((dataField): Series => ({
                recordNumber: getSubFieldValue(dataField, '0', true),
                title: getSubFieldValue(dataField, 't'),
                number: getSubFieldValue(dataField, 'v', false, 'number'),
                publicationDate: getSubFieldValue(dataField, 'd', true),
                issn: getSubFieldValue(dataField, 'x', true),
            })).pop() ?? null;

        const coverImageUrl = `https://catalogue.bnf.fr/couverture?&appName=NE&idArk=${recordDatum["mxc:record"].id}&couverture=1`
        const physicalDescription = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '215')?.getSubFieldValue('a', true) ?? null
        const title = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '200')?.getSubFieldValue('a') as string;
        const subtitle = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '200')?.getSubFieldValue('e', true) ?? null;
        const edition = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '205')?.getSubFieldValue('a') ?? null;
        const isbn = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '010')?.getSubFieldValue('a', true) ?? null;
        const issn = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '011')?.getSubFieldValue('a', true) ?? null;
        const numbering = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '207')?.getSubFieldValue('a', false, 'number') ?? null;
        const periodicity = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '326')?.getSubFieldValue('a', true) ?? null;
        const notes = recordDatum.findDataField(dataField => dataField['mxc:datafield'].tag === '300')?.getSubFieldValue('a') ?? null;
        const recordIdentifier = recordDatum.findControlField(dataField => dataField['mxc:controlfield'].tag === '001')?.["mxc:controlfield"].content as string;
        const arkIdentifier = recordDatum.findControlField(dataField => dataField['mxc:controlfield'].tag === '003')?.["mxc:controlfield"].content ?? null;


        return {
            coverImageUrl,
            contributors,
            physicalDescription,
            title,
            subtitle,
            edition,
            isbn,
            issn,
            numbering,
            periodicity,
            blurb,
            publication,
            subjects,
            deweyClassifications,
            series,
            collection,
            notes,
            recordIdentifier,
            arkIdentifier
        };
    });
};
