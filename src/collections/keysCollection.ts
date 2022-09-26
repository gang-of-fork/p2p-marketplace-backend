import Connection from "../connection/connection.ts"
import { TKey } from "../types/key.ts"

export default (await (await Connection.getClient()).database("plant-exchange-db").collection<TKey>("keys"))