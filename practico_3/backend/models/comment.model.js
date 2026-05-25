const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Comment = sequelize.define('Comment', {
        text:       { type: DataTypes.TEXT, allowNull: false },
        postId:     { type: DataTypes.INTEGER, field: 'post_id' },
        followerId: { type: DataTypes.INTEGER, field: 'follower_id' },
        createdAt:  { type: DataTypes.STRING, field: 'created_at' }
    }, {
        tableName: 'comments',
        timestamps: false
    });

    return Comment;
};
