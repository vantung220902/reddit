import { Box, Button, Flex, Spinner } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import { CreatePostInput } from '../generated/graphql'
import { useCheckAuth } from '../utils/useCheckAuth'
const CreatePost = () => {
    const { data: authData, loading: authLoading } = useCheckAuth()
    const initialValues: CreatePostInput = { title: '', text: '' }
    const onCreatePost = (values: CreatePostInput) => {
        console.log(values);
    }
    if (authLoading || (!authLoading && !authData?.me)) return (
        <Flex justifyContent='center' alignItems='center'
            minH='100vh'>
            <Spinner />
        </Flex>
    )
    else
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
                        <Button type="submit" colorScheme='teal' mt={4} isLoading={isSubmitting} >
                            Create
                        </Button>
                    </Form>)}
                </Formik>
            </Layout>
        )
}

export default CreatePost