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
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userID'
                }
            },
            ticketID: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'SupportTickets',
                    key: 'ticketID'
                }
            },
            ticketResponse: {
                type: Sequelize.STRING,
                allowNull: false
            },
            responseAttachments: {
                type: Sequelize.TEXT('long'),
                allowNull: true
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