function BlockchainStatus({ info }) {
  if (!info) {
    return (
      <div className="blockchain-status">
        <div className="status-item">
          <h3>Status</h3>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blockchain-status">
      <h2>Network Status</h2>
      <div className="status-grid">
        <div className="status-item">
          <h3>Block Number</h3>
          <p>{info.blockNumber}</p>
        </div>
        <div className="status-item">
          <h3>Chain ID</h3>
          <p>{info.chainId}</p>
        </div>
        <div className="status-item">
          <h3>Network</h3>
          <p>{info.networkName || 'Local Anvil'}</p>
        </div>
        <div className="status-item">
          <h3>Status</h3>
          <p>{info.nodeInfo}</p>
        </div>
      </div>
    </div>
  );
}

export default BlockchainStatus; 