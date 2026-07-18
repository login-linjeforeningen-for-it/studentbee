import type { FastifyReply, FastifyRequest } from 'fastify'
import run from '#db'

type PutTimeProps = {
    duration: number
}

export default async function putUserTime(req: FastifyRequest, res: FastifyReply) {
    try {
        const { duration } = req.body as PutTimeProps ?? {}
        if (typeof duration !== 'number' || duration <= 0 || duration > 2 * 60 * 1000) {
            return res.status(400).send({ error: 'Invalid duration provided' })
        }

        const userId = req.user!.id

        const lastUpdateResult = await run(
            'SELECT last_time_update FROM users WHERE user_id = $1',
            [userId]
        )
        if (lastUpdateResult.rowCount === 0) {
            return res.status(404).send({ error: 'User not found' })
        }
        const lastUpdate = lastUpdateResult.rows[0].last_time_update
        const now = new Date()
        const timeDiff = now.getTime() - new Date(lastUpdate).getTime()
        if (timeDiff <= 2 * 60 * 1000) {
            return res.status(429).send({ error: 'Time updates are limited to every 2 minutes' })
        }

        const result = await run(`
            UPDATE users
            SET time = time + $1, last_time_update = NOW(), updated_at = NOW()
            WHERE user_id = $2
            RETURNING user_id AS "userId"
        `, [Math.floor(duration / 1000), userId])

        if (result.rowCount === 0) {
            return res.status(404).send({ error: 'User not found' })
        }

        return res.status(200).send({ id: result.rows[0].userId })
    } catch (error) {
        console.error('Error updating user time:', error)
        return res.status(500).send({ error: (error as Error).message })
    }
}
