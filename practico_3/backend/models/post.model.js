const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Post = sequelize.define('Post', {
        text:      { type: DataTypes.TEXT, allowNull: false },
        image:     { type: DataTypes.STRING },
        creatorId: { type: DataTypes.INTEGER, field: 'creator_id' },
        createdAt: { type: DataTypes.STRING, field: 'created_at' }
    }, {
        tableName: 'posts',
        timestamps: false
    });

    return Post;
};
