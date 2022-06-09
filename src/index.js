import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 2. Call `extendTheme` and pass your custom values
const theme = extendTheme({
    styles: {
        global: {
            // styles for the `body`
        },
    },
    colors: {
        brand: {
            100: 'rgb(241,241,242)',
            200: 'rgb(188,215,234)',
            300: 'rgb(8,37,63)'
        },
    },
    components: {
        Button: {
            variants: {
                'branded': {
                    bg: 'brand.200',
                    color: 'brand.300',
                },
            },
        },
    },
})

root.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
