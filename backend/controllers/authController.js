const supabase = require('../config/supabase')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const genererCodeParrainage = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const inscription = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, telephone, code_parrain } = req.body

    const { data: existant } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existant) {
      return res.status(400).json({ message: 'Email déjà utilisé' })
    }

    const hash = await bcrypt.hash(mot_de_passe, 10)

    let parraine_par = null
    if (code_parrain) {
      const { data: parrain } = await supabase
        .from('users')
        .select('id')
        .eq('code_parrainage', code_parrain.toUpperCase().trim())
        .single()

      if (parrain) {
        parraine_par = parrain.id
      }
    }

    let codeUnique = genererCodeParrainage()
    let codeExiste = true
    while (codeExiste) {
      const { data: verif } = await supabase
        .from('users')
        .select('id')
        .eq('code_parrainage', codeUnique)
        .single()
      if (!verif) {
        codeExiste = false
      } else {
        codeUnique = genererCodeParrainage()
      }
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ nom, prenom, email, mot_de_passe: hash, role, telephone, code_parrainage: codeUnique, parraine_par }])
      .select()

    if (error) throw error

    const token = jwt.sign(
      { id: data[0].id, role: data[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ message: 'Compte créé avec succès', token, user: data[0] })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const connexion = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    }

    const valide = await bcrypt.compare(mot_de_passe, user.mot_de_passe)
    if (!valide) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ message: 'Connexion réussie', token, user })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { inscription, connexion }