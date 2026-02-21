const { query } = require('../config/database');

const getContents = async (req, res) => {
  try {
    const { month_year, influencer_id } = req.query;

    let queryText = `
      SELECT c.*,
        json_build_object('full_name', i.full_name) as influencer
      FROM inf_contents c
      LEFT JOIN inf_influencers i ON c.influencer_id = i.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (month_year) {
      queryText += ` AND c.month_year = $${paramIndex}`;
      params.push(month_year);
      paramIndex++;
    }

    // If influencer role, filter by their influencer_id
    if (req.user?.role === 'influencer' && req.user.influencerId) {
      queryText += ` AND c.influencer_id = $${paramIndex}`;
      params.push(req.user.influencerId);
      paramIndex++;
    } else if (influencer_id && influencer_id !== 'all') {
      queryText += ` AND c.influencer_id = $${paramIndex}`;
      params.push(influencer_id);
      paramIndex++;
    }

    queryText += ' ORDER BY c.post_date DESC';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get contents error:', error);
    res.status(500).json({ error: 'Erro ao buscar conteúdos' });
  }
};

const createContent = async (req, res) => {
  try {
    const contentData = req.body;

    const result = await query(`
      INSERT INTO inf_contents (
        influencer_id, month_year, type, post_date, product,
        reach, interactions, notes, content_link, proof_url, is_extra,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `, [
      contentData.influencer_id,
      contentData.month_year,
      contentData.type,
      contentData.post_date,
      contentData.product,
      contentData.reach || 0,
      contentData.interactions || 0,
      contentData.notes || null,
      contentData.content_link || null,
      contentData.proof_url || null,
      contentData.is_extra || false,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Erro ao criar conteúdo' });
  }
};

const updateContent = async (req, res) => {
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
      UPDATE inf_contents
      SET ${setColumns.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
};

const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM inf_contents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    res.json({ message: 'Conteúdo deletado com sucesso' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Erro ao deletar conteúdo' });
  }
};

module.exports = {
  getContents,
  createContent,
  updateContent,
  deleteContent,
};
