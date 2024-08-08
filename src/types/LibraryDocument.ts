// Document (Document)
import {Contributor} from "./Contributor";
import {Blurb} from "./Blurb";
import {Publication} from "./Publication";
import {Subject} from "./Subject";
import {DeweyClassification} from "./DeweyClassification";
import {Collection} from "./Collection";
import {Series} from "./Series";

export interface LibraryDocument {
    coverImageUrl: string | null;
    contributors: Contributor[];
    physicalDescription: string | null;
    title: string;
    subtitle: string | null;
    edition: string | null;
    isbn: string | null;
    issn: string | null;
    numbering: number | null;
    periodicity: string | null;
    blurb: Blurb | null;
    publication: Publication | null;
    subjects: Subject[];
    deweyClassifications: DeweyClassification[];
    series: Series | null;
    collection: Collection | null;
    notes: string | null;
    recordIdentifier: string | null;
    arkIdentifier: string;
}
