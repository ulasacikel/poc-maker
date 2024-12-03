import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TabNavigation from './TabNavigation';

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveTab = () => {
        const path = location.pathname.substring(1);
        return path || 'blockchain';
    };

    const handleTabChange = (tab) => {
        navigate(tab === 'blockchain' ? '/' : `/${tab}`);
    };

    return (
        <div className="App">
            <h1>Blockchain Dashboard</h1>
            <TabNavigation 
                activeTab={getActiveTab()} 
                onTabChange={handleTabChange}
            />
            <Outlet />
        </div>
    );
}

export default Layout; 