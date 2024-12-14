const ticket_types = require('./ticket_types');
const ticket_status_types = require('./ticket_status_types');

module.exports = (sequelize, Sequelize) => {
    const TicketResponses = sequelize.define(
        'SupportTicketResponses',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            responseID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            userID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: false
            },
            ticketID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: false
            },
            ticketResponse: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            responseAttachments: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return TicketResponses;
};