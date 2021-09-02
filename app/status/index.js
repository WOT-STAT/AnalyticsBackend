import Router from 'express'

const router = Router()

router.get('/status', (req, res) => {
    res.json(
        {
            status: 'work',
            env: process.env.NODE_ENV
        }
    )
})

export default router