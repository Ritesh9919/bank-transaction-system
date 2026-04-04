import express from 'express'
const router = express.Router()
import { auth } from '../middleware/auth.middleware.js'
import { createAccount, getUserAccount, getAccountBalance} from '../controllers/account.controller.js'

router.post('/', auth, createAccount)
router.get('/', auth, getUserAccount)
router.get('/balance/:accountId', auth, getAccountBalance)

export default router