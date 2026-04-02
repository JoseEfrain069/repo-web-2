# Practico 1 - Sistema de Gestion de Reservas para Canchas Deportivas

Aplicacion web monolitica hecha con Node.js, Express, EJS, Sequelize y SQLite, manteniendo un nivel simple parecido al avance visto en `appnode`.

## Tecnologias

- Node.js
- Express
- body-parser
- EJS
- Sequelize
- SQLite
- sha1
- Bootstrap 5

## Como ejecutar

1. Abrir una terminal en la carpeta `practico-1`
2. Ejecutar `npm install`
3. Ejecutar `npm run dev`
4. Abrir `http://localhost:3000`

## Usuario admin inicial

- Email: `admin@admin.com`
- Contrasena: `admin1234`

## Funcionalidades implementadas

- Registro e inicio de sesion
- Proteccion de rutas por rol
- Listado de canchas activas
- Consulta de disponibilidad por fecha
- Crear y cancelar reservas
- Historial de reservas
- Crear resenas luego de que la reserva haya terminado
- CRUD de tipos de cancha
- CRUD de canchas
- Alta y baja de horarios
- Ver y cambiar estado de reservas
- Ver resenas de canchas

## Base de datos

Se usa SQLite con el archivo `database.sqlite`, para mantener el proyecto simple y facil de defender oralmente.
