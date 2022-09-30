import Connection from "../connection/connection.ts"
import { TMatch } from "../types/match.ts"

export default (await (await Connection.getClient()).database("plant-exchange-db").collection<TMatch>("matches"))