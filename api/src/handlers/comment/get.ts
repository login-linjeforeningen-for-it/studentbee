import type { FastifyReply, FastifyRequest } from 'fastify'
import run from '#db'

type CommentRow = {
    id: number
    cardId: number
    parentId: number | null
    content: string
    createdAt: string
    updatedAt: string
    username: string
    rating: number
    vote: boolean | null
}

type Comment = CommentRow & { parent: number | null; replies: Comment[] }

export default async function commentsHandler(req: FastifyRequest, res: FastifyReply) {
    const { cardId } = req.params as { cardId: string }
    const userId = req.user?.id ?? null

    try {
        const result = await run(`
            SELECT c.id,
                   c.card_id AS "cardId",
                   c.parent_id AS "parentId",
                   c.content,
                   c.created_at AS "createdAt",
                   c.updated_at AS "updatedAt",
                   COALESCE(u.name, c.user_id) AS "username",
                   COALESCE(SUM(CASE WHEN cv.is_upvote THEN 1 ELSE -1 END), 0)::int AS "rating",
                   MAX(CASE WHEN cv.user_id = $2 THEN cv.is_upvote::int ELSE NULL END)::boolean AS "vote"
            FROM comments c
            LEFT JOIN users u ON u.user_id = c.user_id
            LEFT JOIN comment_votes cv ON cv.comment_id = c.id
            WHERE c.card_id = $1
            GROUP BY c.id, u.name
            ORDER BY c.created_at ASC;
        `, [cardId, userId])

        const rows = result.rows as CommentRow[]
        const commentById: Record<number, Comment> = {}
        rows.forEach((row: CommentRow) => {
            commentById[row.id] = {
                ...row,
                parent: row.parentId ?? null,
                replies: []
            }
        })

        const comments: Comment[] = []
        rows.forEach((row: CommentRow) => {
            const comment = commentById[row.id]

            if (row.parentId) {
                commentById[row.parentId]?.replies.push(comment)
            } else {
                comments.push(comment)
            }
        })

        return res.send(comments)
    } catch (error) {
        console.error('Error in commentsHandler:', error)
        return res.status(500).send({ error: (error as Error).message })
    }
}
