import bcrypt from 'bcryptjs'
import { connectDatabase } from '../src/config/database.js'
import { env } from '../src/config/env.js'
import Membership from '../src/models/Membership.js'
import Organization from '../src/models/Organization.js'
import User from '../src/models/User.js'

if (env.nodeEnv === 'production') {
  throw new Error('Test accounts cannot be seeded in production')
}

const connected = await connectDatabase()
if (!connected) {
  throw new Error('MongoDB is unavailable. Check MONGO_URI or MONGODB_URI.')
}

const testUsers = [
  {
    name: 'Taylor Teamlead',
    email: 'teamlead@trackvault.local',
    password: 'TeamLead!2026',
    role: 'approver',
    department: 'Operations',
  },
  {
    name: 'Morgan Member',
    email: 'member@trackvault.local',
    password: 'Member!2026',
    role: 'employee',
    department: 'Operations',
  },
]

const users = new Map()
for (const testUser of testUsers) {
  const passwordHash = await bcrypt.hash(testUser.password, 12)
  const user = await User.findOneAndUpdate(
    { email: testUser.email },
    {
      $set: {
        name: testUser.name,
        passwordHash,
        role: testUser.role,
        department: testUser.department,
        isActive: true,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  )
  users.set(testUser.email, user)
}

const organization = await Organization.findOneAndUpdate(
  { slug: 'trackvault-development' },
  {
    $setOnInsert: {
      name: 'TrackVault Development',
      slug: 'trackvault-development',
      createdBy: users.get('teamlead@trackvault.local')._id,
    },
  },
  { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
)

for (const testUser of testUsers) {
  await Membership.findOneAndUpdate(
    { organization: organization._id, user: users.get(testUser.email)._id },
    {
      $set: {
        role: testUser.role,
        department: testUser.department,
        isActive: true,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  )
}

console.info('Development workspace and test memberships are ready.')
process.exit(0)
