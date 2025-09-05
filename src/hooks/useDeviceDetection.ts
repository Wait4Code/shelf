// src/hooks/useDeviceDetection.ts
import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            // Détection basée sur la taille de l'écran et les capacités tactiles
            const isMobileDevice = window.innerWidth < 768 || 
                                 ('ontouchstart' in window) || 
                                 (navigator.maxTouchPoints > 0);
            setIsMobile(isMobileDevice);
        };

        // Vérification initiale
        checkDevice();

        // Écouter les changements de taille d'écran
        window.addEventListener('resize', checkDevice);

        return () => {
            window.removeEventListener('resize', checkDevice);
        };
    }, []);

    return { isMobile, isDesktop: !isMobile };
};
