import { useState, useEffect } from 'react';
import BlockchainStatus from './components/BlockchainStatus';
import AnvilControls from './components/AnvilControls';

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
    const interval = setInterval(fetchBlockchainInfo, 10000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Blockchain Dashboard</h1>
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <BlockchainStatus info={blockchainInfo} />
          <AnvilControls />
        </>
      )}
    </div>
  );
}

export default App; 