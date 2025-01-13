// HeaderContext.jsx
import React, {createContext, PropsWithChildren, useMemo, useState} from 'react';
import {SxProps, Theme} from "@mui/material";

interface HeaderContextInterface {
    headerStyles: SxProps<Theme>;
    setHeaderStyles: (headerStyles: SxProps<Theme>) => void;
    toolbarStyles: SxProps<Theme>;
    setToolbarStyles: (toolbarStyles: SxProps<Theme>) => void;
    content: React.ReactNode;
    setContent: (content: React.ReactNode) => void;
}


export const HeaderContext = createContext<HeaderContextInterface>({
    headerStyles: {},
    setHeaderStyles: () => {
    },
    toolbarStyles: {},
    setToolbarStyles: () => {
    },
    content: <></>,
    setContent: () => {
    }
});

export const HeaderProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [headerStyles, setHeaderStyles] = useState<HeaderContextInterface['headerStyles']>({});
    const [toolbarStyles, setToolbarStyles] = useState<HeaderContextInterface['toolbarStyles']>({});
    const [content, setContent] = useState<HeaderContextInterface['content']>(<></>);

    const value = useMemo(() => ({
        headerStyles, setHeaderStyles,
        toolbarStyles, setToolbarStyles,
        content, setContent
    }), [headerStyles, setHeaderStyles, toolbarStyles, setToolbarStyles, content, setContent]);

    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    );
}
