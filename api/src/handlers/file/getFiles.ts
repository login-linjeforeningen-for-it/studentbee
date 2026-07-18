import type { FastifyReply, FastifyRequest } from 'fastify'
import run from '#db'

type File = {
    id: number
    name: string
    content: string
    parent: string | null
    created_by: string
    created_at: string
    updated_by: string
    updated_at: string
    deleted: boolean
    files?: File[]
}

export default async function filesHandler(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as { id: string }

    if (!id) {
        return res.status(400).send({ error: 'Missing id in params' })
    }

    try {
        const { rows } = await run(
            'SELECT * FROM files WHERE course_id = $1 AND deleted = false ORDER BY created_at ASC',
            [id]
        )

        const filesById: Record<number, File> = {}
        rows.forEach(file => {
            file.files = []
            filesById[file.id] = file
        })

        const topLevelFiles: File[] = []
        rows.forEach(file => {
            if (file.parent) {
                const parentFile = Object.values(filesById).find(f => f.name === file.parent)
                if (parentFile) {
                    parentFile.files!.push(file)
                } else {
                    topLevelFiles.push(file)
                }
            } else {
                topLevelFiles.push(file)
            }
        })

        return res.send(topLevelFiles)
    } catch (error) {
        return res.status(500).send({ error: (error as Error).message })
    }
}
