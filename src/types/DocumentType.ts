export const DocumentType = {
    BelowDoctorateThesisDissertation: '7',
    Bibliography: 'a',
    Catalog: 'b',
    Index: 'c',
    Dictionary: 'e',
    Encyclopedia: 'f',
    Directory: 'g',
    Statistics: 'i',
    InstructionManual: 'j',
    Patent: 'k',
    Standard: 'l',
    ThesisDissertation: 'm',
    RegulatoryText: 'n',
    NumericalTable: 'o',
    TechnicalReport: 'p',
    InternationalTreaty: 's',
    ComicBook: 't',
    ReviewedThesisDissertation: 'v',
    Other: 'z',

    fromValue(value: string) {
        for (const typeValue of Object.values(this)) {
            if (typeValue === value) {
                return typeValue;
            }
        }
        throw new Error('Invalid value');
    }
} as const
