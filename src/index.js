import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Amplify} from 'aws-amplify';
import awsExports from './aws-exports';
import {Authenticator} from '@aws-amplify/ui-react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material';
import {ThemeProvider} from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import {SnackbarProvider} from 'notistack';

Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById('root'));
const queryClient = new QueryClient({defaultOptions: {refetchOnWindowFocus: false, retry: 2}});

const theme = createTheme({
    palette: {
        primary: {
            main: '#026773',
            light: '#3ca6a6',
            dark: '#012e40',
        },
        secondary: {
            main: '#f2e3d5',
            light: '#e2b896',
            dark: '#cb8a53',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.54)',
            disabled: 'rgba(0, 0, 0, 0.38)',
            hint: 'rgba(0, 0, 0, 0.38)',
        },
    },
    layout: {
        drawerWidth: '200px',
        headerHeight: '72px',
        headerBottomMargin: '12px',
    },
    zIndex: {
        drawer: 200,
    },
});

root.render(
    <Authenticator.Provider>
        <QueryClientProvider client={queryClient}>
            <MuiThemeProvider theme={theme}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <SnackbarProvider>
                        <App />
                    </SnackbarProvider>
                </ThemeProvider>
            </MuiThemeProvider>
        </QueryClientProvider>
    </Authenticator.Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
