// src/pages/BarcodeScanner.tsx
import React, {useEffect, useRef, useState} from 'react';
import {Box, Fab, Snackbar} from '@mui/material';
import {
    Html5Qrcode,
    Html5QrcodeScanner,
    Html5QrcodeScannerState,
    Html5QrcodeSupportedFormats,
    QrcodeSuccessCallback
} from 'html5-qrcode';
import {useSearchStore} from '../stores/searchStore';
import {Html5QrcodeScannerConfig} from "html5-qrcode/html5-qrcode-scanner";
import {useNavigate} from "react-router-dom";
import {Routes} from "../utils/routes";
import {NavigateNext} from "@mui/icons-material";

const useStyles = {
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
    scanner: {
        flexGrow: 1,
    },
    managementButton: {
        position: 'fixed',
        bottom: 16+56,
        right: 16,
        zIndex: 10000,
    }
};

export const BarcodeScanner: React.FC = () => {
    const navigate = useNavigate();
    const {research, hasIdentifier, count} = useSearchStore();
    const [scanFeedback, setScanFeedback] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const onScanSuccess: QrcodeSuccessCallback = decodedText => {
            let message = `Code-barres scanné : ${decodedText}`;
            if (hasIdentifier(decodedText)) {
                message += ' (déjà scanné !)';
            }
            void research(decodedText);
            setScanFeedback(message);
        };

        const {innerWidth: viewWidth, innerHeight: viewHeight} = window;
        // noinspection SpellCheckingInspection
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
    }, [research, hasIdentifier]);

    return (
        <Box sx={useStyles.container}>
            <div id="reader" style={useStyles.scanner}></div>
            <Snackbar
                open={!!scanFeedback}
                message={scanFeedback}
                autoHideDuration={2000}
                onClose={() => setScanFeedback(null)}
                sx={count() > 0 ? {bottom: {xs: 90}} : {}}
            />
            {count() > 0 &&
                <Fab
                    sx={useStyles.managementButton}
                    color="primary"
                    onClick={() => navigate(Routes.research_results)}
                >
                    <NavigateNext fontSize="large"/>
                </Fab>
            }
        </Box>
    );
};
