import type { FastifyReply, FastifyRequest } from 'fastify'
import run from '#db'

type PostCourse = {
    code: string
    name: string
}

/**
 * Uploads the given course to storage as a Course object
 * @param req Request object
 * @param res Response object
 * @returns Status code depending on the outcome of the operation
 */
export default async function postCourse(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
        const { code, name } = req.body as PostCourse ?? {}
        const { id: userId } = req.user ?? {}
        if (!code || !name) {
            return res.status(400).send({ error: 'Missing required field (code, name)' })
        }

        const courseResponse = await run(`
            INSERT INTO courses (code, name, notes, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
            RETURNING id
        `, [code.toUpperCase(), name, '', userId, userId])

        if (!courseResponse.rowCount) {
            throw new Error('Failed to create course')
        }

        const id = courseResponse.rows[0].id
        await run(`
                INSERT INTO files (name, content, course_id, created_by, updated_by)
            VALUES ('root', '', $1, $2, $2)    
            ON CONFLICT (name, course_id, parent) DO NOTHING
        `, [id, userId])

        return res.status(201).send({ id })
    } catch (error) {
        return res.status(500).send({ error: (error as Error).message })
    }
}
