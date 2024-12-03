import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProjectList.css';

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, [showArchived]);

    const fetchProjects = async () => {
        try {
            const url = showArchived 
                ? 'http://localhost:3001/api/projects?includeArchived=true'
                : 'http://localhost:3001/api/projects';
            const response = await fetch(url);
            const data = await response.json();
            setProjects(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch projects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (projectId) => {
        try {
            await fetch(`http://localhost:3001/api/projects/${projectId}/archive`, {
                method: 'POST'
            });
            fetchProjects(); // Refresh the list
        } catch (err) {
            setError('Failed to archive project');
            console.error(err);
        }
    };

    if (loading) {
        return <div className="project-list loading">Loading projects...</div>;
    }

    if (error) {
        return <div className="project-list error">{error}</div>;
    }

    return (
        <div className="project-list">
            <div className="project-header-controls">
                <h2>Deployed Projects</h2>
                <div className="archive-switch">
                    <button 
                        className={`switch-button ${showArchived ? 'active' : ''}`}
                        onClick={() => setShowArchived(!showArchived)}
                    >
                        {showArchived ? 'Hide Archived' : 'Show Archived'}
                    </button>
                </div>
            </div>
            
            {projects.length === 0 ? (
                <div className="no-projects">
                    No projects deployed yet. Use the "Deploy Contracts" tab to deploy your first project.
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => (
                        <div key={project.id} className="project-card">
                            <div className="project-header">
                                <h3>{project.name}</h3>
                                <button 
                                    className="archive-button"
                                    onClick={() => handleArchive(project.id)}
                                >
                                    Archive
                                </button>
                            </div>
                            
                            <div className="project-info">
                                <p className="repo-url">
                                    <strong>Repository:</strong> 
                                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                        {project.repoUrl}
                                    </a>
                                </p>
                                <p>
                                    <strong>Last Deployment:</strong> 
                                    {new Date(project.lastDeployment).toLocaleString()}
                                </p>
                            </div>

                            <div className="project-contracts">
                                <h4>Deployed Contracts</h4>
                                {project.deployedContracts?.map((contract, index) => (
                                    <div key={index} className="contract-info">
                                        <h5>{contract.name}</h5>
                                        <p className="contract-address">
                                            <strong>Address:</strong> 
                                            <Link to={`/contract/${contract.address}`}>
                                                <code>{contract.address}</code>
                                            </Link>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectList; 