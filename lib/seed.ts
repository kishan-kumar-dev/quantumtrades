import {prisma} from "./prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "demo@quantumtrades.com" },
    update: {},
    create: {
      email: "demo@quantumtrades.com",
      name: "Demo User",
      password: hashedPassword,
      role: "trader",
    },
  });

  console.log("✅ Demo user created: demo@quantumtrades.com / password123");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
