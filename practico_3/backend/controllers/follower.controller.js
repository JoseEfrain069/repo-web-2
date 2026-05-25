const { Op } = require('sequelize');
const { User, CreatorProfile, Post, Donation, Comment, Favorite } = require('../models');

exports.searchCreators = async (req, res) => {
    const q = req.query.q || '';
    const creators = await User.findAll({
        where: { role: 'creator' },
        include: [{ model: CreatorProfile, attributes: ['displayName', 'profilePic'] }],
        order: [['username', 'ASC']]
    });
    const filtered = creators.filter(c => {
        const name = c.CreatorProfile?.displayName || c.username;
        return name.toLowerCase().includes(q.toLowerCase());
    });
    res.json(filtered);
};

exports.donate = async (req, res) => {
    const { creator_id, flanes } = req.body;
    if (!creator_id || !flanes || flanes < 1)
        return res.status(400).json({ error: 'Datos invalidos' });

    const creator = await User.findOne({ where: { id: creator_id, role: 'creator' } });
    if (!creator) return res.status(404).json({ error: 'Creador no encontrado' });

    await Donation.create({ followerId: req.user.id, creatorId: creator_id, flanes });
    res.json({ message: `Donaste ${flanes} flan(es) exitosamente` });
};

exports.getCreatorPosts = async (req, res) => {
    const donated = await Donation.findOne({
        where: { follower_id: req.user.id, creator_id: req.params.id }
    });
    if (!donated) return res.status(403).json({ error: 'Debes donar antes de ver las publicaciones' });

    const posts = await Post.findAll({
        where: { creator_id: req.params.id },
        order: [['created_at', 'DESC']]
    });
    res.json(posts);
};

exports.addComment = async (req, res) => {
    const { post_id, text } = req.body;
    if (!post_id || !text) return res.status(400).json({ error: 'Faltan datos' });

    const post = await Post.findByPk(post_id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });

    const donated = await Donation.findOne({
        where: { follower_id: req.user.id, creator_id: post.creatorId }
    });
    if (!donated) return res.status(403).json({ error: 'Debes donar antes de comentar' });

    await Comment.create({ postId: post_id, followerId: req.user.id, text });
    res.json({ message: 'Comentario enviado' });
};

exports.toggleFavorite = async (req, res) => {
    const existing = await Favorite.findOne({
        where: { follower_id: req.user.id, creator_id: req.params.creatorId }
    });
    if (existing) {
        await existing.destroy();
        return res.json({ message: 'Eliminado de favoritos', favorited: false });
    }
    await Favorite.create({ followerId: req.user.id, creatorId: req.params.creatorId });
    res.json({ message: 'Agregado a favoritos', favorited: true });
};

exports.getFavorites = async (req, res) => {
    const favs = await Favorite.findAll({
        where: { follower_id: req.user.id },
        include: [{
            model: User, as: 'creatorUser',
            attributes: ['id', 'username'],
            include: [{ model: CreatorProfile, attributes: ['displayName', 'profilePic'] }]
        }]
    });
    res.json(favs);
};

exports.getFeed = async (req, res) => {
    const donations = await Donation.findAll({
        where: { follower_id: req.user.id },
        attributes: ['creatorId']
    });
    const creatorIds = [...new Set(donations.map(d => d.creatorId))];

    if (creatorIds.length === 0) return res.json([]);

    const posts = await Post.findAll({
        where: { creator_id: { [Op.in]: creatorIds } },
        include: [{
            model: User, as: 'creator',
            attributes: ['username'],
            include: [{ model: CreatorProfile, attributes: ['displayName', 'profilePic'] }]
        }],
        order: [['created_at', 'DESC']]
    });
    res.json(posts);
};

exports.getDonationHistory = async (req, res) => {
    const { start, end, creator_name } = req.query;
    const where = { follower_id: req.user.id };
    if (start || end) {
        where.created_at = {};
        if (start) where.created_at[Op.gte] = start;
        if (end)   where.created_at[Op.lte] = end + ' 23:59:59';
    }

    const donations = await Donation.findAll({
        where,
        include: [{
            model: User, as: 'creatorUser',
            attributes: ['username'],
            include: [{ model: CreatorProfile, attributes: ['displayName'] }]
        }],
        order: [['created_at', 'DESC']]
    });

    const filtered = creator_name
        ? donations.filter(d => {
            const name = d.creatorUser?.CreatorProfile?.displayName || d.creatorUser?.username || '';
            return name.toLowerCase().includes(creator_name.toLowerCase());
        })
        : donations;

    res.json(filtered);
};
