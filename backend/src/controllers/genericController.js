const { query } = require('../config/database');

// Generic CRUD controller for simple tables
const createGenericController = (tableName) => {
  return {
    getAll: async (req, res) => {
      try {
        const result = await query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
        res.json(result.rows);
      } catch (error) {
        console.error(`Get ${tableName} error:`, error);
        res.status(500).json({ error: `Erro ao buscar ${tableName}` });
      }
    },

    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const result = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Não encontrado' });
        }

        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Get ${tableName} by id error:`, error);
        res.status(500).json({ error: `Erro ao buscar ${tableName}` });
      }
    },

    create: async (req, res) => {
      try {
        const data = req.body;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        // Add timestamps
        const keysWithTimestamps = [...keys, 'created_at', 'updated_at'];
        const placeholdersWithTimestamps = [...keys.map((_, i) => `$${i + 1}`), 'NOW()', 'NOW()'].join(', ');

        const result = await query(`
          INSERT INTO ${tableName} (${keysWithTimestamps.join(', ')})
          VALUES (${placeholdersWithTimestamps})
          RETURNING *
        `, values);

        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error(`Create ${tableName} error:`, error);
        res.status(500).json({ error: `Erro ao criar ${tableName}` });
      }
    },

    update: async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;

        const setColumns = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updates).forEach((key) => {
          if (key !== 'id' && key !== 'created_at') {
            setColumns.push(`${key} = $${paramIndex}`);
            values.push(updates[key]);
            paramIndex++;
          }
        });

        if (setColumns.length === 0) {
          return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }

        // Always add updated_at
        setColumns.push(`updated_at = NOW()`);
        values.push(id);

        const result = await query(`
          UPDATE ${tableName}
          SET ${setColumns.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `, values);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Não encontrado' });
        }

        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Update ${tableName} error:`, error);
        res.status(500).json({ error: `Erro ao atualizar ${tableName}` });
      }
    },

    delete: async (req, res) => {
      try {
        const { id } = req.params;

        const result = await query(
          `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Não encontrado' });
        }

        res.json({ message: 'Deletado com sucesso' });
      } catch (error) {
        console.error(`Delete ${tableName} error:`, error);
        res.status(500).json({ error: `Erro ao deletar ${tableName}` });
      }
    },
  };
};

module.exports = {
  createGenericController,
};
