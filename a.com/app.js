const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.static(__dirname + '/static'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.set('view engine', 'ejs')

const OWN_ORIGIN = 'http://a.com:3000'
app.use((req, res, next) => {
    const origin = req.get('Origin')
    console.log(`${req.path} ${req.method}| Origin: ${origin}`)

    if(req.method !== 'POST') {
        return next()
    }

    if(origin === undefined) {
        // possibly old browser
        return res.sendStatus(401)
    }

    if(origin === null) {
        // some privacy related context
        return res.sendStatus(401)
    }

    if(origin !== OWN_ORIGIN) {
        // attack attempt
        return res.sendStatus(401)
    }

    next()
})

const ADMIN_PASSWORD = 'admin123'
const MY_SECRET_SESSION_TOKEN = 'secret123'

const blogEntries = []

app.post('/api/login', (req, res) => {
    if(req.body.username === 'admin' && req.body.password === ADMIN_PASSWORD) {
        res.cookie('my-session-token', MY_SECRET_SESSION_TOKEN)
        return res.redirect(303, '/blog')
    }

    res.sendStatus(401)
})

app.post('/api/addBlogEntry', (req, res) => {
    if(req.cookies['my-session-token'] === MY_SECRET_SESSION_TOKEN) {
        blogEntries.unshift(req.body.blogEntry)
        return res.redirect(303, '/blog')
    }

    res.sendStatus(401)
})

app.get('/blog', (req, res) => {
    const loggedIn = req.cookies['my-session-token'] === MY_SECRET_SESSION_TOKEN
    res.render('blog', { blogEntries, loggedIn })
})

const IP = '10.0.0.1'
const PORT = 3000
app.listen(PORT, IP, () => console.log(`App is listening on ${IP}:${PORT}`))