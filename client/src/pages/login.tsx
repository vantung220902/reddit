import { Box, Button, Flex, Link, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { LoginInput, MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { mapFieldErrors } from '../helper/mapFieldError';
import { useCheckAuth } from '../utils/useCheckAuth';
const Login = () => {
    const router = useRouter();

    const { data: authData, loading: authLoading } = useCheckAuth();

    const initialValues: LoginInput = { usernameOrEmail: '', password: '' };
    const [loginUser, { data: _, error, loading: _registerUserLoading }] = useLoginMutation();

    const toast = useToast();

    const onLogin = async (values: LoginInput, { setErrors }: FormikHelpers<LoginInput>) => {
        const response = await loginUser({
            variables: {
                loginInput: values
            },
            update(cache, { data }) {
                console.log('DATA LOGIN', data);
                // const meData = cache.readQuery({ query:  MeDocument });
                // console.log('ME DATA',meData);
                if (data?.login.success) {
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            me: data.login.user
                        }
                    })
                }

            }
        });
        if (response.data?.login.error)
            setErrors(mapFieldErrors(response.data?.login.error));
        else if (response.data?.login.user) {
            toast({
                title: 'WelCome',
                description: `${response.data.login.user.username}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right'
            })
            router.push('/')
        };
    }
    return (
        <>
            {authLoading || (!authLoading && authData?.me) ? <Flex justifyContent='center' alignItems='center'
                minH='100vh'>
                <Spinner />
            </Flex> : <Wrapper size='small'>
                {error && <p>Failed to Login. Internal Server Error</p>}
                <Formik initialValues={initialValues} onSubmit={onLogin}>
                    {({ isSubmitting }) => (<Form>
                        <Box mt={4}>
                            <InputField name="usernameOrEmail" placeholder="Username Or Email" label="Username Or Email"
                                type="text"
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField name="password" placeholder="Password" label="Password"
                                type="password"
                            />
                        </Box>
                        <Flex mt={2}>
                            <NextLink href='/forgot-password'>
                                <Link ml='auto'>
                                    Forgot Password
                                </Link>
                            </NextLink>
                        </Flex>
                        <Button type="submit" colorScheme='teal' mt={4} isLoading={isSubmitting}>
                            Login
                        </Button>
                    </Form>)}

                </Formik>

            </Wrapper>
            }
        </>
    )

}

export default Login