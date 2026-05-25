const { sequelize } = require('../config/db.config');

const User           = require('./user.model')(sequelize);
const CreatorProfile = require('./creatorProfile.model')(sequelize);
const Post           = require('./post.model')(sequelize);
const Donation       = require('./donation.model')(sequelize);
const Comment        = require('./comment.model')(sequelize);
const Favorite       = require('./favorite.model')(sequelize);

// Un creador tiene un perfil
User.hasOne(CreatorProfile, { foreignKey: 'user_id' });
CreatorProfile.belongsTo(User, { foreignKey: 'user_id' });

// Un creador tiene muchos posts
User.hasMany(Post, { foreignKey: 'creator_id' });
Post.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });

// Donaciones: seguidor -> creador
User.hasMany(Donation, { as: 'donationsGiven',    foreignKey: 'follower_id' });
User.hasMany(Donation, { as: 'donationsReceived', foreignKey: 'creator_id' });
Donation.belongsTo(User, { as: 'follower',     foreignKey: 'follower_id' });
Donation.belongsTo(User, { as: 'creatorUser',  foreignKey: 'creator_id' });

// Comentarios: post -> comentario <- seguidor
Post.hasMany(Comment, { foreignKey: 'post_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(Comment, { foreignKey: 'follower_id' });
Comment.belongsTo(User, { as: 'follower', foreignKey: 'follower_id' });

// Favoritos: seguidor <-> creador
User.hasMany(Favorite, { as: 'favoritesGiven',    foreignKey: 'follower_id' });
User.hasMany(Favorite, { as: 'favoritesReceived', foreignKey: 'creator_id' });
Favorite.belongsTo(User, { as: 'follower',    foreignKey: 'follower_id' });
Favorite.belongsTo(User, { as: 'creatorUser', foreignKey: 'creator_id' });

module.exports = { sequelize, User, CreatorProfile, Post, Donation, Comment, Favorite };
