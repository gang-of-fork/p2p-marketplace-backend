import Connection from "../connection/connection.ts"
import { TUser } from "../types/user.ts"

export default (await (await Connection.getClient()).database("plant-exchange-db").collection<TUser>("users"))