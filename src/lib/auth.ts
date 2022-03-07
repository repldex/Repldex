import jwt from 'jsonwebtoken'
import type { BasicUser } from './database/users'

const secret = process.env['JWT_SECRET']

if (!secret)
	throw new Error(
		"JWT_SECRET environment variable not set. You can generate one by running `require('crypto').randomBytes(64).toString('hex')` in the Node REPL."
	)

type Impossible<K extends keyof any> = {
	[P in K]: never
}
type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>

export function generateToken<T extends BasicUser>(
	// we don't want extra properties in the token, so we use APIUser
	user: NoExtraProperties<BasicUser, T>
): string {
	return jwt.sign(user, secret!, { expiresIn: '90d' })
}

export async function authenticateToken(token: string): Promise<jwt.JwtPayload> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secret!, (err, payload) => {
			if (err) reject(err)
			if (typeof payload === 'string') reject('The payload was not a jwt.JwtPayload')
			else if (payload) resolve(payload)
			else reject(new Error('No payload'))
		})
	})
}