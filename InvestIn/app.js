const express = require('express')
const Controller = require('./controllers/controllers')
const app = express()
const port = 3000
const session= require('express-session')

app.set('view engine','ejs')

app.use(express.urlencoded({extended:false}))
app.use(session({
    secret:`GATAU`,
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        sameSite:true
    }
}))

app.use("/login", (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/investments");
    } else {
        next();
    }
})

app.use("/register", (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/investments");
    } else {
        next();
    }
})

app.get('/',Controller.home)
app.get('/login',Controller.login)
app.post('/login',Controller.loginPost)
app.get('/register',Controller.register)
app.post('/register',Controller.registerPost)

app.use(function (req, res, next) {
    // console.log(req.session)
    if(!req.session.userId){
        const error = 'Please login first'
        res.redirect(`/login?error=${error}`)
    } else {
        next()
    }
})


const isAdmin = function (req, res, next) {
    if(req.session.email && req.session.role === 'user'){
        const error = 'You dont have permision!! Please login to Admin'
        res.redirect(`/login?error=${error}`)
    } else {
        next()
    }
}
app.use(require("./routes"))

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})

