import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js'
import accountRouter from './routes/account.routes.js'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

app.get('/', (req, res)=> {
    res.send("Hello, World")
})

app.use('/api/auth', authRouter)
app.use('/api/account', accountRouter)


export {app}