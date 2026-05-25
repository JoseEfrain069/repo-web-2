const { Op } = require('sequelize');
const { User, CreatorProfile, Post, Comment, Donation } = require('../models');

exports.getAllCreators = async (req, res) => {
    const creators = await User.findAll({
        where: { role: 'creator' },
        include: [{ model: CreatorProfile }],
        order: [['username', 'ASC']]
    });
    res.json(creators);
};

exports.getCreatorById = async (req, res) => {
    const creator = await User.findOne({
        where: { id: req.params.id, role: 'creator' },
        include: [{ model: CreatorProfile }]
    });
    if (!creator) return res.status(404).json({ error: 'Creador no encontrado' });
    res.json(creator);
};

exports.saveProfile = async (req, res) => {
    const { displayName, bio, goalTitle, goalDescription } = req.body;
    const profilePic = req.files?.profile_pic?.[0]?.filename || null;
    const banner     = req.files?.banner?.[0]?.filename || null;

    const [profile, created] = await CreatorProfile.findOrCreate({
        where: { user_id: req.user.id },
        defaults: { displayName, bio, profilePic, banner, goalTitle, goalDescription }
    });

    if (!created) {
        profile.displayName     = displayName || profile.displayName;
        profile.bio             = bio;
        profile.goalTitle       = goalTitle;
        profile.goalDescription = goalDescription;
        if (profilePic) profile.profilePic = profilePic;
        if (banner)     profile.banner     = banner;
        await profile.save();
    }

    res.json({ message: 'Perfil guardado' });
};

exports.getMyPosts = async (req, res) => {
    const posts = await Post.findAll({
        where: { creator_id: req.user.id },
        include: [{
            model: Comment,
            include: [{ model: User, as: 'follower', attributes: ['username'] }]
        }],
        order: [['created_at', 'DESC']]
    });
    res.json(posts);
};

exports.createPost = async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'El texto es obligatorio' });
    const image = req.file?.filename || null;
    const post  = await Post.create({ text, image, creatorId: req.user.id });
    res.status(201).json({ message: 'Post creado', id: post.id });
};

exports.getReport = async (req, res) => {
    const { start, end } = req.query;
    const where = { creator_id: req.user.id };
    if (start || end) {
        where.created_at = {};
        if (start) where.created_at[Op.gte] = start;
        if (end)   where.created_at[Op.lte] = end + ' 23:59:59';
    }

    const donations = await Donation.findAll({
        where,
        include: [{ model: User, as: 'follower', attributes: ['username'] }],
        order: [['created_at', 'DESC']]
    });

    const total = donations.reduce((sum, d) => sum + d.flanes, 0);
    res.json({ donations, total_flanes: total });
};
