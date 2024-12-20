export const anvilMethods = {
    // Account management
    impersonateAccount: {
        category: 'Account Management',
        params: [
            { name: 'address', type: 'string', placeholder: '0x...' }
        ]
    },
    stopImpersonatingAccount: {
        category: 'Account Management',
        params: [
            { name: 'address', type: 'string', placeholder: '0x...' }
        ]
    },
    setAutoImpersonateAccount: {
        category: 'Account Management',
        params: [
            { name: 'enabled', type: 'boolean' }
        ]
    },

    // Mining control
    getAutomine: {
        category: 'Mining Control',
        params: []
    },
    mine: {
        category: 'Mining Control',
        params: [
            { name: 'numBlocks', type: 'number', default: 1 },
            { name: 'interval', type: 'number', default: 0 }
        ]
    },

    // Transaction management
    dropTransaction: {
        category: 'Transaction Management',
        params: [
            { name: 'txHash', type: 'string', placeholder: '0x...' }
        ]
    },

    // State management
    setBalance: {
        category: 'State Management',
        params: [
            { name: 'address', type: 'string', placeholder: '0x...' },
            { name: 'balance', type: 'string', placeholder: 'Balance in wei' }
        ]
    },
    setCode: {
        category: 'State Management',
        params: [
            { name: 'address', type: 'string', placeholder: '0x...' },
            { name: 'code', type: 'string', placeholder: 'Bytecode' }
        ]
    },
    setNonce: {
        category: 'State Management',
        params: [
            { name: 'address', type: 'string', placeholder: '0x...' },
            { name: 'nonce', type: 'number' }
        ]
    },

    // Node configuration
    setCoinbase: {
        category: 'Node Configuration',
        params: [
            { name: 'address', type: 'string', placeholder: '0x...' }
        ]
    },
    setChainId: {
        category: 'Node Configuration',
        params: [
            { name: 'chainId', type: 'number' }
        ]
    },

    // Contract Inspection
    getCode: {
        category: 'Contract Inspection',
        description: 'Gets the bytecode at a given address',
        params: [
            {
                name: 'address',
                type: 'address',
                placeholder: '0x...',
                description: 'The address to get code from'
            }
        ]
    },

    // Optional: Add getStorageAt as well
    getStorageAt: {
        category: 'Contract Inspection',
        description: 'Gets the storage value at a given slot for an address',
        params: [
            {
                name: 'address',
                type: 'address',
                placeholder: '0x...',
                description: 'The contract address'
            },
            {
                name: 'slot',
                type: 'string',
                placeholder: '0x0',
                description: 'The storage slot to read'
            }
        ]
    }
};

export const methodCategories = [
    'Account Management',
    'Mining Control',
    'Transaction Management',
    'Fork Management',
    'State Management',
    'Node Configuration',
    'State Dump/Load',
    'Contract Inspection'
]; 