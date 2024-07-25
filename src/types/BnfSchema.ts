import he from "he";

export interface RecordDatumInterface {
    "mxc:record": {
        "xmlns:mxc": string;
        format: string;
        id: string;
        type: string;
        children: [
            Leader,
            ...Array<ControlField>,
            ...Array<DataFieldInterface>,

        ]
    };
}

export class RecordDatum implements RecordDatumInterface {
    "mxc:record": RecordDatumInterface['mxc:record']

    constructor(recordDatum: RecordDatumInterface) {
        this["mxc:record"] = recordDatum["mxc:record"];
        const dataFields = this.getDataFields().map(dataField => new DataField(dataField));
        this["mxc:record"].children = [
            this["mxc:record"].children[0],
            ...this.getControlFields(),
            ...dataFields
        ];
    }

    getControlFields(): Array<ControlField> {
        return this['mxc:record'].children
            .filter((field): field is ControlField => (field as ControlField)['mxc:controlfield'] !== undefined)
    }

    getDataFields(): Array<DataField> {
        return this["mxc:record"].children
            .filter((field): field is DataField => (field as DataField)['mxc:datafield'] !== undefined);
    }

    findDataField(predicate: (value: DataFieldInterface, index: number, obj: DataFieldInterface[]) => boolean): DataField | null {
        return this.getDataFields().find(predicate) ?? null;
    }

    findControlField(predicate: (value: ControlField, index: number, obj: ControlField[]) => boolean): ControlField | null {
        return this.getControlFields().find(predicate) ?? null;
    }
}

export interface DataFieldInterface {
    // noinspection SpellCheckingInspection
    "mxc:datafield": {
        tag: string;
        ind1: string;
        ind2: string;
        children: Array<SubField>;
    };
}

export class DataField implements DataFieldInterface {
    "mxc:datafield": DataFieldInterface['mxc:datafield'];

    constructor(dataField: DataFieldInterface) {
        this["mxc:datafield"] = dataField["mxc:datafield"];
    }

    getSubFieldValue( code: string): string;
    getSubFieldValue<N extends boolean, T extends 'string' | 'number'>( code: string, nullable: N, type: T): N extends true ? (T extends 'string' ? string : number) | null : T extends 'string' ? string : number;
    getSubFieldValue<N extends boolean>( code: string, nullable: N): N extends true ? string | null : string
    getSubFieldValue( code: string, nullable = false, type = 'string'): string | number | null {
        const subfield = this["mxc:datafield"].children.find(subField => subField["mxc:subfield"].code === code);
        if (!subfield) {
            if (nullable) {
                return null;
            }
            throw new Error(`Unknown subField with code "${code}" for dataField with tag "${this["mxc:datafield"].tag}"`);
        }
        const content = he.decode(subfield["mxc:subfield"].content);

        return type === 'string' ? content : parseInt(content, 10);
    }
}

export interface SubField {
    "mxc:subfield": {
        code: string;
        content: string;
    };
}


export interface Leader {
    "mxc:leader": {
        content: string;
    };
}

export interface ControlField {
    // noinspection SpellCheckingInspection
    "mxc:controlfield": {
        tag: string;
        content: string;
    };
}


export interface RecordData {
    "srw:recordData": {
        children: [RecordDatumInterface]
    }
}

export interface Attribute {
    "ixm:attr": {
        name: string;
        content: string;
    };
}

export interface CreationDateAttribute extends Attribute {
    "ixm:attr": {
        name: "CreationDate";
        content: string;
    };
}

export interface LastModificationDateAttribute extends Attribute {
    "ixm:attr": {
        name: "LastModificationDate";
        content: string;
    };
}

export interface Score {
    "mn:score": {
        content: string;
    };
}


export interface ExtraRecordData {
    "srw:extraRecordData": {
        children: [
            CreationDateAttribute,
            LastModificationDateAttribute,
            Score
        ]
    }
}

export interface RecordPacking {
    "srw:recordPacking": {
        content: string;
    };
}

export interface RecordIdentifier {
    "srw:recordIdentifier": {
        content: string;
    };
}

export interface RecordPosition {
    "srw:recordPosition": {
        content: string;
    };
}


export interface Record {
    "srw:record": {
        "children": [
            RecordSchema,
            RecordPacking,
            RecordData,
            RecordIdentifier,
            RecordPosition,
            ExtraRecordData
        ]
    }
}

export interface Query {
    "srw:query": {
        content: string;
    };
}

export interface SearchRetrieveRequest {
    "srw:echoedSearchRetrieveRequest": {
        children: [
            Version,
            Query,
        ]
    }
}

export interface Version {
    "srw:version": {
        content: string;
    };
}

export interface RecordSchema {
    "srw:recordSchema": {
        content: string;
    };
}


export interface NumberOfRecords {
    "srw:numberOfRecords": {
        content: string;
    };
}


export interface Records {
    "srw:records": {
        children: Record[]
    }
}

export interface SearchRetrieveResponse {
    "xmlns:srw": string,
    "xmlns": string,
    "xmlns:ixm": string,
    "xmlns:mn": string,
    "xmlns:sd": string,
    children: [
        Version,
        SearchRetrieveRequest,
        NumberOfRecords,
        Records
    ],
}

export interface BNFResponse {
    "srw:searchRetrieveResponse": SearchRetrieveResponse
}
