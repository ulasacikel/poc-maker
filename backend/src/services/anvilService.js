const { ethers } = require('ethers');

class AnvilService {
    constructor(provider) {
        this.provider = provider;
    }

    // Account management
    async impersonateAccount(address) {
        return await this.provider.send('anvil_impersonateAccount', [address]);
    }

    async stopImpersonatingAccount(address) {
        return await this.provider.send('anvil_stopImpersonatingAccount', [address]);
    }

    async setAutoImpersonateAccount(enabled) {
        return await this.provider.send('anvil_autoImpersonateAccount', [enabled]);
    }

    // Mining control
    async getAutomine() {
        return await this.provider.send('anvil_getAutomine', []);
    }

    async mine(numBlocks = 1, interval = 0) {
        return await this.provider.send('anvil_mine', [numBlocks, interval]);
    }

    // Transaction management
    async dropTransaction(txHash) {
        return await this.provider.send('anvil_dropTransaction', [txHash]);
    }

    // Fork management
    async reset(forking = {}) {
        return await this.provider.send('anvil_reset', [forking]);
    }

    async setRpcUrl(url) {
        return await this.provider.send('anvil_setRpcUrl', [url]);
    }

    // State management
    async setBalance(address, balance) {
        return await this.provider.send('anvil_setBalance', [address, balance]);
    }

    async setCode(address, code) {
        return await this.provider.send('anvil_setCode', [address, code]);
    }

    async setNonce(address, nonce) {
        return await this.provider.send('anvil_setNonce', [address, nonce]);
    }

    async setStorageAt(address, slot, value) {
        return await this.provider.send('anvil_setStorageAt', [address, slot, value]);
    }

    // Node configuration
    async setCoinbase(address) {
        return await this.provider.send('anvil_setCoinbase', [address]);
    }

    async setLoggingEnabled(enabled) {
        return await this.provider.send('anvil_setLoggingEnabled', [enabled]);
    }

    async setMinGasPrice(gasPrice) {
        return await this.provider.send('anvil_setMinGasPrice', [gasPrice]);
    }

    async setNextBlockBaseFeePerGas(baseFee) {
        return await this.provider.send('anvil_setNextBlockBaseFeePerGas', [baseFee]);
    }

    async setChainId(chainId) {
        return await this.provider.send('anvil_setChainId', [chainId]);
    }

    // State dump/load
    async dumpState() {
        return await this.provider.send('anvil_dumpState', []);
    }

    async loadState(state) {
        return await this.provider.send('anvil_loadState', [state]);
    }

    async getNodeInfo() {
        return await this.provider.send('anvil_nodeInfo', []);
    }
}

module.exports = AnvilService; 