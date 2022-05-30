import { Alert, AlertIcon, AlertTitle, Box, Button, Flex, Heading, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import React from 'react'
import { usePostQuery, PostIdsDocument, PostIdsQuery, PostQuery, PostDocument, useMeQuery } from '../../generated/graphql'
import NextLink from 'next/link'
import Layout from '../../components/Layout';
import { GetStaticPaths, GetStaticProps } from 'next';
import { limit } from '..';
import { initializeApollo, addApolloState } from '../../lib/apolloClient';
import PostEditDeleteButtons from '../../components/PostEditDeleteButtons';
const Post = () => {
    const router = useRouter();
    const { data, loading, error } = usePostQuery({
        variables: { id: router.query.id as string },
    })
    const { data: meData } = useMeQuery();
    if (loading) return (<Layout>
        <Flex justifyContent='center' alignItems='center'
            minH='100vh'>
            <Spinner />
        </Flex>
    </Layout>)

    if (error || !data?.post) return (<Layout>
        <Alert status='error'>
            <AlertIcon />
            <AlertTitle>{error ? error.message : 'Post not found'}</AlertTitle>
        </Alert>
        <Flex mt={2}>
            <Box mt={4}>
                <NextLink href='/'>
                    <Button >
                        Back to home
                    </Button>
                </NextLink>
            </Box>

        </Flex>
    </Layout>)
    return (
        <Layout>
            <Heading mb={4}>
                {data.post.title}
            </Heading>
            <Box mb={4}>
                {data.post.text}
            </Box>
            <Flex mt={4} justifyContent='space-between' alignContent='center'>
                {meData?.me?.id === data.post.userId.toString() && <PostEditDeleteButtons postId={data.post.id} />}
                <NextLink href='/'>
                    <Button >
                        Back to home
                    </Button>
                </NextLink>
            </Flex>
        </Layout>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const apolloClient = initializeApollo();
    const { data } = await apolloClient.query<PostIdsQuery>({
        query: PostIdsDocument,
        variables: { limit }
    })
    return {
        paths: data.posts!.paginatedPosts.map(post => ({
            params: { id: `${post.id}`, }
        })),
        fallback: 'blocking'
    }
}
export const getStaticProps: GetStaticProps<{ [key: string]: any }, { id: string }> = async ({ params }) => {
    const apolloClient = initializeApollo();
    await apolloClient.query<PostQuery>({
        query: PostDocument,
        variables: { id: params?.id },
    })
    return addApolloState(apolloClient, {
        props: {}
    })
}


export default Post