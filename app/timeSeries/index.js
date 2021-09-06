import Router from 'express'
import validator from 'express-validator'
import validationMustBe from '../middleware/validationMustBe.js'
import { Query, knex } from '../dbProvider.js'

const router = Router()
const { query } = validator;

router.get('/battles',
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


router.get('/battleEvents',
    query('battleid').isUUID(),
    validationMustBe,
    async (req, res) => {
        const battleId = req.query.battleid

        const onBattleStarat = knex.from('Event_OnBattleStart').where('id', '=', battleId).orderBy('dateTime', 'desc').distinct('*')
        const onShot = knex.from('Event_OnShot').where('onBattleStart_id', '=', battleId).orderBy('dateTime', 'desc').distinct('*')
        const onBattleResult = knex.from('Event_OnBattleResult').where('onBattleStart_id', '=', battleId).orderBy('dateTime', 'desc').distinct('*')

        const result = await Promise.all([
            onBattleStarat,
            onShot,
            onBattleResult
        ].map(t => Query(t)))

        res.json({
            onBattleStarat: result[0],
            onShot: result[1],
            onBattleResult: result[2]
        })
    })

export default router
