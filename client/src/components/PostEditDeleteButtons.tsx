import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Box, IconButton } from '@chakra-ui/react'
import React from 'react'
import NextLink from 'next/link'
import { PaginatedPosts, useDeletePostMutation } from '../generated/graphql'
import { Reference } from '@apollo/client'
import { useRouter } from 'next/router'

interface PostEditDeleteButtonsProps {
    postId: string
}

const PostEditDeleteButtons = ({ postId }: PostEditDeleteButtonsProps) => {
    const [deletePost, _] = useDeletePostMutation()

    const router = useRouter()

    const onDeletePost = async (postId: string) => {
        await deletePost({
            variables: { id: postId },
            update(cache, { data }) {
                if (data?.deletePost.success) {
                    cache.modify({
                        fields: {
                            posts(existing: Pick<PaginatedPosts, '__typename' | 'cursor' | 'hasMore' | 'totalCount'>
                                & { paginatedPosts: Reference[] }) {
                                const newPostsAfterDeletion = {
                                    ...existing,
                                    totalCount: existing.totalCount - 1,
                                    paginatedPosts: existing.paginatedPosts.filter(
                                        postRefObject => postRefObject.__ref !== `Post:${postId}`
                                    )

                                }
                                return newPostsAfterDeletion;
                            }
                        }
                    })
                }
            }
        })
        if (router.route !== '/') router.push('/')
    }

    return (
        <Box>
            <NextLink href={`/post/edit/${postId}`}>
                <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
            </NextLink>
            <NextLink href='/'>
                <IconButton icon={<DeleteIcon />} aria-label="delete" colorScheme={'red'} onClick={onDeletePost.bind(this, postId)} />
            </NextLink>
        </Box>
    )
}

export default PostEditDeleteButtons