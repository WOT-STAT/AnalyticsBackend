import express from 'express'
import cors from 'cors'
import config from 'config'

import status from './status/index.js'

const app = express()

app.use(express.json())
app.use(cors());
app.options('*', cors());

app.use('/api/analytics/', status)

async function Start() {
    const port = config.get('appPort') || 5000
    try {
        app.listen(port, () => {
            console.log(`App listening at http://localhost:${port}/api/analytics`)
        })
    }
    catch (e) {
        console.error(`Server error: ${e.message}`)
        process.exit(1)
    }
}

Start()