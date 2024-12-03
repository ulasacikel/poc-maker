import { useLoaderData } from 'react-router-dom';
import '../styles/BlockchainStatus.css';

function BlockchainStatus() {
    const blockchainInfo = useLoaderData();

    if (!blockchainInfo) {
        return <div className="blockchain-status loading">Loading...</div>;
    }

    return (
        <div className="blockchain-status">
            <h2>Blockchain Status</h2>
            <div className="status-grid">
                <div className="status-item">
                    <h3>Block Number</h3>
                    <p>{blockchainInfo.blockNumber}</p>
                </div>
                <div className="status-item">
                    <h3>Network</h3>
                    <p>{blockchainInfo.networkName}</p>
                </div>
                <div className="status-item">
                    <h3>Chain ID</h3>
                    <p>{blockchainInfo.chainId}</p>
                </div>
                <div className="status-item">
                    <h3>Node Status</h3>
                    <p>{blockchainInfo.nodeInfo}</p>
                </div>
            </div>
        </div>
    );
}

export default BlockchainStatus; 