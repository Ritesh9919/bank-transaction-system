import express from 'express'
const router = express.Router()
import { auth } from '../middleware/auth.middleware.js'
import { createAccount, getUserAccount} from '../controllers/account.controller.js'

router.post('/', auth, createAccount)
router.get('/', auth, getUserAccount)

export default router