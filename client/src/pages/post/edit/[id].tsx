import { Alert, AlertIcon, AlertTitle, Box, Button, Flex, Link, Spinner } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { UpdatePostInput, useMeQuery, usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
const PostEdit = () => {

    const router = useRouter()

    const postId = router.query.id as string;

    const { data: meData, loading: meLoading } = useMeQuery();

    const { data, loading } = usePostQuery({ variables: { id: postId } })

    const [updatePost, _] = useUpdatePostMutation();

    if (meLoading || loading) return (<Layout>
        <Flex justifyContent='center' alignItems='center'
            minH='100vh'>
            <Spinner />
        </Flex>
    </Layout>)

    if (!data?.post) return (<Layout>
        <Alert status='error'>
            <AlertIcon />
            <AlertTitle>Post Not Found</AlertTitle>
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

    if (!meLoading && !loading && meData?.me?.id !== data?.post?.userId.toString()) return (<Layout>
        <Alert status='error'>
            <AlertIcon />
            <AlertTitle>UnAuthorized</AlertTitle>
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

    const initialValues = { title: data.post.title, text: data.post.text }

    const onUpdatePost = async (value: Omit<UpdatePostInput, 'id'>) => {
        await updatePost({
            variables: { updatePostInput: { ...value, id: postId } },
        })
        router.back();
    }
    return (
        <Layout>
            <Formik initialValues={initialValues} onSubmit={onUpdatePost}>
                {({ isSubmitting }) => (<Form>
                    <Box mt={4}>
                        <InputField name="title" placeholder="Title" label="Title"
                            type="text"
                        />
                    </Box>
                    <Box mt={4}>
                        <InputField name="text" placeholder="Text" label="Text"
                            textarea type="text"
                        />
                    </Box>
                    <Flex mt={3} justifyContent='space-between'>
                        <Button type="submit" colorScheme='teal' isLoading={isSubmitting}>
                            Update
                        </Button>
                        <NextLink href='/'>
                            <Link>
                                Back To Home
                            </Link>
                        </NextLink>
                    </Flex>
                </Form>)}

            </Formik>
        </Layout>
    )
}

export default PostEdit