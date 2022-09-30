import { TNonce } from "./nonce.ts"

export type TUser = {
    _id: string
    publicAddress: string,
    nonceId: string
}

export type TUserLookup = {
    _id: string
    publicAddress: string,
    nonceId: string
    nonces: TNonce[]
}

export type TUserJWT = {
    userId: string
    publicAddress: string
}