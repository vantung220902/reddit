import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import { PostWithUserInfoFragment, useVoteMutation, VoteType } from '../generated/graphql'

interface UpvoteSectionProps {
    post: PostWithUserInfoFragment
}

enum VoteTypeValues {
    Upvote = 1,
    Downvote = -1
}

const UpvoteSection = ({ post }: UpvoteSectionProps) => {

    const [vote, { loading }] = useVoteMutation()

    const [loadingState, setLoadingSate] = useState<'upvote-loading' | 'downvote-loading' | 'not-loading'>('not-loading')

    const upvote = async (postId: string) => {

        setLoadingSate('upvote-loading')
        await vote({ variables: { inputVoteValue: VoteType.UpVote, postId: parseInt(postId, 10) } })
        setLoadingSate('not-loading')

    }
    const downvote = async (postId: string) => {
        setLoadingSate('downvote-loading')
        await vote({ variables: { inputVoteValue: VoteType.DownVote, postId: parseInt(postId, 10) } })
        setLoadingSate('not-loading')
    }
    return (
        <Flex direction='column' alignItems='center' mr={4}>
            <IconButton icon={<ChevronUpIcon />} aria-label="upvote"
                onClick={post.voteType === VoteTypeValues.Upvote ? undefined : upvote.bind(this, post.id)}
                isLoading={loading && loadingState === 'upvote-loading'}
                colorScheme={post.voteType === VoteTypeValues.Upvote ? 'green' : undefined}
            />
            {post.points}
            <IconButton icon={<ChevronDownIcon />} aria-label="downvote"
                onClick={post.voteType === VoteTypeValues.Downvote ? undefined : downvote.bind(this, post.id)}
                isLoading={loading && loadingState === 'downvote-loading'}
                colorScheme={post.voteType === VoteTypeValues.Downvote ? 'red' : undefined}
            />
        </Flex>
    )
}

export default UpvoteSection