import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import {Box, IconButton, Snackbar} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Html5Qrcode, Html5QrcodeScanner, Html5QrcodeScannerState, Html5QrcodeSupportedFormats} from 'html5-qrcode';
import {Html5QrcodeScannerConfig} from "html5-qrcode/src/html5-qrcode-scanner";
import {QrcodeSuccessCallback} from "html5-qrcode/src/core";

interface BarcodeScannerProps {
    onClose: () => void;
}

const useStyles: { [k: string]: CSSProperties } = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'stretch',
        alignItems: 'stretch',
        zIndex: 9999,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        color: '#fff',
        zIndex: 10000,
    },
    captureFrame: {
        flexGrow: 1,
    },
    snackbar: {
        zIndex: 10002, // Ensure snackbar is on top
    },
};

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({onClose}) => {
    const [barcode, setBarcode] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

    const onScanSuccess: QrcodeSuccessCallback = decodedText => {
        setBarcode(decodedText);
    };

    useEffect(() => {
        const {innerWidth: viewWidth, innerHeight: viewHeight} = window;
        const config: Html5QrcodeScannerConfig = {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
                return {width: viewfinderWidth * 0.6, height: viewfinderHeight * 0.2}
            },
            formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
            aspectRatio: viewHeight / viewWidth,
        };

        html5QrcodeRef.current = new Html5Qrcode("reader");
        scannerRef.current = new Html5QrcodeScanner("reader", config, /* verbose= */ false);


        html5QrcodeRef.current?.start({facingMode: "environment"}, config, onScanSuccess, undefined);


        return () => {
            if (html5QrcodeRef.current && [Html5QrcodeScannerState.PAUSED, Html5QrcodeScannerState.SCANNING].includes(html5QrcodeRef.current.getState())) {
                html5QrcodeRef.current.stop().then(() => html5QrcodeRef.current?.clear());
            }
        };
    }, []);


    return (
        <Box sx={useStyles.container}>
            <IconButton sx={useStyles.closeButton} onClick={onClose}>
                <CloseIcon/>
            </IconButton>
            <div id="reader" style={useStyles.captureFrame}></div>
            <Snackbar
                open={!!barcode}
                message={barcode}
                autoHideDuration={2000}
                onClose={() => setBarcode(null)}
                sx={useStyles.snackbar} // Ensure snackbar is on top
            />
        </Box>
    );
};
