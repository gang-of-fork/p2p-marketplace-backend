import { opine } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { opineCors } from "https://deno.land/x/cors@v1.2.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts"; //load env
import Routes from './routes/routes.ts';

const app = opine();
app.use(opineCors());

const port = parseInt(Deno.env.get("PORT") as string);

//serve backend routes
app.use('/api/v1', Routes);

if(Number.isNaN(port)) {
    console.log("Please set env variables")
    Deno.exit(1);
}

app.listen(
    port,
    () => console.log(`server has started on http://localhost:${port} 🚀`),
);