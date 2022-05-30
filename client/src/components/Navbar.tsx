import { gql, Reference } from '@apollo/client';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { MeDocument, MeQuery, useLogoutMutation, useMeQuery } from '../generated/graphql'
const Navbar = () => {
    const { data, loading: useMeQueryLoading } = useMeQuery();
    const [logoutUser, { loading: useLogoutMutationLogout }] = useLogoutMutation();

    const logout = async () => {
        await logoutUser({
            update(cache, { data }) {
                if (data?.logout) cache.writeQuery<MeQuery>({
                    query: MeDocument,
                    data: { me: null }
                })

                cache.modify({
                    fields: {
                        posts(existing) {
                            existing.paginatedPosts.forEach((post: Reference) => {
                                cache.writeFragment({
                                    id: post.__ref,
                                    fragment: gql`
                                    fragment VoteType on Post{
                                        voteType
                                    }
                                    `,
                                    data: {
                                        voteType: 0
                                    }
                                })
                            })
                            return existing;
                        }
                    }
                })
            }

        });
    }

    let body;
    if (useMeQueryLoading) body = null;
    else if (!data?.me) body = (<>
        <NextLink href='/login' passHref>
            <Link mr={2} textDecoration='none'>
                Login
            </Link>
        </NextLink>
        <NextLink href='/register' passHref>
            <Link textDecoration='none'>
                Register
            </Link>
        </NextLink>
    </>)
    else body = (
        <Flex>
            <NextLink href='/create-post'>
                <Button mr={4}>
                    Create Post
                </Button>
            </NextLink>
            <Button onClick={logout} isLoading={useLogoutMutationLogout}>
                Logout
            </Button>
        </Flex>
    )

    return (

        <Box bg='tan' p={4}>
            <Flex maxW={800} justifyContent='space-between' align='center' m='auto'>
                <NextLink href='/' passHref>
                    <Heading>
                        Reddit
                    </Heading>
                </NextLink>
                <Box >
                    {body}
                </Box>
            </Flex>
        </Box>
    )
}

export default Navbar