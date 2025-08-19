const FillingChar = ' ';

export enum DocumentType  {
    Atlas='a',
    ComicBook='b',
    LibraryCatalog='c',
    Dictionary='d',
    Encyclopedia='e',
    Bibliography='f',
    Directory='g',
    InstructionManual='h',
    Index='i',
    RegulatoryText='j',
    ConferenceProceedings='k',
    Patent='l',
    Mixtures='m',
    Standard='n',
    ProblemsAndExercices='"p"',
    CommercialCatalog='q',
    TechnicalReport='r',
    Statistics='s',
    NumericalTable='t',
    ThesisDissertation='u',
    InternationalTreaty='v',
    ActivityReport='w',
    OtherAcademicPublication='y',
    Other='z',
    Unknown='#'
}

export namespace DocumentTypeConverter {
    export function convert(value: string) {
        if (value === FillingChar) {
            return DocumentType.Unknown;
        }

        for (const typeValue of Object.values(DocumentType)) {
            if (typeValue === value) {
                return typeValue;
            }
        }
        throw new Error('Invalid value');
    }
}
