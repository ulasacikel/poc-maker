import { useState } from 'react';
import '../styles/ContractUploader.css';

function ContractUploader() {
    const [repoUrl, setRepoUrl] = useState('');
    const [useNpm, setUseNpm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [deploymentResult, setDeploymentResult] = useState(null);
    const [error, setError] = useState(null);

    const handleUrlChange = (event) => {
        const url = event.target.value;
        setRepoUrl(url);
        setError(null);
        setStatus('');
        setDeploymentResult(null);
    };

    const handleDeploy = async () => {
        if (!repoUrl) {
            setError('Please enter a repository URL');
            return;
        }

        if (!repoUrl.endsWith('.git')) {
            setError('Please enter a valid git repository URL (ending with .git)');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setDeploymentResult(null);
        setStatus('Preparing deployment...');

        try {
            const response = await fetch('http://localhost:3001/api/contracts/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    repoUrl,
                    useNpm 
                })
            });

            const reader = response.body.getReader();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                const lines = text.split('\n');
                
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            console.log('Received data:', data);
                            if (data.status) {
                                setStatus(data.status);
                            } else if (data.deployedContracts) {
                                const { project, deployedContracts } = data.deployedContracts;
                                setDeploymentResult({
                                    project,
                                    deployedContracts: Array.isArray(deployedContracts) 
                                        ? deployedContracts 
                                        : []
                                });
                                setStatus('');
                            } else if (data.error) {
                                throw new Error(data.error);
                            }
                        } catch (e) {
                            console.log('Non-JSON message:', line);
                        }
                    }
                }
            }
        } catch (err) {
            setError(err.message);
            setStatus('');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="contract-uploader">
            <h2>Deploy Contracts</h2>
            
            <div className="upload-section">
                <input
                    type="text"
                    value={repoUrl}
                    onChange={handleUrlChange}
                    placeholder="Enter GitHub repository URL (e.g., https://github.com/user/repo.git)"
                    className="repo-input"
                    disabled={isProcessing}
                />
                
                <div className="npm-option">
                    <label>
                        <input
                            type="checkbox"
                            checked={useNpm}
                            onChange={(e) => setUseNpm(e.target.checked)}
                            disabled={isProcessing}
                        />
                        Install NPM dependencies
                    </label>
                </div>
                
                <button 
                    onClick={handleDeploy} 
                    disabled={!repoUrl || isProcessing}
                    className="deploy-button"
                >
                    {isProcessing ? 'Processing...' : 'Clone & Deploy'}
                </button>
            </div>

            {status && (
                <div className="status-message">
                    <div className="status-spinner"></div>
                    {status}
                </div>
            )}

            {error && (
                <div className="error-message">
                    Error: {error}
                </div>
            )}

            {deploymentResult && (
                <div className="deployment-result">
                    <h3>Deployment Results:</h3>
                    {deploymentResult.project && (
                        <div className="project-info">
                            <p><strong>Project:</strong> {deploymentResult.project.name}</p>
                            <p><strong>Repository:</strong> {deploymentResult.project.repoUrl}</p>
                        </div>
                    )}
                    <div className="contracts-list">
                        {Array.isArray(deploymentResult.deployedContracts) && 
                            deploymentResult.deployedContracts.map((contract, index) => (
                                <div key={index} className="contract-item">
                                    <h4>{contract.name}</h4>
                                    <p>Address: <code>{contract.address}</code></p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContractUploader; 