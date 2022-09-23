import Connection from "../connection/connection.ts"

export default (await (await Connection.getClient()).database("plant-exchange-db").collection("users"))