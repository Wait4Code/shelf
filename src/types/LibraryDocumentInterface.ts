// Document (Document)
import {Contributor} from "./Contributor";
import {Blurb} from "./Blurb";
import {Publication} from "./Publication";
import {Subject} from "./Subject";
import {DeweyClassification} from "./DeweyClassification";
import {Collection} from "./Collection";
import {Series} from "./Series";
import {Isbn} from "./Isbn";
import {Ean} from "./Ean";
import {DocumentType} from "./DocumentType";

export interface LibraryDocumentInterface {
    coverImageUrl: string | null;
    contributors: Contributor[];
    physicalDescription: string | null;
    title: string;
    subtitle: string | null;
    edition: string | null;
    internationalSerialBookNumbers: Isbn[];
    europeanArticleNumbers: Ean[]
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
    arkIdentifier: string | null;
    type: typeof DocumentType[keyof typeof DocumentType];
    partNumber: string | null;
    partTitle: string | null

    getIdentifiers: () => string[];
    isComicBook: () => boolean;
    getVolumeNumber: () => number | string | null;
}

export class LibraryDocument implements LibraryDocumentInterface {
    arkIdentifier: string | null = null;
    blurb: Blurb | null = null;
    collection: Collection | null = null;
    contributors: Contributor[] = [];
    coverImageUrl: string | null = null;
    deweyClassifications: DeweyClassification[] = [];
    edition: string | null = null;
    europeanArticleNumbers: Ean[] = [];
    internationalSerialBookNumbers: Isbn[] = [];
    issn: string | null = null;
    notes: string | null = null;
    numbering: number | null = null;
    periodicity: string | null = null;
    physicalDescription: string | null = null;
    publication: Publication | null = null;
    recordIdentifier: string | null = null;
    series: Series | null = null;
    subjects: Subject[] = [];
    subtitle: string | null = null;
    title: string;
    type: typeof DocumentType[keyof typeof DocumentType];
    partNumber: string | null = null;
    partTitle: string | null = null

    constructor(title: string, type: typeof DocumentType[keyof typeof DocumentType]) {
        this.title = title;
        this.type = type
    }

    getIdentifiers() {
        const identifiers = []
        if (this.arkIdentifier) {
            identifiers.push(this.arkIdentifier);
        }
        if (this.recordIdentifier) {
            identifiers.push(this.recordIdentifier)
        }
        identifiers.concat(this.internationalSerialBookNumbers.map(isbn => isbn.number));
        identifiers.concat(this.europeanArticleNumbers.map(ean => ean.number));

        return identifiers;
    }

    isComicBook() {
        return this.type === DocumentType.ComicBook;
    }

    getVolumeNumber() {
        return this.series?.number ?? this.partNumber ?? null;
    }
}
