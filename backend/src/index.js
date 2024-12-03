const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const AnvilService = require('./services/anvilService');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let provider = null;
let anvilService = null;

async function initializeProvider() {
    while (!provider) {
        try {
            console.log('Attempting to connect to Anvil...');
            const tempProvider = new ethers.JsonRpcProvider('http://anvil:8545');
            await tempProvider.getNetwork();
            provider = tempProvider;
            anvilService = new AnvilService(provider);
            console.log('Successfully connected to Anvil node');
            return;
        } catch (error) {
            console.log('Failed to connect to Anvil, retrying in 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

// Anvil RPC endpoints
app.post('/api/anvil/:method', async (req, res) => {
    try {
        if (!anvilService) {
            throw new Error('Anvil service not initialized');
        }

        const method = req.params.method;
        const params = req.body.params || [];

        if (typeof anvilService[method] !== 'function') {
            throw new Error('Invalid method');
        }

        const result = await anvilService[method](...params);
        res.json({ result });
    } catch (error) {
        res.status(500).json({
            error: 'Anvil RPC call failed',
            details: error.message
        });
    }
});

// Original blockchain status endpoint
app.get('/api/blockchain-status', async (req, res) => {
    try {
        if (!provider) {
            await initializeProvider();
        }
        
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        
        const responseData = serializeResponse({ 
            blockNumber,
            nodeInfo: 'Connected to Anvil node',
            chainId: network.chainId,
            networkName: network.name
        });

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to connect to Anvil node',
            details: error.message 
        });
    }
});

function serializeResponse(data) {
    return JSON.parse(JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

initializeProvider().then(() => {
    app.listen(port, () => {
        console.log(`Backend API running on port ${port}`);
    });
}); 