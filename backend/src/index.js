const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const AnvilService = require('./services/anvilService');
const multer = require('multer');
const ContractService = require('./services/contractService');
const sequelize = require('./config/database');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let provider = null;
let anvilService = null;
let contractService = null;

const upload = multer({ dest: 'uploads/' });

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

async function initializeServices() {
    // Initialize database
    try {
        await sequelize.sync();
        console.log('Database synchronized');
    } catch (error) {
        console.error('Failed to sync database:', error);
        process.exit(1);
    }

    // Initialize provider
    await initializeProvider();
    contractService = new ContractService(provider);
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

// Update the contracts endpoint
app.post('/api/contracts/deploy', express.json(), async (req, res) => {
    try {
        const { repoUrl, useNpm } = req.body;
        if (!repoUrl) {
            throw new Error('Repository URL is required');
        }

        // Set headers for streaming response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Create new instance for this request
        const contractService = new ContractService(provider);

        // Listen for status updates
        contractService.on('status', (status) => {
            res.write(JSON.stringify({ status }) + '\n');
        });

        const deployedContracts = await contractService.cloneAndDeploy(repoUrl, useNpm);
        res.write(JSON.stringify({ deployedContracts }) + '\n');
        res.end();
    } catch (error) {
        res.status(500).json({
            error: 'Contract deployment failed',
            details: error.message
        });
    }
});

// Get all projects with archive filter
app.get('/api/projects', async (req, res) => {
    try {
        const includeArchived = req.query.includeArchived === 'true';
        const projects = await contractService.getProjects(includeArchived);
        res.json(projects);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch projects',
            details: error.message
        });
    }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await contractService.getProject(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch project',
            details: error.message
        });
    }
});

// Archive project
app.post('/api/projects/:id/archive', async (req, res) => {
    try {
        const project = await contractService.archiveProject(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to archive project',
            details: error.message
        });
    }
});

// Get contract code
app.get('/api/contracts/:address/code', async (req, res) => {
    try {
        if (!anvilService) {
            throw new Error('Anvil service not initialized');
        }

        const code = await anvilService.getContractCode(req.params.address);
        res.json({ code });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get contract code',
            details: error.message
        });
    }
});

app.get('/api/contracts/:address/details', async (req, res) => {
    try {
        const details = await contractService.getContractDetails(req.params.address);
        res.json(details);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get contract details',
            details: error.message
        });
    }
});

function serializeResponse(data) {
    return JSON.parse(JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

initializeServices().then(() => {
    app.listen(port, () => {
        console.log(`Backend API running on port ${port}`);
    });
}); 