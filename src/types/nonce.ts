import { UUID } from "https://deno.land/x/web_bson@v0.1.9/mod.ts"

export type TNonce = {
    _id: string,
    value: string
    created_at: Date
}