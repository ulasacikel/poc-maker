const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    repoUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deployedContracts: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
            const contracts = this.getDataValue('deployedContracts');
            return contracts ? contracts.map(c => ({
                ...c,
                sourceCode: c.sourceCode || '',
                deployer: c.deployer || ''
            })) : [];
        }
    },
    lastDeployment: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'archived'),
        defaultValue: 'active'
    }
});

module.exports = Project; 