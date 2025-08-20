import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/auth.js';

async function main() {
  const pw = await hashPassword('password123')
  await prisma.user.upsert({
    where: { email: 'demo@quantumtrades.com' },
    update: {},
    create: { email: 'demo@quantumtrades.com', name: 'Demo User', password: pw, role: 'trader' }
  })
  console.log('✅ Demo user created: demo@quantumtrades.com / password123')
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
