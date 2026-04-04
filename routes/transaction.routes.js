import express from 'express'
const router = express.Router()
import {auth, authSystemUser} from '../middleware/auth.middleware.js'
import {createTransaction, createInitialFundsTransaction} from '../controllers/transaction.controller.js'
router.post('/', auth, createTransaction)
router.post('/system/initial-fund', authSystemUser, createInitialFundsTransaction)
export default router