import { RegisterInput } from './../type/RegisterInput';
export const validateRegisterInput = (registerInput: RegisterInput) => {
    if (registerInput.username.length < 3)
        return {
            message: 'Invalid username',
            error: [
                { filed: 'username', message: 'Length must greater than 2 characters' }
            ]
        }
    if (!registerInput.email.includes('@'))
        return {
            message: 'Invalid email',
            error: [
                { filed: 'email', message: 'Email must include @ symbol' }
            ]
        }
    if (registerInput.username.includes('@'))
        return {
            message: 'Invalid username',
            error: [
                { filed: 'username', message: 'Username cannot includes @' }
            ]
        }
    if (registerInput.password.length < 3)
        return {
            message: 'Invalid password',
            error: [
                { filed: 'password', message: 'Length must greater than 2 characters' }
            ]
        }
    return null;
}