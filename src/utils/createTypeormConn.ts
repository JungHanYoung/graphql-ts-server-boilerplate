import { getConnectionOptions, createConnection } from "typeorm";

export const createTypeormConn = async () => {
      const connectOptions = await getConnectionOptions(process.env.NODE_ENV);
      return createConnection({ ...connectOptions, name: "default", dropSchema: true });
}