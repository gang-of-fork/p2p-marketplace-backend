import "https://deno.land/x/dotenv@v3.2.0/load.ts"; //load env
import { json, opine } from "./src/depts.ts";
import { opineCors } from "./src/depts.ts";
import Routes from './src/routes/routes.ts';
import errorMiddleware from "./src/middleware/errorMiddleware.ts";
import { cryptoRandomString } from "https://deno.land/x/crypto_random_string@1.1.0/mod.ts"

//generate JWT_Secret if it's not externally set
if (!Deno.env.get("JWT_SECRET")) {
    const jwtSecret = cryptoRandomString({ length: 64 })
    Deno.env.set("JWT_SECRET", jwtSecret)
}

console.log(Deno.env.get("JWT_SECRET"))

const port = parseInt(Deno.env.get("PORT") as string);
const db_uri = Deno.env.get("DB_URL") as string;

if (Number.isNaN(port) || db_uri == "") {
    console.log("Please set env variables")
    Deno.exit(1);
}


const app = opine();
app.use(opineCors());
app.use(json())


//serve backend routes
app.use('/api/v1', Routes);

app.use(errorMiddleware)


app.listen(
    port,
    () => console.log(`server has started on http://localhost:${port} 🚀`),
);