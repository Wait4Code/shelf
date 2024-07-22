// src/stores/barcodeStore.ts
import {create} from 'zustand';

interface BarcodeStore {
    barcodes: string[];
    add: (barcode: string) => void;
    clear: () => void;
    has: (barcode: string) => boolean;
}

export const useBarcodeStore = create<BarcodeStore>((set, get) => ({
    barcodes: [],
    add: (barcode: string) => set(state => {
        if (!state.has(barcode)) {
            return {barcodes: [...state.barcodes, barcode]};
        }

        return state;
    }),
    clear: () => set({barcodes: []}),
    has: (barcode: string) => get().barcodes.includes(barcode),
}));
