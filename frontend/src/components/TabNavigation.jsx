import { Link } from 'react-router-dom';
import '../styles/TabNavigation.css';

function TabNavigation({ activeTab, onTabChange }) {
    return (
        <div className="tab-navigation">
            <Link 
                to="/"
                className={`tab-button ${activeTab === 'blockchain' ? 'active' : ''}`}
                onClick={() => onTabChange('blockchain')}
            >
                Blockchain Status
            </Link>
            <Link 
                to="/anvil"
                className={`tab-button ${activeTab === 'anvil' ? 'active' : ''}`}
                onClick={() => onTabChange('anvil')}
            >
                Anvil Controls
            </Link>
            <Link 
                to="/deploy"
                className={`tab-button ${activeTab === 'deploy' ? 'active' : ''}`}
                onClick={() => onTabChange('deploy')}
            >
                Deploy Contracts
            </Link>
            <Link 
                to="/projects"
                className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => onTabChange('projects')}
            >
                Projects
            </Link>
        </div>
    );
}

export default TabNavigation; 