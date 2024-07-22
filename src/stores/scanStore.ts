// src/stores/scanStore.ts
import {create} from 'zustand';
import {fetchBookDataFromGoogleBooks} from "../utils/bookUtils";
import {Book} from "../types/Book";


export enum SearchState {
    Error,
    Pending,
    Success,
}

interface BarcodeSearch {
    state: SearchState;
    results: Book[]
}


interface ScanStore {
    scans: {
        [barcode: string]: BarcodeSearch
    };
    addBarcode: (barcode: string) => Promise<void>;
    clear: () => void;
    hasBarcode: (barcode: string) => boolean;
    hasAny: () => boolean;
    count: () => number;
}

export const useScanStore = create<ScanStore>((set, get) => ({
    scans: {},
    addBarcode: async (barcode: string) => {
        if (get().hasBarcode(barcode)) {
            return;
        }

        set(state => ({scans: {...state.scans, [barcode]: {state: SearchState.Pending, results: []}}}));
        try {
            const book = await fetchBookDataFromGoogleBooks(barcode);
            if(!book){
                set(state => ({scans: {...state.scans, [barcode]: {state: SearchState.Error, results: []}}}));
            }else{
                set(state => ({scans: {...state.scans, [barcode]: {state: SearchState.Success, results: [book]}}}))
            }
        } catch (error) {
            set(state => ({scans: {...state.scans, [barcode]: {state: SearchState.Error, results: []}}}));
        }
    },
    clear: () => set({scans: {}}),
    hasBarcode: (barcode: string) => Object.keys(get().scans).includes(barcode),
    hasAny: () => get().count() > 0,
    count: () => Object.keys(get().scans).length
}));
