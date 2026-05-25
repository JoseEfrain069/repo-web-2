const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Favorite = sequelize.define('Favorite', {
        followerId: { type: DataTypes.INTEGER, field: 'follower_id', primaryKey: true },
        creatorId:  { type: DataTypes.INTEGER, field: 'creator_id', primaryKey: true }
    }, {
        tableName: 'favorites',
        timestamps: false
    });

    return Favorite;
};
