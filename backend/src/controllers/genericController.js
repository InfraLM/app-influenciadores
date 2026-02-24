const { query } = require('../config/database');

// Generic CRUD controller for simple tables
const createGenericController = (tableName, options = {}) => {
  return {
    getAll: async (req, res) => {
      try {
        // Support query parameters for filtering
        const filters = req.query;
        let queryText = `SELECT * FROM ${tableName}`;
        const values = [];

        // Build WHERE clause if filters are provided
        if (Object.keys(filters).length > 0) {
          const conditions = [];
          let paramIndex = 1;

          Object.keys(filters).forEach(key => {
            // Skip pagination, ordering, and Vercel-specific params
            if (['limit', 'offset', 'order', 'path'].includes(key)) return;

            // Support __in suffix for IN queries (e.g. month_year__in=2026-01,2026-02)
            if (key.endsWith('__in')) {
              const column = key.replace('__in', '');
              const inValues = filters[key].split(',');
              const placeholders = inValues.map((_, i) => `$${paramIndex + i}`).join(', ');
              conditions.push(`${column} IN (${placeholders})`);
              inValues.forEach((v) => values.push(v));
              paramIndex += inValues.length;
            } else {
              conditions.push(`${key} = $${paramIndex}`);
              values.push(filters[key]);
              paramIndex++;
            }
          });

          if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(' AND ')}`;
          }
        }

        // Add ordering (support multiple order params as array or single string)
        if (filters.order) {
          const orders = Array.isArray(filters.order) ? filters.order : [filters.order];
          const orderClauses = orders.map(o => {
            const [column, direction] = o.split(':');
            return `${column} ${direction === 'asc' ? 'ASC' : 'DESC'}`;
          });
          queryText += ` ORDER BY ${orderClauses.join(', ')}`;
        } else if (options.defaultOrder !== null) {
          queryText += ` ORDER BY ${options.defaultOrder || 'created_at DESC'}`;
        }

        // Add limit if provided
        if (filters.limit) {
          queryText += ` LIMIT ${parseInt(filters.limit)}`;
        }

        const result = await query(queryText, values);
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

    upsert: async (req, res) => {
      try {
        const { data, onConflict } = req.body;
        const keys = Object.keys(data);
        const vals = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const keysWithTs = [...keys, 'created_at', 'updated_at'];
        const phWithTs = [...keys.map((_, i) => `$${i + 1}`), 'NOW()', 'NOW()'].join(', ');

        const updateSet = keys
          .filter(k => k !== 'id' && k !== 'created_at')
          .map(k => `${k} = EXCLUDED.${k}`)
          .join(', ');

        updateSet && (updateSet + `, updated_at = NOW()`);

        const conflictColumns = onConflict || 'id';
        const updateCols = keys
          .filter(k => k !== 'id' && k !== 'created_at')
          .map(k => `${k} = EXCLUDED.${k}`)
          .concat('updated_at = NOW()')
          .join(', ');

        const result = await query(`
          INSERT INTO ${tableName} (${keysWithTs.join(', ')})
          VALUES (${phWithTs})
          ON CONFLICT (${conflictColumns}) DO UPDATE SET ${updateCols}
          RETURNING *
        `, vals);

        res.json(result.rows[0]);
      } catch (error) {
        console.error(`Upsert ${tableName} error:`, error);
        res.status(500).json({ error: `Erro ao salvar ${tableName}` });
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
