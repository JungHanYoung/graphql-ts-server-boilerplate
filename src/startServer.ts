import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from 'path';
import { createTypeormConn } from "./utils/createTypeormConn";
import * as fs from 'fs';
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import * as Redis from 'ioredis';
import { User } from "./entity/User";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, './modules'));
  folders.forEach(folder => {
    const schema = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`));
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    schemas.push(
      makeExecutableSchema({ typeDefs: schema, resolvers })
    );
  });

  const redis = new Redis();
  
  const server = new GraphQLServer({ 
      schema: mergeSchemas({ schemas })
    , context: ({ request }) => ({ 
          redis
        , url: request.protocol + "://" + request.get('host') 
    })
  });

  server.express.get('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if(userId) {
      await User.update({ id: userId }, { confirmed: true });
      await redis.del(id);
      res.send('ok');
    } else { // 잘못된 uuid로 접근
      res.send('Invalid');
    }
  })

  await createTypeormConn();
  const app = await server.start({ port: process.env.NODE_ENV === 'test' ? 0 : 4000 });
  console.log(`${process.env.NODE_ENV} Server is listening on localhost:4000`);

  return app;
}