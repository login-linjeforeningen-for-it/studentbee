import type { FastifyReply, FastifyRequest } from 'fastify'
import checkToken from './validateToken.ts'
import run from '#db'

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string
            name: string
            email: string
        }
    }
}

type UpdateUserProps = {
    id: string
    email: string
    name: string
}

export default async function authMiddleware(req: FastifyRequest, res: FastifyReply) {
    const tokenResult = await checkToken(req, res)
    if (!tokenResult.valid || !tokenResult.userInfo) {
        return res.status(401).send({ error: tokenResult.error })
    }

    req.user = {
        id: tokenResult.userInfo.sub,
        email: tokenResult.userInfo.email,
        name: tokenResult.userInfo.name
    }

    userHandler({
        id: tokenResult.userInfo.sub,
        email: tokenResult.userInfo.email,
        name: tokenResult.userInfo.name,
    })
}

async function userHandler({ id, email, name }: UpdateUserProps) {
    const result = await run(`
        INSERT INTO USERS (user_id, email, name) 
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
        RETURNING user_id
    `, [id, email, name])

    if (!result.rowCount) {
        console.error('Error when inserting updating user in authMiddleware')
        console.log(`Values: id: ${id}, email: ${email}, name: ${name}`)
        console.log(`Details: ${result}`)
    }
}
