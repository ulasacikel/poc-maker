import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import '../styles/ContractDetails.css';

function ContractDetails() {
    const { address } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contractData, setContractData] = useState(null);
    const [activeTab, setActiveTab] = useState('code'); // code, abi

    useEffect(() => {
        fetchContractDetails();
    }, [address]);

    const fetchContractDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/contracts/${address}/details`);
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            setContractData(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch contract details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="contract-details loading">Loading contract details...</div>;
    }

    if (error) {
        return <div className="contract-details error">{error}</div>;
    }

    return (
        <div className="contract-details">
            <div className="contract-header">
                <h2>Contract {contractData.name}</h2>
                <div className="contract-address">{address}</div>
            </div>

            <div className="details-grid">
                <div className="overview-section">
                    <h3>Overview</h3>
                    <div className="info-card">
                        <div className="info-row">
                            <span>Balance:</span>
                            <span>{contractData.balance} ETH</span>
                        </div>
                        <div className="info-row">
                            <span>Transactions:</span>
                            <span>{contractData.transactionCount}</span>
                        </div>
                        <div className="info-row">
                            <span>Deployer:</span>
                            <code>{contractData.deployer}</code>
                        </div>
                        {contractData.deploymentTx && (
                            <div className="info-row">
                                <span>Creation Tx:</span>
                                <code>{contractData.deploymentTx}</code>
                            </div>
                        )}
                        <div className="info-row">
                            <span>Block Number:</span>
                            <span>{contractData.blockNumber}</span>
                        </div>
                        <div className="info-row">
                            <span>Deployed:</span>
                            <span>{new Date(contractData.deployedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="code-section">
                    <div className="code-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
                            onClick={() => setActiveTab('code')}
                        >
                            Contract Source
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'abi' ? 'active' : ''}`}
                            onClick={() => setActiveTab('abi')}
                        >
                            ABI
                        </button>
                    </div>

                    {activeTab === 'code' ? (
                        <div className="source-viewer">
                            <Editor
                                height="500px"
                                language="sol"
                                theme="vs-dark"
                                value={contractData.sourceCode}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: true },
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    wordWrap: "on"
                                }}
                            />
                        </div>
                    ) : (
                        <div className="abi-viewer">
                            <pre>{JSON.stringify(contractData.abi, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ContractDetails; 