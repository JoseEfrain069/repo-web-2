const proyectoService = require('../services/proyecto.service');

exports.getProjects = async (req, res) => {
    const proyectos = await proyectoService.getProjectsByUser(req.user.id);
    res.json(proyectos);
};

exports.createProject = async (req, res) => {
    const proyecto = await proyectoService.createProject(req.user.id, req.body);
    res.status(201).json(proyecto);
};

exports.getProjectById = async (req, res) => {
    const proyecto = await proyectoService.getProjectForUser(req.user.id, req.params.id);
    res.json(proyecto);
};

exports.updateProject = async (req, res) => {
    const proyecto = await proyectoService.updateProject(req.user.id, req.params.id, req.body);
    res.json(proyecto);
};

exports.addUserToProject = async (req, res) => {
    const proyecto = await proyectoService.addUserToProject(
        req.user.id,
        req.params.id,
        req.body.email
    );
    res.json(proyecto);
};
