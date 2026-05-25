const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CreatorProfile = sequelize.define('CreatorProfile', {
        displayName:     { type: DataTypes.STRING, allowNull: false, field: 'display_name' },
        bio:             { type: DataTypes.TEXT },
        profilePic:      { type: DataTypes.STRING, field: 'profile_pic' },
        banner:          { type: DataTypes.STRING },
        goalTitle:       { type: DataTypes.STRING, field: 'goal_title' },
        goalDescription: { type: DataTypes.TEXT, field: 'goal_description' }
    }, {
        tableName: 'creator_profiles',
        timestamps: false
    });

    return CreatorProfile;
};
