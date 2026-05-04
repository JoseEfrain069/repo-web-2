# Mini Issue Tracker

Proyecto practico de Web II con backend Node.js, JWT, SQLite, Sequelize, Joi y sha1. El frontend esta hecho con React basico y consume solamente esta API.

## Como ejecutar

Backend:

```bash
cd practico2/backend
npm install
copy .env.example .env
npm run dev
```

Frontend:

```bash
cd practico2/frontend
npm install
npm run dev
```

La API usa por defecto `http://localhost:3001`.

## Endpoints principales

- `POST /auth/register`
- `POST /auth/login`
- `GET /proyectos`
- `POST /proyectos`
- `GET /proyectos/:id`
- `PUT /proyectos/:id`
- `POST /proyectos/:id/usuarios`
- `GET /proyectos/:proyectoId/tickets`
- `POST /proyectos/:proyectoId/tickets`
- `GET /tickets/:id`
- `PUT /tickets/:id`
- `PATCH /tickets/:id/estado`
- `DELETE /tickets/:id`

## Reglas importantes

- Solo se ven proyectos donde el usuario pertenece.
- Un ticket empieza en estado `Pendiente`.
- Estados validos: `Pendiente`, `En Progreso`, `Completado`.
- Movimientos validos: Pendiente a En Progreso, En Progreso a Pendiente, En Progreso a Completado, Completado a En Progreso.
- No se puede iniciar un ticket sin responsable.
- El responsable debe ser miembro del proyecto.
