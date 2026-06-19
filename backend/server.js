const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const servicesRoutes = require('./routes/servicesRoutes')
const bookingsRoutes = require('./routes/bookingsRoutes')
const adminRoutes = require('./routes/adminRoutes')
const reviewsRoutes = require('./routes/reviewsRoutes')
const stripeRoutes = require('./routes/stripeRoutes')
const profilRoutes = require('./routes/profilRoutes')
const profilPublicRoutes = require('./routes/profilPublicRoutes')
const messagesRoutes = require('./routes/messagesRoutes')
const verificationRoutes = require('./routes/verificationRoutes')
const carteRoutes = require('./routes/carteRoutes')
const statsRoutes = require('./routes/statsRoutes')
const favorisRoutes = require('./routes/favorisRoutes')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/profil', profilRoutes)
app.use('/api/prestataire', profilPublicRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/verification', verificationRoutes)
app.use('/api/carte', carteRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/favoris', favorisRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Serveur marketplace en ligne !' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})