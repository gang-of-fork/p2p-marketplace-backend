import Connection from "../connection/connection.ts"
import { TNonce } from "../types/nonce.ts"

export default (await (await Connection.getClient()).database("plant-exchange-db").collection<TNonce>("nonces"))