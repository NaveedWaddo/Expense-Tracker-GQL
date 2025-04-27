import dotenv, { config } from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

import { buildContext } from "graphql-passport";

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";

import mergeResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { connectDB } from "./db/connectDB.js";
import { configuserPassport } from "./password/password.config.js";
dotenv.config();

configuserPassport();

async function bootstrap() {
  // 1) Connect to Mongo
  await connectDB();

  // 2) Set up Express + middleware
  const app = express();
  app.use(cors());
  app.use(express.json());

  const httpServer = http.createServer(app);

  const MongoDBStore = connectMongo(session);

  const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

  store.on("error", (err) => {
    console.log("MongoDB session store error", err);
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // 3) Create & start ApolloServer
  const server = new ApolloServer({
    typeDefs: mergedTypeDefs,
    resolvers: mergeResolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();

  // 4) Mount GraphQL (and Sandbox) at root
  app.use(
    "/",
    cors({ origin: "http://localhost:3000", credentials: true }),
    expressMiddleware(server, {
      context: async ({ req, res }) => buildContext({ req, res }),
    })
  );

  // 5) Listen
  await new Promise((res) => httpServer.listen({ port: 4000 }, res));
  console.log("🚀 Server ready at http://localhost:4000/");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
