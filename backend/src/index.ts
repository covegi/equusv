import express from 'express'
import type { Request, Response } from 'express'

const app = express()
app.use(express.json())

const PORT = 3000

app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'ok'})
})

app.listen(PORT, () => {
    console.log(`backend running on port ${PORT}`)
})