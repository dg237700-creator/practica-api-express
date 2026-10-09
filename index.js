require('dotenv').config();
const express = require('express');
const db = require('./config/db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Probar conexión a la base de datos MySQL
db.getConnection()
    .then(conn => {
        console.log("Conectado exitosamente a la base de datos");
        conn.release();
    })
    .catch(err => {
        console.error("Error al conectar a la base de datos:", err);
    });

// ==========================================
// RUTA PRINCIPAL
// ==========================================
app.get("/", (req, res) => {
    res.send("Servidor API REST con MySQL funcionando correctamente");
});

// ==========================================
// 1. GET - OBTENER TODOS LOS PRODUCTOS DE MYSQL
// ==========================================
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener los productos:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// ==========================================
// 2. GET - OBTENER PRODUCTO POR ID
// ==========================================
app.get('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// ==========================================
// 3. POST - CREAR NUEVO PRODUCTO EN MYSQL
// ==========================================
app.post('/api/productos', async (req, res) => {
    const { nombre, precio } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
            [nombre, precio]
        );
        res.status(201).json({
            id: result.insertId,
            nombre,
            precio
        });
    } catch (error) {
        console.error("Error al insertar producto:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// ==========================================
// 4. PUT - ACTUALIZAR PRODUCTO EN MYSQL
// ==========================================
app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
            [nombre, precio, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }
        res.status(200).json({
            mensaje: "Producto actualizado correctamente",
            producto: { id: Number(id), nombre, precio }
        });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// ==========================================
// 5. DELETE - ELIMINAR PRODUCTO DE MYSQL
// ==========================================
app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }
        res.status(200).json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});