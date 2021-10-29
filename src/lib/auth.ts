import jwt from 'jsonwebtoken'

const secret = process.env['JWT_SECRET']

if (!secret)
	throw new Error(
		"JWT_SECRET environment variable not set. You can generate one by running `require('crypto').randomBytes(64).toString('hex')` in Node."
	)

export function generateToken(username: string): string {
	return jwt.sign({ username }, secret!, { expiresIn: '1800s' })
}

export async function authenticateToken(token: string): Promise<jwt.JwtPayload> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secret!, (err, payload) => {
			if (err) reject(err)
			else if (payload) resolve(payload)
			else reject(new Error('No payload'))
		})
	})
}
