import React, { useEffect, useState } from 'react';
import { apiRequest } from './api';

const ESTADOS = ['Pendiente', 'En Progreso', 'Completado'];

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
    }
}

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(getSavedUser());
    const [authMode, setAuthMode] = useState('login');
    const [authForm, setAuthForm] = useState({ nombre: '', email: '', password: '' });
    const [projects, setProjects] = useState([]);
    const [projectForm, setProjectForm] = useState({ nombre: '', descripcion: '' });
    const [selectedProject, setSelectedProject] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [ticketForm, setTicketForm] = useState({
        titulo: '',
        descripcion: '',
        usuarioAsignadoId: ''
    });
    const [memberEmail, setMemberEmail] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketEditForm, setTicketEditForm] = useState({
        titulo: '',
        descripcion: '',
        usuarioAsignadoId: ''
    });
    const [message, setMessage] = useState('');
    const [view, setView] = useState('list'); //////

    useEffect(() => {
        if (token) {
            loadProjects();
        }
    }, [token]);

    const showError = (error) => {
        setMessage(error.message);
    };

    const saveSession = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        setToken(data.token);
        setUser(data.usuario);
        setMessage('');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setSelectedProject(null);
        setSelectedTicket(null);
        setProjects([]);
        setView('list');
    };

    const handleAuthSubmit = async (event) => {
        event.preventDefault();
        try {
            const path = authMode === 'login' ? '/auth/login' : '/auth/register';
            const body = authMode === 'login'
                ? { email: authForm.email, password: authForm.password }
                : authForm;

            const data = await apiRequest(path, {
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (authMode === 'register') {
                setAuthMode('login');
                setMessage('Usuario registrado. Ahora inicia sesion.');
                return;
            }

            saveSession(data);
        } catch (error) {
            showError(error);
        }
    };

    const loadProjects = async () => {
        try {
            const data = await apiRequest('/proyectos');
            setProjects(data);
        } catch (error) {
            showError(error);
        }
    };

    const createProject = async (event) => {
        event.preventDefault();
        try {
            await apiRequest('/proyectos', {
                method: 'POST',
                body: JSON.stringify(projectForm)
            });
            setProjectForm({ nombre: '', descripcion: '' });
            await loadProjects();
            setMessage('Proyecto creado.');
        } catch (error) {
            showError(error);
        }
    };

    const openProject = async (projectId) => {
        try {
            const project = await apiRequest(`/proyectos/${projectId}`);
            const projectTickets = await apiRequest(`/proyectos/${projectId}/tickets`);
            setSelectedProject(project);
            setTickets(projectTickets);
            setSelectedTicket(null);
            setProjectForm({
                nombre: project.nombre,
                descripcion: project.descripcion
            });
            setView('project');
            setMessage('');
        } catch (error) {
            showError(error);
        }
    };

    const goBackToList = () => {
        setSelectedProject(null);
        setSelectedTicket(null);
        setProjectForm({ nombre: '', descripcion: '' });
        setView('list');
        setMessage('');
    };

    const updateProject = async (event) => {
        event.preventDefault();
        try {
            const project = await apiRequest(`/proyectos/${selectedProject.id}`, {
                method: 'PUT',
                body: JSON.stringify(projectForm)
            });
            setSelectedProject(project);
            await loadProjects();
            setMessage('Proyecto actualizado.');
        } catch (error) {
            showError(error);
        }
    };

    const addMember = async (event) => {
        event.preventDefault();
        try {
            const project = await apiRequest(`/proyectos/${selectedProject.id}/usuarios`, {
                method: 'POST',
                body: JSON.stringify({ email: memberEmail })
            });
            setSelectedProject(project);
            setMemberEmail('');
            setMessage('Usuario agregado al proyecto.');
        } catch (error) {
            showError(error);
        }
    };

    const createTicket = async (event) => {
        event.preventDefault();
        try {
            const body = {
                titulo: ticketForm.titulo,
                descripcion: ticketForm.descripcion,
                usuarioAsignadoId: ticketForm.usuarioAsignadoId
                    ? Number(ticketForm.usuarioAsignadoId)
                    : null
            };
            await apiRequest(`/proyectos/${selectedProject.id}/tickets`, {
                method: 'POST',
                body: JSON.stringify(body)
            });
            setTicketForm({ titulo: '', descripcion: '', usuarioAsignadoId: '' });
            await openProject(selectedProject.id);
            setMessage('Ticket creado.');
        } catch (error) {
            showError(error);
        }
    };

    const openTicket = async (ticketId) => {
        try {
            const ticket = await apiRequest(`/tickets/${ticketId}`);
            setSelectedTicket(ticket);
            setTicketEditForm({
                titulo: ticket.titulo,
                descripcion: ticket.descripcion,
                usuarioAsignadoId: ticket.usuarioAsignadoId || ''
            });
            setView('ticket-detail');
        } catch (error) {
            showError(error);
        }
    };

    const closeTicketDetail = () => {
        setSelectedTicket(null);
        setView('project');
    };

    const updateTicket = async (event) => {
        event.preventDefault();
        try {
            const body = {
                titulo: ticketEditForm.titulo,
                descripcion: ticketEditForm.descripcion,
                usuarioAsignadoId: ticketEditForm.usuarioAsignadoId
                    ? Number(ticketEditForm.usuarioAsignadoId)
                    : null
            };
            const ticket = await apiRequest(`/tickets/${selectedTicket.id}`, {
                method: 'PUT',
                body: JSON.stringify(body)
            });
            await openProject(selectedProject.id);
            setSelectedTicket(ticket);
            setTicketEditForm({
                titulo: ticket.titulo,
                descripcion: ticket.descripcion,
                usuarioAsignadoId: ticket.usuarioAsignadoId || ''
            });
            setView('ticket-detail');
            setMessage('Ticket actualizado.');
        } catch (error) {
            showError(error);
        }
    };

    const changeStatus = async (ticket, estado) => {
        try {
            await apiRequest(`/tickets/${ticket.id}/estado`, {
                method: 'PATCH',
                body: JSON.stringify({ estado })
            });
            await openProject(selectedProject.id);
            setMessage('Estado actualizado.');
        } catch (error) {
            showError(error);
        }
    };

    const deleteTicket = async () => {
        try {
            await apiRequest(`/tickets/${selectedTicket.id}`, {
                method: 'DELETE'
            });
            setSelectedTicket(null);
            await openProject(selectedProject.id);
            setView('project');
            setMessage('Ticket eliminado.');
        } catch (error) {
            showError(error);
        }
    };

    const members = selectedProject?.Usuarios || selectedProject?.usuarios || [];

    // Pantalla de login/registro
    if (!token) {
        return (
            <main className="auth-page">
                <section className="auth-box">
                    <h1>Mini Issue Tracker</h1>
                    <div className="tabs">
                        <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                            Login
                        </button>
                        <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
                            Registro
                        </button>
                    </div>
                    <form onSubmit={handleAuthSubmit}>
                        {authMode === 'register' && (
                            <input
                                placeholder="Nombre"
                                value={authForm.nombre}
                                onChange={(e) => setAuthForm({ ...authForm, nombre: e.target.value })}
                            />
                        )}
                        <input
                            placeholder="Email"
                            type="email"
                            value={authForm.email}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        />
                        <input
                            placeholder="Password"
                            type="password"
                            value={authForm.password}
                            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        />
                        <button type="submit">
                            {authMode === 'login' ? 'Entrar' : 'Registrar'}
                        </button>
                    </form>
                    {message && <p className="message">{message}</p>}
                </section>
            </main>
        );
    }

    return (
        <main>
            <header className="topbar">
                <div>
                    <h1>Mini Issue Tracker</h1>
                    <p>{user?.nombre} - {user?.email}</p>
                </div>
                <button onClick={logout}>Salir</button>
            </header>

            {message && <p className="message">{message}</p>}

            {/* Vista: Listado de proyectos */}
            {view === 'list' && (
                <section className="layout">
                    <div className="panel">
                        <h2>Mis proyectos</h2>
                        {projects.length === 0 && <p>No tienes proyectos aun.</p>}
                        {projects.map((project) => (
                            <button
                                className="list-button"
                                key={project.id}
                                onClick={() => openProject(project.id)}
                            >
                                {project.nombre}
                            </button>
                        ))}
                    </div>

                    <div className="panel">
                        <h2>Crear proyecto</h2>
                        <form onSubmit={createProject}>
                            <input
                                placeholder="Nombre"
                                value={projectForm.nombre}
                                onChange={(e) => setProjectForm({ ...projectForm, nombre: e.target.value })}
                            />
                            <textarea
                                placeholder="Descripcion"
                                value={projectForm.descripcion}
                                onChange={(e) => setProjectForm({ ...projectForm, descripcion: e.target.value })}
                            />
                            <button type="submit">Crear</button>
                        </form>
                    </div>
                </section>
            )}

            {/* Vista: Detalle de proyecto con tablero */}
            {view === 'project' && selectedProject && (
                <>
                    <section className="project-header">
                        <button onClick={goBackToList}>Volver</button>
                        <div>
                            <h2>{selectedProject.nombre}</h2>
                            <p>{selectedProject.descripcion}</p>
                            <small>Creado: {new Date(selectedProject.fechaCreacion).toLocaleDateString()}</small>
                        </div>
                    </section>

                    <section className="layout">
                        <div className="panel">
                            <h3>Editar proyecto</h3>
                            <form onSubmit={updateProject}>
                                <input
                                    value={projectForm.nombre}
                                    onChange={(e) => setProjectForm({ ...projectForm, nombre: e.target.value })}
                                />
                                <textarea
                                    value={projectForm.descripcion}
                                    onChange={(e) => setProjectForm({ ...projectForm, descripcion: e.target.value })}
                                />
                                <button type="submit">Guardar</button>
                            </form>
                        </div>

                        <div className="panel">
                            <h3>Usuarios del proyecto</h3>
                            {members.map((member) => (
                                <p key={member.id}>{member.nombre} - {member.email}</p>
                            ))}
                            <form onSubmit={addMember}>
                                <input
                                    placeholder="Email del usuario"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                />
                                <button type="submit">Agregar</button>
                            </form>
                        </div>

                        <div className="panel">
                            <h3>Nuevo ticket</h3>
                            <form onSubmit={createTicket}>
                                <input
                                    placeholder="Titulo"
                                    value={ticketForm.titulo}
                                    onChange={(e) => setTicketForm({ ...ticketForm, titulo: e.target.value })}
                                />
                                <textarea
                                    placeholder="Descripcion"
                                    value={ticketForm.descripcion}
                                    onChange={(e) => setTicketForm({ ...ticketForm, descripcion: e.target.value })}
                                />
                                <select
                                    value={ticketForm.usuarioAsignadoId}
                                    onChange={(e) => setTicketForm({ ...ticketForm, usuarioAsignadoId: e.target.value })}
                                >
                                    <option value="">Sin responsable</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>{member.nombre}</option>
                                    ))}
                                </select>
                                <button type="submit">Crear ticket</button>
                            </form>
                        </div>
                    </section>

                    {/* Tablero de trabajo */}
                    <section className="board">
                        {ESTADOS.map((estado) => (
                            <div className="column" key={estado}>
                                <h3>{estado}</h3>
                                {tickets
                                    .filter((ticket) => ticket.estado === estado)
                                    .map((ticket) => (
                                        <article className="ticket" key={ticket.id}>
                                            <h4>{ticket.titulo}</h4>
                                            <p>{ticket.descripcion}</p>
                                            <small>
                                                Responsable: {ticket.usuarioAsignado?.nombre || 'Sin asignar'}
                                            </small>
                                            <div className="actions">
                                                <button onClick={() => openTicket(ticket.id)}>Detalle</button>
                                                {estado === 'Pendiente' && (
                                                    <button onClick={() => changeStatus(ticket, 'En Progreso')}>Iniciar</button>
                                                )}
                                                {estado === 'En Progreso' && (
                                                    <>
                                                        <button onClick={() => changeStatus(ticket, 'Pendiente')}>Devolver</button>
                                                        <button onClick={() => changeStatus(ticket, 'Completado')}>Completar</button>
                                                    </>
                                                )}
                                                {estado === 'Completado' && (
                                                    <button onClick={() => changeStatus(ticket, 'En Progreso')}>Reabrir</button>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                            </div>
                        ))}
                    </section>
                </>
            )}

            {/* Vista: Detalle de un ticket */}
            {view === 'ticket-detail' && selectedTicket && (
                <section className="panel detail">
                    <button onClick={closeTicketDetail}>Volver al tablero</button>
                    <h3>Ticket #{selectedTicket.id}</h3>
                    <div className="ticket-info">
                        <p><strong>Estado:</strong> {selectedTicket.estado}</p>
                        <p><strong>Responsable:</strong> {selectedTicket.usuarioAsignado?.nombre || 'Sin asignar'}</p>
                        <p><strong>Creado:</strong> {new Date(selectedTicket.fechaCreacion).toLocaleDateString()}</p>
                    </div>

                    <h4>Editar ticket</h4>
                    <form onSubmit={updateTicket}>
                        <input
                            placeholder="Titulo"
                            value={ticketEditForm.titulo}
                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, titulo: e.target.value })}
                        />
                        <textarea
                            placeholder="Descripcion"
                            value={ticketEditForm.descripcion}
                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, descripcion: e.target.value })}
                        />
                        <select
                            value={ticketEditForm.usuarioAsignadoId}
                            onChange={(e) => setTicketEditForm({ ...ticketEditForm, usuarioAsignadoId: e.target.value })}
                        >
                            <option value="">Sin responsable</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>{member.nombre}</option>
                            ))}
                        </select>
                        <div className="actions">
                            <button type="submit">Guardar ticket</button>
                            <button type="button" className="danger" onClick={deleteTicket}>
                                Eliminar ticket
                            </button>
                            <button type="button" onClick={closeTicketDetail}>
                                Cerrar
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </main>
    );
}

export default App;
