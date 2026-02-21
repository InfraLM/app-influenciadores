const { query } = require('../config/database');

const getInfluencers = async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM inf_influencers
      ORDER BY full_name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json({ error: 'Erro ao buscar influenciadores' });
  }
};

const getInfluencer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM inf_influencers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Influenciador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get influencer error:', error);
    res.status(500).json({ error: 'Erro ao buscar influenciador' });
  }
};

const createInfluencer = async (req, res) => {
  try {
    const influencerData = req.body;

    const result = await query(`
      INSERT INTO inf_influencers (
        user_id, full_name, cpf, email, phone, pix_key,
        address_street, address_number, address_complement, address_neighborhood,
        address_city, address_state, address_zip_code, coupon_preference,
        instagram, university, period, is_doctor, years_as_medic,
        generated_coupon, referral_link, contract_url,
        partnership_start_date, partnership_end_date, posting_dates,
        profile_photo_url, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
        NOW(), NOW()
      ) RETURNING *
    `, [
      influencerData.user_id || null,
      influencerData.full_name,
      influencerData.cpf,
      influencerData.email,
      influencerData.phone,
      influencerData.pix_key,
      influencerData.address_street,
      influencerData.address_number,
      influencerData.address_complement || null,
      influencerData.address_neighborhood,
      influencerData.address_city,
      influencerData.address_state,
      influencerData.address_zip_code,
      influencerData.coupon_preference,
      influencerData.instagram || null,
      influencerData.university || null,
      influencerData.period || null,
      influencerData.is_doctor || false,
      influencerData.years_as_medic || null,
      influencerData.generated_coupon || null,
      influencerData.referral_link || null,
      influencerData.contract_url || null,
      influencerData.partnership_start_date || null,
      influencerData.partnership_end_date || null,
      influencerData.posting_dates || null,
      influencerData.profile_photo_url || null,
      influencerData.status || 'active',
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create influencer error:', error);
    res.status(500).json({ error: 'Erro ao criar influenciador' });
  }
};

const updateInfluencer = async (req, res) => {
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
      UPDATE inf_influencers
      SET ${setColumns.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Influenciador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update influencer error:', error);
    res.status(500).json({ error: 'Erro ao atualizar influenciador' });
  }
};

const deleteInfluencer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM inf_influencers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Influenciador não encontrado' });
    }

    res.json({ message: 'Influenciador deletado com sucesso' });
  } catch (error) {
    console.error('Delete influencer error:', error);
    res.status(500).json({ error: 'Erro ao deletar influenciador' });
  }
};

module.exports = {
  getInfluencers,
  getInfluencer,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
};
