import { useState, useCallback } from 'react';
import { anvilMethods, methodCategories } from '../config/anvilMethods';
import '../styles/AnvilControls.css';

function AnvilControls() {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [params, setParams] = useState({});
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleMethodChange = (method) => {
        setSelectedMethod(method);
        setParams({});
        setResult(null);
        setError(null);
    };

    const handleParamChange = (paramName, value) => {
        setParams(prev => ({
            ...prev,
            [paramName]: value
        }));
    };

    const executeMethod = async () => {
        try {
            setError(null);
            setResult(null);

            const response = await fetch(`http://localhost:3001/api/anvil/${selectedMethod}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    params: Object.values(params)
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            setResult(data.result);
        } catch (err) {
            setError(err.message);
        }
    };

    const renderParamInput = (param) => {
        const value = params[param.name] || '';
        
        return (
            <div className="param-input" key={param.name}>
                <label>{param.name}:</label>
                <div className="input-with-button">
                    <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        placeholder={param.placeholder || param.type}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="anvil-controls">
            <h2>Anvil Controls</h2>
            
            <div className="method-selector">
                <label>Select Method:</label>
                <select 
                    value={selectedMethod} 
                    onChange={(e) => handleMethodChange(e.target.value)}
                >
                    <option value="">Select a method...</option>
                    {methodCategories.map(category => (
                        <optgroup key={category} label={category}>
                            {Object.entries(anvilMethods)
                                .filter(([_, method]) => method.category === category)
                                .map(([methodName, _]) => (
                                    <option key={methodName} value={methodName}>
                                        {methodName}
                                    </option>
                                ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            {selectedMethod && (
                <div className="method-params">
                    <h3>Parameters</h3>
                    {anvilMethods[selectedMethod].params.map(param => (
                        <div key={param.name}>
                            {renderParamInput(param)}
                        </div>
                    ))}
                    <button onClick={executeMethod} className="execute-button">
                        Execute
                    </button>
                </div>
            )}

            {error && (
                <div className="error-message">
                    Error: {error}
                </div>
            )}

            {result !== null && (
                <div className="result">
                    <h3>Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default AnvilControls; 