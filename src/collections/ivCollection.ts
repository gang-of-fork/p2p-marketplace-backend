import Connection from "../connection/connection.ts"
import { TIV } from "../types/iv.ts"

export default (await (await Connection.getClient()).database("plant-exchange-db").collection<TIV>("ivs"))