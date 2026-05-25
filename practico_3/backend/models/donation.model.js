const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Donation = sequelize.define('Donation', {
        flanes:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        followerId: { type: DataTypes.INTEGER, field: 'follower_id' },
        creatorId:  { type: DataTypes.INTEGER, field: 'creator_id' },
        createdAt:  { type: DataTypes.STRING, field: 'created_at' }
    }, {
        tableName: 'donations',
        timestamps: false
    });

    return Donation;
};
