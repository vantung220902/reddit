import { ChangePasswordInput } from './../type/ChangePasswordInput';
import { TokenModel } from './../models/Token';
import { sendEmail } from './../utils/sendEmail';
import { COOKIE_NAME } from './../utils/constants';
import { Context } from './../type/Context';
import { validateRegisterInput } from './../utils/validateRegisterInput';
import { RegisterInput } from './../type/RegisterInput';
import { UserMutationResponse } from './../type/UserMutationResponse';
import { User } from './../entities/User';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import argon2 from 'argon2';
import { LoginInput } from './../type/LoginInput';
import { ForgotPasswordInput } from './../type/ForgotPassword';
import { v4 as uuidv4 } from 'uuid';
@Resolver(_of => User)
export class UserResolver {

    @FieldResolver(_return => String)
    email(@Root() user: User, @Ctx() { req }: Context) {
        return req.session.userId === user.id ? user.email : ''
    }

    @Query(_return => User, { nullable: true })
    async me(@Ctx() { req }: Context): Promise<User | null | undefined> {
        if (!req.session.userId) return null;
        const user = await User.findOne(req.session.userId);
        return user;
    }

    @Mutation(_return => UserMutationResponse)
    async register(
        @Arg('registerInput') registerInput: RegisterInput,
        @Ctx() { req }: Context
    ): Promise<UserMutationResponse> {
        const validateRegisterInputErrors = validateRegisterInput(registerInput);
        if (validateRegisterInputErrors !== null)
            return {
                code: 400,
                success: false,
                ...validateRegisterInputErrors
            }
        try {
            const { username, email, password } = registerInput;
            const existingUser = await User.findOne({
                where: [{ username }, { email }]
            });
            if (existingUser) return {
                code: 400,
                success: false,
                message: 'Duplicated username or email',
                error: [{
                    filed: existingUser.username === username ? 'username' : 'email',
                    message: `${existingUser.username === username ? 'username' : 'email'} already exists`,
                }]
            };

            const hasPassword = await argon2.hash(password);

            const newUser = User.create({ username, password: hasPassword, email });
            await newUser.save();
            req.session.userId = newUser.id
            return {
                code: 200,
                success: true,
                message: 'User registration successfully',
                user: newUser
            };
        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error.message} `
            };
        }
    }
    @Mutation(_return => UserMutationResponse)
    async login(@Arg('loginInput') { usernameOrEmail, password }: LoginInput,
        @Ctx() { req }: Context): Promise<UserMutationResponse> {
        try {
            const existingUser = await User.findOne(usernameOrEmail.includes('@') ? { email: usernameOrEmail }
                : { username: usernameOrEmail });
            if (!existingUser)
                return {
                    code: 400,
                    success: false,
                    message: 'User not found',
                    error: [{ filed: 'usernameOrEmail', message: 'username or email incorrect' }]
                }
            const passwordValid = await argon2.verify(existingUser.password, password);
            if (!passwordValid) return {
                code: 400,
                success: false,
                message: 'Wrong password',
                error: [{ filed: 'password', message: 'Password incorrect' }]
            }
            //Create session and return cookie
            req.session.userId = existingUser.id;

            return {
                code: 200,
                success: true,
                message: 'Logged in successfully',
                user: existingUser
            }
        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error.message} `
            };
        }
    }

    @Mutation(_return => Boolean)
    logout(@Ctx() { req, res }: Context): Promise<boolean> {
        return new Promise((resolve, _reject) => {
            res.clearCookie(COOKIE_NAME);
            req.session.destroy(error => {
                if (error) console.log('DESTROYING SESSION ERROR', error)
                resolve(false);
            })
            resolve(true)
        })

    }
    @Mutation(_return => Boolean)
    async forgotPassword(@Arg('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput): Promise<boolean> {
        const user = await User.findOne({ email: forgotPasswordInput.email })
        if (!user) return true;

        await TokenModel.findOneAndDelete({ userId: `${user.id}` })

        const resetToken = uuidv4();
        const hashResetToken = await argon2.hash(resetToken);

        await new TokenModel({
            userId: `${user.id}`,
            token: hashResetToken
        }).save()
        await sendEmail(forgotPasswordInput.email,
            `<a href='http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}'>Click Here 👻</a>`)

        return true;
    }

    @Mutation(_return => UserMutationResponse)
    async changePassword(@Arg('token') token: string,
        @Arg('userId') userId: string,
        @Arg('changePasswordInput') changePasswordInput: ChangePasswordInput,
        @Ctx() { req }: Context): Promise<UserMutationResponse> {
        if (changePasswordInput.newPassword.length < 3) return {
            code: 400,
            success: false,
            message: 'Invalid password',
            error: [{
                filed: 'newPassword',
                message: 'Length must be greater than two'
            }]
        }
        try {
            const restPasswordToken = await TokenModel.findOne({ userId })
            if (!restPasswordToken) return {
                code: 400,
                success: false,
                message: 'Invalid or expired password rest token',
                error: [{
                    filed: 'token',
                    message: 'Invalid or expired password rest token'
                }]

            }
            const restPasswordTokenValid = argon2.verify(restPasswordToken.token, token)
            if (!restPasswordTokenValid) return {
                code: 400,
                success: false,
                message: 'Invalid or expired password rest token',
                error: [{
                    filed: 'token',
                    message: 'Invalid or expired password rest token'
                }]
            }
            const userIdNum = parseInt(userId, 10);
            const user = await User.findOne(userIdNum);
            if (!user) return {
                code: 400,
                success: false,
                message: 'User no longer exists',
                error: [{
                    filed: 'token',
                    message: 'User no longer exists'
                }]
            }
            const updatedPassword = await argon2.hash(changePasswordInput.newPassword);
            await User.update({ id: userIdNum }, { password: updatedPassword })
            await restPasswordToken.deleteOne();

            req.session.userId = user.id;

            return {
                code: 200,
                success: true,
                message: 'Change password successfully',
                user
            }
        } catch (error) {
            console.log(error);
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error.message} `
            };
        }
    }
}