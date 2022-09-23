import { dango } from "../../deps.ts"

const userSchema = dango.schema({
    publicAddress: {type: 'string', required: true, unique:true},
    nonce: {type: 'string', required: true}
})

const User = dango.model('users', userSchema)
export default User;