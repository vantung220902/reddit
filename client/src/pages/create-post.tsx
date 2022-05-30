import { Box, Button, Flex, Spinner } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import { CreatePostInput, useCreatePostMutation } from '../generated/graphql'
import { useCheckAuth } from '../utils/useCheckAuth'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

const CreatePost = () => {
    const { data: authData, loading: authLoading } = useCheckAuth()
    const initialValues: CreatePostInput = { title: '', text: '' }
    const router = useRouter();
    const [createPost, _] = useCreatePostMutation();

    const onCreatePost = async (values: CreatePostInput) => {
        await createPost({
            variables: { createPostInput: values },
            update(cache, { data }) {
                cache.modify({
                    fields: {
                        posts(existing) {
                            if (data?.createPost.success && data.createPost.post) {
                                const newPostRef = cache.identify(data.createPost.post)
                                const newPostAfterCreation = {
                                    ...existing,
                                    totalCount: existing.totalCount + 1,
                                    paginatedPosts: [
                                        { __ref: newPostRef },
                                        ...existing.paginatedPosts]
                                }

                                return newPostAfterCreation;
                            }
                        }
                    }
                })
            }
        })
        router.push('/')
    }
    if (authLoading || (!authLoading && !authData?.me)) return (
        <Flex justifyContent='center' alignItems='center'
            minH='100vh'>
            <Spinner />
        </Flex>
    )
    return (
        <Layout>
            <Formik initialValues={initialValues} onSubmit={onCreatePost}>
                {({ isSubmitting }) => (<Form>
                    <Box mt={4}>
                        <InputField name="title" placeholder="Title" label="Title"
                            type="text"
                        />
                    </Box>
                    <Box mt={4}>
                        <InputField name="text" placeholder="Text" label="Text"
                            type="text"
                            textarea={true}
                        />
                    </Box>
                    <Flex justifyContent='space-between' alignItems='center' mt={4} >
                        <Button type="submit" colorScheme='teal' isLoading={isSubmitting} >
                            Create
                        </Button>

                        <NextLink href='/'>
                            <Button>
                                Go back home</Button>
                        </NextLink>
                    </Flex>
                </Form>)}
            </Formik>


        </Layout>
    )
}

export default CreatePost