import { Box, Button, Flex, Link, Spinner } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import React from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { ForgotPasswordInput, useForgotPasswordMutation } from '../generated/graphql'
import { useCheckAuth } from '../utils/useCheckAuth'
import NextLink from 'next/link'

const ForGotPassword = () => {
    const initialValues = { email: '' }
    const { data: authData, loading: authLoading } = useCheckAuth();
    const [forgotPassword, { loading, data }] = useForgotPasswordMutation()

    const onForGotPassword = async (values: ForgotPasswordInput) => {
        await forgotPassword({
            variables: {
                forgotPasswordInput: values
            }
        })
    }
    if (authLoading || (!authLoading && authData?.me)) return (
        <Flex justifyContent='center' alignItems='center'
            minH='100vh'>
            <Spinner />
        </Flex>
    )
    return (
        <Wrapper size='small'>
            <Formik initialValues={initialValues} onSubmit={onForGotPassword}>
                {({ isSubmitting }) => !loading && data ? <Box>
                    Please check your info
                </Box> : (<Form>
                    <Box mt={4}>
                        <InputField name="email" placeholder="Email" label="Email"
                            type="email"
                        />
                    </Box>
                    <Flex mt={2}>
                        <NextLink href='/login'>
                            <Link ml='auto'>
                                Back to login
                            </Link>
                        </NextLink>
                    </Flex>
                    <Button type="submit" colorScheme='teal' mt={4} isLoading={isSubmitting}>
                        Send
                    </Button>
                </Form>)}
            </Formik>

        </Wrapper>
    )
}

export default ForGotPassword