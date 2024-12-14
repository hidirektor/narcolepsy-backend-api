const ticket_types = require('./ticket_types');
const ticket_status_types = require('./ticket_status_types');

module.exports = (sequelize, Sequelize) => {
    const Tickets = sequelize.define(
        'SupportTickets',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: false
            },
            ticketID: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                unique: true,
                allowNull: false
            },
            ticketType: {
                type: Sequelize.ENUM,
                unique: false,
                values: [ticket_types.SUGGESTION, ticket_types.PROBLEM, ticket_types.APPLY],
                allowNull: false
            },
            ticketTitle: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            ticketDescription: {
                type: Sequelize.STRING,
                unique: false,
                allowNull: false
            },
            comicID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: true
            },
            episodeID: {
                type: Sequelize.UUID,
                unique: false,
                allowNull: true
            },
            ticketStatus: {
                type: Sequelize.ENUM,
                unique: false,
                values: [ticket_status_types.CREATED, ticket_status_types.ANSWERED, ticket_status_types.CUSTOMER_RESPONSE, ticket_status_types.CLOSED],
                allowNull: false
            },
            ticketAttachments: {
                type: Sequelize.TEXT('long'),
                unique: false,
                allowNull: true
            }
        },
        {
            timestamps: false,
            charset: 'utf8',
            collate: 'utf8_general_ci'
        }
    );

    return Tickets;
};