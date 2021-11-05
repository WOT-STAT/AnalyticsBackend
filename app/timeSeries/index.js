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

        const onBattleStart = knex.from('Event_OnBattleStart').where('id', '=', battleId).orderBy('dateTime', 'desc').distinct('*')
        const onShot = knex.from('Event_OnShot').where('onBattleStart_id', '=', battleId).orderBy('dateTime', 'desc').distinct('*')
        const onBattleResult = knex.from('Event_OnBattleResult').where('onBattleStart_id', '=', battleId).orderBy('dateTime', 'desc').distinct('*')

        const result = await Promise.all([
            onBattleStart,
            onShot,
            onBattleResult
        ].map(t => Query(t)))

        res.json({
            onBattleStart: result[0],
            onShot: result[1].map(shot => ({
                ...shot,
                results: shot['results.order'].map((order, i) => ({
                    order,
                    ammoBayDestroyed: shot['results.ammoBayDestroyed'][i],
                    fireDamage: shot['results.fireDamage'][i],
                    fireHealth: shot['results.fireHealth'][i],
                    flags: shot['results.flags'][i],
                    shotDamage: shot['results.shotDamage'][i],
                    shotHealth: shot['results.shotHealth'][i],
                    tankTag: shot['results.tankTag'][i],
                }))
            })),
            onBattleResult: result[2]
        })
    })

export default router
