// src/App.tsx
import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes as RouterRoutes} from "react-router-dom";
import {SnackbarProvider} from 'notistack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
// import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {Homepage} from "./pages/Homepage";
import {LoansPage} from "./pages/LoansPage";
import {ScanPage} from "./pages/ScanPage";
import {SearchPage} from "./pages/SearchPage";
import {ShoppingCartPage} from "./pages/ShoppingCartPage";
import {Routes} from "./utils/routes";
import {useSearchStore, setSyncService} from "./stores/searchStore";
import {Layout} from "./components/Layout";
import {HeaderProvider} from './stores/header';
import {useCreateResearchedItem, useUpdateResearchedItem, useDeleteResearchedItem} from './hooks/useResearchedItems';
import {useAutoSync} from './hooks/useAutoSync';

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

// Composant interne pour gérer la synchronisation
const AppContent: React.FC = () => {
    const {scan} = useSearchStore();
    const createMutation = useCreateResearchedItem();
    const updateMutation = useUpdateResearchedItem();
    const deleteMutation = useDeleteResearchedItem();

    // Configuration de la synchronisation automatique
    useAutoSync({
        interval: 30000, // 30 secondes
        syncOnMount: true,
        syncOnFocus: true,
        syncOnOnline: true,
    });

    // Injection des services React Query dans le store Zustand
    useEffect(() => {
        setSyncService({
            createResearch: async (data) => {
                const result = await createMutation.mutateAsync(data);
                return result;
            },
            updateResearch: async (id, data) => {
                const result = await updateMutation.mutateAsync({ id, data });
                return result;
            },
            deleteResearch: async (id) => {
                await deleteMutation.mutateAsync(id);
            },
        });

        // Cleanup - retirer le service lors du démontage
        return () => {
            setSyncService(null);
        };
    }, [createMutation, updateMutation, deleteMutation]);

    useEffect(() => {
        void scan('9782379331862'); // Barbarossa, 1941, la guerre absolue
        void scan('9782262105105'); // l'ours et le renard
        void scan('9782717866759');
        void scan('9782800108582');
        void scan('9782847347746');
        void scan('9782847347074');
        void scan('9782501117166');
        void scan('9782501104920');
        void scan('9782070457663'); // les décisions absurdes T1
        void scan('9782070456239'); // les décisions absurdes T2
        void scan('9782072729096'); // les décisions absurdes T3
        void scan('9791040400875'); // barbarossa 2eme edition
        void scan('9782709643740'); // inferno
        void scan('9798377302445'); // d.brief
        void scan('9791095598114'); // sortir de l'ombre - romans
        void scan('3781710305957'); // guerre & histoire - n1
        void scan('9782262068257'); // infographie
        void scan('9791033511960'); // carbone & silicium
        void scan('3782924705908'); // niépi - n1
    }, [scan])

    return (
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <HeaderProvider>
                <BrowserRouter>
                    <RouterRoutes>
                        <Route path={''} element={<Layout/>}>
                            <Route path={Routes.home} Component={Homepage}/>
                            <Route path={Routes.library} Component={Homepage}/>
                            <Route path={Routes.research} Component={SearchPage}/>
                            <Route path={Routes.research_scan} Component={ScanPage}/>
                            <Route path={Routes.shoppingCart} Component={ShoppingCartPage}/>
                            <Route path={Routes.loans} Component={LoansPage}/>
                        </Route>
                    </RouterRoutes>
                </BrowserRouter>
            </HeaderProvider>
        </SnackbarProvider>
    );
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppContent />
            {/* Devtools React Query (uniquement en développement) */}
            {/* {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )} */}
        </QueryClientProvider>
    );
};

export default App;
