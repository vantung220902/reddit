import { AuthenticationError } from 'apollo-server-express';
import { Context } from './../type/Context';
import { MiddlewareFn } from "type-graphql";

export const checkAuth: MiddlewareFn<Context> = ({ context: { req } }, next) => {
    if (!req.session.userId) throw new AuthenticationError('Not Authenticated to perform graphQl operations')
    return next();
};