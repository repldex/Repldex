import { MongoClient } from 'mongodb'

const uri = process.env['MONGODB_URI']
const options = {}
let client
let clientPromise
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

export interface Entry {
	title: string
	content: string
	slug: string
}

const dummyEntries: Entry[] = [
	{
		title: 'foobar',
		slug: 'foobar',
		content:
			'The terms foobar (/ˈfuːbɑːr/), foo, bar, baz, and others are used as metasyntactic variables and placeholder names in computer programming or computer-related documentation. They have been used to name entities such as variables, functions, and commands whose exact identity is unimportant and serve only to demonstrate a concept.',
	},
	{
		title: 'Lorem ipsum',
		slug: 'lorem-ipsum',
		content:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras arcu ipsum, rhoncus a augue a, auctor euismod odio. Etiam sit amet vulputate libero. Maecenas eu nulla nibh. Quisque at urna rhoncus, dignissim risus vel, congue nisl. Fusce non maximus lacus. Nunc aliquam nulla a tempor vestibulum. Maecenas laoreet pharetra diam. Donec sit amet lorem a sapien luctus suscipit. Nunc convallis scelerisque massa eu sollicitudin. Phasellus convallis tempus metus, at tempor ligula faucibus sit amet. Nam ut lectus et elit aliquet fermentum. Nullam vehicula mi in dui fermentum, sed cursus sem sollicitudin. Nam sagittis malesuada augue, et finibus est auctor eget.',
	},
]

interface FetchEntriesOptions {
	limit: number
	skip: number
	query?: string
}

/**
 * Fetch a number of entries
 */
export async function fetchEntries(options: FetchEntriesOptions): Promise<Entry[]> {
	return dummyEntries
}

/**
 * Fetch an entry by its slug
 */
export async function fetchEntry(slug: string): Promise<Entry | undefined> {
	return dummyEntries.find(e => e.slug === slug)
}
