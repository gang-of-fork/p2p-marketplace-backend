import "https://deno.land/x/dotenv@v3.2.0/load.ts"; //load env
import { json, opine } from "./src/depts.ts";
import { opineCors } from "./src/depts.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts"; //load env
import Routes from './src/routes/routes.ts';
import errorMiddleware from "./src/middleware/errorMiddleware.ts";


const port = parseInt(Deno.env.get("PORT") as string);
const db_uri = Deno.env.get("DB_URL") as string;

if(Number.isNaN(port) || db_uri == "") {
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