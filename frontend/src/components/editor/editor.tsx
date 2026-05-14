'use client'

import { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react'
import { MarkdownRender } from 'uibee/components'
import { sendText } from '@parent/src/utils/fetchClient'

type EditorProps = {
    courseId: string
    value: string[]
    customSaveLogic?: true
    hideSaveButton?: true
    save?: () => void
    onChange?: (value: string) => void
    className?: string
    placeholder?: string
    placeholderClassName?: string
    forceEditMode?: boolean
}

type EditorWithoutLogicProps = {
    markdown: string
    handleMarkdownChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
    handleSave: () => void
    displayEditor: boolean
    hideSaveButton?: true
    handleDisplayEditor: () => void
    hideSave: boolean
    textareaRef: RefObject<HTMLTextAreaElement | null>
    edited: boolean
    className?: string
    placeholder?: string
    placeholderClassName?: string
}

type MarkdownProps = {
    displayEditor: boolean
    handleDisplayEditor: () => void
    markdown: string
    className?: string
}


export default function Editor({
    courseId,
    value,
    customSaveLogic,
    hideSaveButton,
    save,
    onChange,
    className,
    placeholder,
    placeholderClassName,
    forceEditMode
}: EditorProps) {
    const [markdown, setMarkdown] = useState(value.join('\n'))
    const [displayEditorState, setDisplayEditorState] = useState(false)
    const displayEditor = forceEditMode || displayEditorState
    const [hideSave, setHideSave] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const edited = value.join('\n') !== markdown

    function handleMarkdownChange(event: ChangeEvent<HTMLTextAreaElement>) {
        if (customSaveLogic && onChange) {
            if (!displayEditor) {
                setDisplayEditorState(true)
            }

            onChange(event.target.value)
            setMarkdown(event.target.value)
        } else {
            setMarkdown(event.target.value)
        }

        if (!forceEditMode) {
            setDisplayEditorState(true)
        }
        autoResize(event.target)
    }

    function handleSave() {
        if (customSaveLogic && save) {
            save()
        } else {
            sendText(courseId, markdown.split('\n'))
        }

        if (!forceEditMode) {
            setDisplayEditorState(false)
        }
        setHideSave(true)
    }

    function autoResize(textarea: HTMLTextAreaElement) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    function handleDisplayEditor() {
        if (!forceEditMode) {
            setDisplayEditorState(!displayEditorState)
        }
        setHideSave(false)
        if (textareaRef.current) {
            autoResize(textareaRef.current)
        }
    }

    useEffect(() => {
        if (textareaRef.current) {
            autoResize(textareaRef.current)
        }
    }, [])

    useEffect(() => {
        setMarkdown(value.join('\n'))
    }, [value])

    return <EditorWithoutLogic
        className={className}
        placeholder={placeholder}
        markdown={markdown}
        handleMarkdownChange={handleMarkdownChange}
        handleSave={handleSave}
        displayEditor={displayEditor}
        handleDisplayEditor={handleDisplayEditor}
        hideSaveButton={hideSaveButton}
        hideSave={hideSave}
        textareaRef={textareaRef}
        edited={edited}
        placeholderClassName={placeholderClassName}
    />
}

export function EditorWithoutLogic({
    markdown,
    handleMarkdownChange,
    handleSave,
    displayEditor,
    handleDisplayEditor,
    hideSaveButton,
    hideSave,
    textareaRef,
    edited,
    className,
    placeholder,
    placeholderClassName
}: EditorWithoutLogicProps) {
    return (
        <div
            className={`${className}`}
            onClick={() => textareaRef?.current?.focus()}
        >
            <div className=''>
                {displayEditor && <div className='grid grid-cols-2'>
                    <h1 className='text-lg text-login-300'>Markdown</h1>
                    <h1 className='text-lg pl-2 text-login-300'>Preview</h1>
                </div>}
                <div className={`markdown-editor space-x-2 h-full ${displayEditor && 'grid grid-cols-2'}`}>
                    {(displayEditor || !markdown.length) && <textarea
                        className={`w-full h-full rounded-sm text-white bg-transparent focus:outline-hidden resize-none overflow-hidden
                            outline-hidden caret-login ${placeholderClassName}`}
                        value={markdown}
                        onChange={handleMarkdownChange}
                        placeholder={placeholder || 'Write your markdown here...'}
                        ref={textareaRef}
                    />}
                    <Markdown
                        displayEditor={displayEditor}
                        handleDisplayEditor={handleDisplayEditor}
                        markdown={markdown}
                    />
                </div>
            </div>
            {edited && !hideSave && !hideSaveButton && <div className='mt-2'>
                <button
                    className='text-md bg-login px-8 rounded-lg h-8 cursor-pointer'
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>}
        </div>
    )
}

export function Markdown({
    displayEditor,
    handleDisplayEditor,
    markdown,
    className
}: MarkdownProps) {
    return (
        <div
            className={`${displayEditor && 'pl-2 border-l-2 border-login'} text-foreground h-full wrap-break-word ${className}`}
            onClick={handleDisplayEditor}
        >
            <MarkdownRender MDstr={markdown} />
        </div>
    )
}
