import type { FastifyReply, FastifyRequest } from 'fastify'
import run from '#db'

type ImportCard = {
    question: string
    alternatives: string[]
    correct: string[]
    theme?: string
    source?: string
}

type ImportCourse = {
    id: string
    text?: string
    cards: ImportCard[]
}

export default async function bulkImport(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
        const courses = req.body as ImportCourse[]
        const userId = req.user?.id ?? null

        if (!Array.isArray(courses)) {
            return res.status(400).send({ error: 'Body must be an array of courses' })
        }

        const results: {
            course: string
            imported: boolean
            cardsInserted: number
            error?: string
        }[] = []

        for (const course of courses) {
            try {
                if (!course.id || !Array.isArray(course.cards)) {
                    throw new Error('Invalid course structure')
                }

                const notes = typeof course.text === 'string' ? course.text : ''

                const courseResult = await run(`
                    INSERT INTO courses (code, name, notes, created_by, updated_by)
                    VALUES ($1, $2, $3, $4, $4)
                    ON CONFLICT (code)
                    DO UPDATE SET
                        notes = EXCLUDED.notes,
                        learning_based = EXCLUDED.learning_based,
                        updated_at = NOW(),
                        updated_by = $4
                    RETURNING id
                `, [
                    course.id.toUpperCase(),
                    course.id.toUpperCase(),
                    notes,
                    userId,
                ])

                const courseId = courseResult.rows[0].id
                let cardsInserted = 0

                const rootFileUpdate = await run(`
                    UPDATE files
                    SET content = $1, updated_by = $2, updated_at = NOW()
                    WHERE course_id = $3
                      AND name = 'root'
                      AND parent IS NULL
                    RETURNING id
                `, [notes, userId, courseId])

                if (rootFileUpdate.rowCount === 0) {
                    await run(`
                        INSERT INTO files (name, content, course_id, created_by, updated_by)
                        VALUES ('root', $1, $2, $3, $3)
                    `, [notes, courseId, userId])
                }

                for (const card of course.cards) {
                    if (
                        !card.question ||
                        !Array.isArray(card.alternatives) ||
                        !Array.isArray(card.correct)
                    ) {
                        throw new Error('Invalid card structure')
                    }

                    const cardResult = await run(`
                        INSERT INTO cards (
                        course_id,
                        question,
                        alternatives,
                        answers,
                        theme,
                        source,
                        created_by,
                        updated_by
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
                        ON CONFLICT (question) DO NOTHING
                    `, [
                        courseId,
                        card.question,
                        card.alternatives,
                        card.correct,
                        card.theme ?? null,
                        card.source ?? null,
                        userId,
                    ])

                    if (cardResult.rowCount === 1) {
                        cardsInserted++
                    }
                }

                results.push({
                    course: course.id,
                    imported: true,
                    cardsInserted,
                })
            } catch (courseError) {
                results.push({
                    course: course.id ?? 'unknown',
                    imported: false,
                    cardsInserted: 0,
                    error: (courseError as Error).message,
                })
            }
        }

        return res.status(201).send({ results })
    } catch (error) {
        return res.status(500).send({ error: (error as Error).message })
    }
}
