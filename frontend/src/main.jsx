import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import BlockchainStatus from './components/BlockchainStatus'
import AnvilControls from './components/AnvilControls'
import ContractUploader from './components/ContractUploader'
import ProjectList from './components/ProjectList'
import ContractDetails from './components/ContractDetails'
import './index.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <BlockchainStatus />,
                loader: async () => {
                    const response = await fetch('http://localhost:3001/api/blockchain-status');
                    if (!response.ok) {
                        throw new Error('Failed to fetch blockchain status');
                    }
                    return response.json();
                }
            },
            {
                path: '/blockchain',
                element: <BlockchainStatus />
            },
            {
                path: '/anvil',
                element: <AnvilControls />
            },
            {
                path: '/deploy',
                element: <ContractUploader />
            },
            {
                path: '/projects',
                element: <ProjectList />
            },
            {
                path: '/contract/:address',
                element: <ContractDetails />
            }
        ]
    }
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
) 