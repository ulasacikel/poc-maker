const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { ethers } = require('ethers');
const EventEmitter = require('events');
const Project = require('../models/Project');
const { Op } = require('sequelize');

class ContractService extends EventEmitter {
    constructor(provider) {
        super();
        this.provider = provider;
        this.contractsDir = path.join(__dirname, '../contracts');
    }

    async cloneAndDeploy(repoUrl, useNpm = false) {
        try {
            // Create or update project in database
            const projectName = repoUrl.split('/').pop().replace('.git', '');
            let project = await Project.findOne({ where: { repoUrl } });
            
            if (!project) {
                project = await Project.create({
                    name: projectName,
                    repoUrl
                });
            }

            // Create contracts directory if it doesn't exist
            if (!fs.existsSync(this.contractsDir)) {
                this.emit('status', 'Creating workspace directory...');
                fs.mkdirSync(this.contractsDir, { recursive: true });
            }

            // Create a unique directory for this deployment
            const deploymentDir = path.join(this.contractsDir, `deploy_${Date.now()}`);
            fs.mkdirSync(deploymentDir, { recursive: true });

            // Clone repository
            this.emit('status', 'Cloning repository...');
            try {
                await exec(`git clone ${repoUrl} .`, { cwd: deploymentDir });
            } catch (error) {
                console.error('Failed to clone repository:', error);
                throw new Error('Failed to clone repository');
            }

            // Install dependencies based on option
            if (useNpm) {
                this.emit('status', 'Installing NPM dependencies...');
                try {
                    await exec('npm install', { cwd: deploymentDir });
                } catch (error) {
                    console.error('Failed to install NPM dependencies:', error);
                    throw new Error('Failed to install NPM dependencies');
                }
            }

            // Install Forge dependencies
            this.emit('status', 'Installing Forge dependencies...');
            try {
                await exec('forge install', { cwd: deploymentDir });
            } catch (error) {
                console.error('Failed to install dependencies:', error);
                throw new Error('Failed to install dependencies');
            }

            // Compile contracts
            this.emit('status', 'Compiling contracts...');
            try {
                const { stdout, stderr } = await exec('forge build --force', { 
                    cwd: deploymentDir 
                });
                if (stderr) {
                    console.log('Compilation warnings:', stderr);
                }
                console.log('Compilation output:', stdout);
            } catch (error) {
                console.error('Compilation failed:', error);
                throw new Error('Contract compilation failed');
            }

            // Deploy contracts
            this.emit('status', 'Deploying contracts...');
            const artifactsDir = path.join(deploymentDir, 'out');
            const deployedContracts = await this.deployContracts(artifactsDir);

            // Cleanup
            this.emit('status', 'Cleaning up...');
            fs.rmSync(deploymentDir, { recursive: true, force: true });

            // Update project with deployment results
            await project.update({
                deployedContracts: deployedContracts,
                lastDeployment: new Date()
            });

            return {
                project: {
                    id: project.id,
                    name: project.name,
                    repoUrl: project.repoUrl,
                    lastDeployment: project.lastDeployment
                },
                deployedContracts
            };
        } catch (error) {
            console.error('Contract deployment error:', error);
            throw new Error(`Failed to process contracts: ${error.message}`);
        }
    }

    async deployContracts(artifactsDir) {
        const deployedContracts = [];
        console.log('Checking artifacts directory:', artifactsDir);
        
        const deploymentDir = path.dirname(artifactsDir);
        const srcDir = path.join(deploymentDir, 'src');
        
        if (!fs.existsSync(artifactsDir) || !fs.existsSync(srcDir)) {
            console.log('Required directories do not exist');
            return deployedContracts;
        }

        // Get list of source files and their content
        const getSourceFiles = (dir) => {
            let results = [];
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    results = results.concat(getSourceFiles(filePath));
                } else if (file.endsWith('.sol') && !file.includes('.t.sol')) {
                    const contractName = path.basename(file, '.sol');
                    const sourceCode = fs.readFileSync(filePath, 'utf8');
                    results.push({ name: contractName, sourceCode });
                }
            }
            
            return results;
        };

        const sourceFiles = getSourceFiles(srcDir);
        console.log('Source contracts:', sourceFiles.map(f => f.name));

        // Find and process corresponding artifacts
        const findArtifacts = (dir, sourceFiles) => {
            let results = [];
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    results = results.concat(findArtifacts(filePath, sourceFiles));
                } else if (file.endsWith('.json')) {
                    const contractName = path.basename(file, '.json');
                    const sourceFile = sourceFiles.find(f => f.name === contractName);
                    if (sourceFile) {
                        results.push({
                            artifactPath: filePath,
                            sourceCode: sourceFile.sourceCode
                        });
                    }
                }
            }
            
            return results;
        };

        const artifacts = findArtifacts(artifactsDir, sourceFiles);

        for (const { artifactPath, sourceCode } of artifacts) {
            try {
                console.log('Processing artifact:', artifactPath);
                const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

                if (artifact.bytecode && artifact.bytecode.object && artifact.abi) {
                    const contractName = path.basename(artifactPath, '.json');
                    console.log(`Deploying ${contractName}...`);
                    
                    const contract = await this.deployContract(
                        artifact.abi,
                        artifact.bytecode.object
                    );
                    
                    deployedContracts.push({
                        name: contractName,
                        address: contract.address,
                        abi: artifact.abi,
                        sourceCode: sourceCode,
                        deployer: contract.deployer,
                        deploymentTx: contract.deploymentTx,
                        deploymentBlock: contract.deploymentBlock
                    });
                    
                    console.log(`Deployed ${contractName} at ${contract.address}`);
                } else {
                    console.log(`Skipping ${artifactPath} - not a deployable contract`);
                }
            } catch (error) {
                console.error(`Failed to deploy from ${artifactPath}:`, error);
            }
        }

        console.log('Deployed contracts:', deployedContracts);
        return deployedContracts;
    }

    async deployContract(abi, bytecode) {
        try {
            const signer = await this.provider.getSigner();
            const factory = new ethers.ContractFactory(abi, bytecode, signer);
            const contract = await factory.deploy();
            
            // Wait for deployment
            const deployed = await contract.waitForDeployment();
            const address = await deployed.getAddress();
            const deployer = await signer.getAddress();
            
            // Get deployment transaction
            const tx = deployed.deploymentTransaction();
            const receipt = await tx.wait();
            
            console.log(`Contract deployed to: ${address}`);
            return {
                ...deployed,
                address,
                deployer,
                deploymentTx: tx.hash,
                deploymentBlock: receipt.blockNumber
            };
        } catch (error) {
            console.error('Deployment error:', error);
            throw error;
        }
    }

    async getProjects(includeArchived = false) {
        const where = includeArchived ? {} : { status: 'active' };
        return await Project.findAll({
            order: [['lastDeployment', 'DESC']],
            where
        });
    }

    async getProject(id) {
        return await Project.findByPk(id);
    }

    async archiveProject(id) {
        const project = await Project.findByPk(id);
        if (project) {
            await project.update({ status: 'archived' });
        }
        return project;
    }

    async getContractDetails(address) {
        try {
            // Get all projects first
            const projects = await Project.findAll();
            
            // Find the project that contains the contract
            const project = projects.find(p => 
                p.deployedContracts?.some(c => 
                    c.address?.toLowerCase() === address.toLowerCase()
                )
            );

            if (!project) {
                throw new Error('Contract not found in database');
            }

            const contractInfo = project.deployedContracts.find(
                c => c.address.toLowerCase() === address.toLowerCase()
            );

            if (!contractInfo) {
                throw new Error('Contract info not found');
            }

            // Verify contract exists on chain
            const code = await this.provider.getCode(address);
            if (code === '0x') {
                throw new Error('Contract not found on chain');
            }

            // Get the latest block for timestamp
            const block = await this.provider.getBlock('latest');

            // Get contract creation info
            const txCount = await this.provider.getTransactionCount(address);
            const balance = await this.provider.getBalance(address);

            // Get deployment transaction if available
            let deploymentTx = null;
            try {
                const filter = {
                    fromBlock: 0,
                    toBlock: 'latest',
                    address: address
                };
                const logs = await this.provider.getLogs(filter);
                if (logs.length > 0) {
                    deploymentTx = logs[0].transactionHash;
                }
            } catch (err) {
                console.log('Could not fetch deployment transaction:', err);
            }

            return {
                name: contractInfo.name,
                sourceCode: contractInfo.sourceCode || '',
                address: address,
                deployedAt: project.lastDeployment,
                blockNumber: block.number,
                deployer: contractInfo.deployer || 'Unknown',
                balance: ethers.formatEther(balance),
                transactionCount: txCount.toString(),
                deploymentTx: deploymentTx,
                abi: contractInfo.abi
            };
        } catch (error) {
            console.error('Failed to get contract details:', error);
            throw error;
        }
    }
}

module.exports = ContractService; 