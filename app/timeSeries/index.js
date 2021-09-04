import Router from 'express'
import validator from 'express-validator'
import validationMustBe from '../middleware/validationMustBe.js'
import { Query, knex } from '../dbProvider.js'

const router = Router()
const { query } = validator;

router.get('/load',
    query('limit').isInt({ min: 0, max: 100 }).toInt().optional(),
    validationMustBe,
    async (req, res) => {

        const limit = req.query.limit || 30;

        const start = knex
            .from('Event_OnBattleStart')
            .orderBy('dateTime', 'desc')
            .limit(limit)

        const result = knex
            .distinct('*')
            .from('Event_OnBattleResult')
            .where('onBattleStart_id', 'in', start.clone().select('id'))
            .orderBy('dateTime', 'desc')
            .as('result')

        const r = await Query(
            knex.select('*')
                .from(start.distinct('*').as('start'))
                .leftJoin(result, { 'start.id': 'result.onBattleStart_id' }))
        res.json(r)
    })

export default router