import { Alert, AlertIcon, AlertTitle, Box, Button, Flex, Link, Spinner } from '@chakra-ui/react'
import { Form, Formik, FormikHelpers } from 'formik'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { ChangePasswordInput, MeDocument, MeQuery, useChangePasswordMutation } from '../generated/graphql'
import { mapFieldErrors } from '../helper/mapFieldError'
import { useCheckAuth } from '../utils/useCheckAuth'

const ChangePassword = () => {
    const initialValues = { newPassword: '' }
    const router = useRouter();
    const { data: authData, loading: authLoading } = useCheckAuth();
    const [tokenError, setTokenError] = useState('');
    const [changePassword, { loading: _ }] = useChangePasswordMutation();
    const onChangePassword = async (values: ChangePasswordInput, { setErrors }: FormikHelpers<ChangePasswordInput>) => {
        const { userId, token } = router.query;
        if (userId && token) {
            const response = await changePassword({
                variables: {
                    userId: userId as string,
                    token: token as string,
                    changePasswordInput: values
                },
                update(cache, { data }) {
                    if (data?.changePassword.success) {
                        cache.writeQuery<MeQuery>({
                            query: MeDocument,
                            data: {
                                me: data.changePassword.user
                            }
                        })
                    }

                }
            })
            if (response.data?.changePassword.error) {
                const fieldErrors = mapFieldErrors(response.data.changePassword.error)
                if ('token' in fieldErrors)
                    setTokenError(fieldErrors.token)
                setErrors(fieldErrors)
            } else if (response.data?.changePassword.user)
                router.push('/')
        }
    }
    if (authLoading || (!authLoading && authData?.me)) return (
        <Flex justifyContent='center' alignItems='center'
            minH='100vh'>
            <Spinner />
        </Flex>
    )
    else if (!router.query.token || !router.query.userId) return (<Wrapper>
        <Alert status='error'>
            <AlertIcon />
            <AlertTitle>Invalid password change request</AlertTitle>
        </Alert>
        <Flex mt={2}>
            <NextLink href='/login'>
                <Link ml='auto'>
                    Back to login
                </Link>
            </NextLink>
        </Flex>
    </Wrapper>)
    else
        return (
            <Wrapper size='small'>
                <Formik initialValues={initialValues} onSubmit={onChangePassword}>
                    {({ isSubmitting }) => (<Form>
                        <Box mt={4}>
                            <InputField name="newPassword" placeholder="New Password" label="New Password"
                                type="password"
                            />
                        </Box>
                        {tokenError && <Flex>
                            <Box color={'red'} mr={2}>
                                {tokenError}
                                <Box>
                                    <NextLink href='/forgot-password'>
                                        <Link>
                                            Go back to forgot password
                                        </Link>
                                    </NextLink>
                                </Box>
                            </Box>
                        </Flex>}
                        <Button type="submit" colorScheme='teal' mt={4} isLoading={isSubmitting}>
                            Change
                        </Button>
                    </Form>)}
                </Formik>

            </Wrapper>
        )
}

export default ChangePassword