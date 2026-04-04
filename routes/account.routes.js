import express from 'express'
const router = express.Router()
import { auth } from '../middleware/auth.middleware.js'
import { createAccount } from '../controllers/account.controller.js'

router.post('/', auth, createAccount)

export default router