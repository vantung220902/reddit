import { Box, Button, Flex, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { MeDocument, MeQuery, RegisterInput, useRegisterMutation } from '../generated/graphql';
import { mapFieldErrors } from '../helper/mapFieldError';
import { useCheckAuth } from '../utils/useCheckAuth';

const Register = () => {
    const router = useRouter();
    const { data: authData, loading: authLoading } = useCheckAuth();
    const initialValues: RegisterInput = { username: '', email: '', password: '' };
    const [registerUser, { data, error, loading: _registerUserLoading }] = useRegisterMutation();

    const toast = useToast();

    const onRegister = async (values: RegisterInput, { setErrors }: FormikHelpers<RegisterInput>) => {
        const response = await registerUser({
            variables: {
                registerInput: values
            },
            update(cache, { data }) {
                if (data?.register.success) {
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: {
                            me: data.register.user
                        }
                    })
                }

            }
        });
        if (response.data?.register.error)
            setErrors(mapFieldErrors(response.data?.register.error));
        else if (response.data?.register.user) {
            toast({
                title: 'WelCome',
                description: `${response.data.register.user.username}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right'
            })
            router.push('/');
        }
    }
    return (
        <>{
            authLoading || (!authLoading && authData?.me) ? <Flex justifyContent='center' alignItems='center'
                minH='100vh'>
                <Spinner />
            </Flex> : <Wrapper size='small'>
                {error && <p>Failed to register</p>}
                {data && data.register.success && <p> Registered successfully
                    {JSON.stringify(data)}
                </p>}
                <Formik initialValues={initialValues} onSubmit={onRegister}>
                    {({ isSubmitting }) => (<Form>
                        <Box mt={4}>
                            <InputField name="username" placeholder="Username" label="Username"
                                type="text"
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField name="email" placeholder="Email" label="Email"
                                type="text"
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField name="password" placeholder="Password" label="Password"
                                type="password"
                            />
                        </Box>

                        <Button type="submit" colorScheme='teal' mt={4} isLoading={isSubmitting}>
                            Register
                        </Button>
                    </Form>)}

                </Formik>

            </Wrapper>
        }
        </>

    )
}

export default Register