import { PostResolver } from './resolvers/post';
import { User } from './entities/User';
require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { UserResolver } from './resolvers/user';
import mongoose from 'mongoose';
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { COOKIE_NAME, __prod__ } from './utils/constants';
import { Context } from './type/Context';
import cors from 'cors';
import { Upvote } from './entities/Upvote';
import { buildDataLoaders } from './utils/dataLoaders';
import path from 'path/posix';
const main = async () => {
    const connection = await createConnection({
        type: 'postgres',
        ...(__prod__ ? { url: process.env.DATABASE_URL } : {
            database: 'reddit',
            username: process.env.DB_USERNAME_DEV,
            password: process.env.DB_PASSWORD_DEV,
        }),
        logging: true,
        ...(__prod__ ? {
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                }
            },
            ssl: true
        } : {}),
        ...(__prod__ ? {} : { synchronize: true, }),
        entities: [User, Post, Upvote],
        migrations: [path.join(__dirname, '/migrations/*')]
    })

    if (__prod__) await connection.runMigrations();

    const app = express();

    app.use(cors({
        origin: __prod__ ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV,
        credentials: true
    }))

    const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV}:${process.env.SESSION_DB_PASSWORD_DEV}@reddit.nedcf.mongodb.net/${process.env.SESSION_DB_NAME_DEV}`;
    await mongoose.connect(mongoUrl, {
        w: 'majority',
        retryWrites: true
    })
    console.log('MongoDB connected')

    app.use(session({
        name: COOKIE_NAME,
        store: MongoStore.create({ mongoUrl }),
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,//JS from front-end cannot access cookie
            secure: __prod__,  // cookie only works in https
            sameSite: 'lax',//protection against CSRF
            domain:__prod__ ? '.vercel.app': undefined
        },
        secret: process.env.SESSION_SECRET_DEV_PROD as string,
        saveUninitialized: false,//don't save empty session, right from the start
        resave: false,
    }));

    const apolloServer = new ApolloServer({
        schema: await buildSchema({ resolvers: [HelloResolver, UserResolver, PostResolver], validate: false }),
        context: ({ req, res }): Context => ({ req, res, connection, dataLoaders: buildDataLoaders() }),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]

    })

    await apolloServer.start();

    apolloServer.applyMiddleware({ app, cors: false });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}. GraphQL server started on localhost:${PORT}${apolloServer.graphqlPath}`));
}
main().catch(err => console.log(err));