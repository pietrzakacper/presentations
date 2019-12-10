const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

app.use(express.static(__dirname + '/static'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.set('view engine', 'ejs')

const ADMIN_PASSWORD = 'admin123'
const MY_SECRET_SESSION_TOKEN = 'secret123'

// csrf token should be cryptographically safe and unique per session
const csrfTokens = {
    [MY_SECRET_SESSION_TOKEN]: 'MY_SECRET_CSRF_TOKEN'
}

app.use((req, res, next) => {
    if(req.method !== 'POST') {
        return next()
    }

    const sessionToken = req.cookies['my-session-token']
    if(!sessionToken) {
        return next()
    }

    if(req.body.csrfToken !== csrfTokens[sessionToken]) {
        return res.sendStatus(401)
    }

    next()
})

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
    const sessionToken = req.cookies['my-session-token']
    const loggedIn =  sessionToken === MY_SECRET_SESSION_TOKEN
    res.render('blog', { blogEntries, loggedIn, CSRF_TOKEN: csrfTokens[sessionToken] })
})

const IP = '10.0.0.1'
const PORT = 3000
app.listen(PORT, IP, () => console.log(`App is listening on ${IP}:${PORT}`))