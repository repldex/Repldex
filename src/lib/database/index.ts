import { Db, MongoClient } from 'mongodb'

const uri = process.env['MONGODB_URI']

if (!uri) throw new Error('MONGODB_URI environment variable not set')

const options = {}
let client: MongoClient
export let clientPromise: Promise<MongoClient>

if (process.env['NODE_ENV'] === 'development') {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (hot module replacement).
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options)
		global._mongoClientPromise = client.connect()
	}
	clientPromise = global._mongoClientPromise
} else {
	// In production mode, it's best to not use a global variable.
	client = new MongoClient(uri, options)
	clientPromise = client.connect()
}

function flattenObject(obj, sep='.') {
	// not an object, can't be flattened
	if (typeof obj !== 'object')
		return obj

	const result = {}

	for (const [ key, value ] of Object.entries(obj)) {
		if (typeof value === 'object') {
			for (
				const [ innerKey, innerValue ] of Object.entries(flattenObject(value))
			) {
				result[`${key}.${innerKey}`] = innerValue
			}
		} else
			result[key] = value
	}
	return result
}

export async function getDatabase(): Promise<Db> {
	const client = await clientPromise
	return client.db()
}
