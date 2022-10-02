import { MongoClient } from "../../deps.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts"; //load env
import { Mutex } from "https://cdn.skypack.dev/async-mutex";
export default class Connection {
  private static client: MongoClient;
  private static mutex = new Mutex("");
  public static async getClient() {
    return await <MongoClient> Connection.mutex.runExclusive(async () => {
      if (!Connection.client) {
        Connection.client = new MongoClient();
        await Connection.client.connect(Deno.env.get("DB_URL") as string);
      }
      return Connection.client;
    });
  }
}
