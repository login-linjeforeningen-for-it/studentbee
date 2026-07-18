import type { FastifyReply, FastifyRequest } from 'fastify'
import run from '#db'

type ExportedComment = {
    id: number
    parent_id: number | null
    content: string
    votes: { up: number; down: number }
    rating: number
}

type ExportedCard = {
    id: number
    question: string
    alternatives: string[]
    correct: string[]
    theme: string | null
    source: string | null
    votes: { up: number; down: number }
    rating: number
    comments: ExportedComment[]
}

export default async function bulkExport(_: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
        const coursesResult = await run(`
            SELECT id, code, name, notes, learning_based
            FROM courses
            ORDER BY id
        `)

        const courses = coursesResult.rows

        const cardsResult = await run(`
            SELECT
                c.id,
                c.course_id,
                c.question,
                c.alternatives,
                c.answers,
                c.theme,
                c.source,
                COALESCE(SUM(CASE WHEN v.is_upvote THEN 1 ELSE 0 END), 0) AS upvotes,
                COALESCE(SUM(CASE WHEN NOT v.is_upvote THEN 1 ELSE 0 END), 0) AS downvotes
            FROM cards c
            LEFT JOIN card_votes v ON v.card_id = c.id
            GROUP BY c.id
            ORDER BY c.id
        `)

        const cards = cardsResult.rows

        const commentsResult = await run(`
            SELECT
                c.id,
                c.card_id,
                c.parent_id,
                c.content,
                COALESCE(SUM(CASE WHEN v.is_upvote THEN 1 ELSE 0 END), 0) AS upvotes,
                COALESCE(SUM(CASE WHEN NOT v.is_upvote THEN 1 ELSE 0 END), 0) AS downvotes
            FROM comments c
            LEFT JOIN comment_votes v ON v.comment_id = c.id
            GROUP BY c.id
            ORDER BY c.id
        `)

        const comments = commentsResult.rows

        const commentsByCard = new Map<number, ExportedComment[]>()

        for (const comment of comments) {
            if (!commentsByCard.has(comment.card_id)) {
                commentsByCard.set(comment.card_id, [])
            }

            commentsByCard.get(comment.card_id)!.push({
                id: comment.id,
                parent_id: comment.parent_id,
                content: comment.content,
                votes: {
                    up: Number(comment.upvotes),
                    down: Number(comment.downvotes),
                },
                rating: Number(comment.upvotes) - Number(comment.downvotes),
            })
        }

        const cardsByCourse = new Map<number, ExportedCard[]>()

        for (const card of cards) {
            const exportedCard = {
                id: card.id,
                question: card.question,
                alternatives: card.alternatives,
                correct: card.answers,
                theme: card.theme,
                source: card.source,
                votes: {
                    up: Number(card.upvotes),
                    down: Number(card.downvotes),
                },
                rating: Number(card.upvotes) - Number(card.downvotes),
                comments: commentsByCard.get(card.id) ?? [],
            }

            if (!cardsByCourse.has(card.course_id)) {
                cardsByCourse.set(card.course_id, [])
            }

            cardsByCourse.get(card.course_id)!.push(exportedCard)
        }

        const data = courses.map(course => ({
            id: course.id,
            code: course.code,
            name: course.name,
            notes: course.notes,
            learning_based: course.learning_based,
            cards: cardsByCourse.get(course.id) ?? [],
        }))

        return res.status(200).send({ data })
    } catch (error) {
        return res.status(500).send({ error: (error as Error).message })
    }
}
