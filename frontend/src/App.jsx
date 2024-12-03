import { useState, useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import createRouter from './router';

function App() {
    const [blockchainInfo, setBlockchainInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlockchainInfo = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/blockchain-status');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setBlockchainInfo(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch blockchain status');
                console.error(err);
            }
        };

        fetchBlockchainInfo();
        const interval = setInterval(fetchBlockchainInfo, 10000);

        return () => clearInterval(interval);
    }, []);

    const router = useMemo(() => 
        createRouter(blockchainInfo, error), 
        [blockchainInfo, error]
    );

    return (
        <RouterProvider 
            router={router}
            fallbackElement={<div>Loading...</div>}
        />
    );
}

export default App; 