import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

import mergeResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { connectDB } from "./db/connectDB.js";
dotenv.config();

async function bootstrap() {
  // 1) Connect to Mongo
  await connectDB();

  // 2) Set up Express + middleware
  const app = express();
  app.use(cors());
  app.use(express.json());

  const httpServer = http.createServer(app);

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
    expressMiddleware(server, {
      context: ({ req }) => ({ req }),
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
