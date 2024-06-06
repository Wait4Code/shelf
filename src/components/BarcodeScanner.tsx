import React, { useCallback, useRef, useEffect } from 'react';
import { fetchAndAddBook } from '../utils/bookUtils';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BrowserMultiFormatReader } from '@zxing/library';
import Webcam from 'react-webcam';
import { isMobile } from 'react-device-detect';

interface BarcodeScannerProps {
    onClose: () => void;
}

const useStyles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        color: '#fff',
        zIndex: 10000,
    },
    webcam: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        zIndex: 9999,
    },
};

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose }) => {
    const webcamRef = useRef<Webcam>(null);
    const codeReader = new BrowserMultiFormatReader();

    const handleScan = useCallback(async () => {
        if (webcamRef.current) {
            const video = webcamRef.current.video;

            if (video) {
                try {
                    const result = await codeReader.decodeFromVideoElement(video);
                    fetchAndAddBook(result.getText()).then(() => {
                        codeReader.reset();
                        onClose();
                    });
                } catch (error) {
                    console.error('Error decoding from video element', error);
                }
            }
        }
    }, [codeReader, onClose]);

    useEffect(() => {
        handleScan();

        return () => {
            codeReader.reset();
        };
    }, [handleScan, codeReader]);

    const videoConstraints = {
        facingMode: isMobile ? 'environment' : undefined,
    };

    return (
        <Box sx={useStyles.container}>
            <IconButton sx={useStyles.closeButton} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={useStyles.webcam}
            />
        </Box>
    );
};
