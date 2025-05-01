import express from 'express'
import { getAllPackages } from '../controllers/package.controller.js'

const router = express.Router()

router.get('/', getAllPackages)

export default router
