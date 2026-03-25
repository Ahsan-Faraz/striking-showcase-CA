import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.profileView.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.familyAccess.deleteMany();
  await prisma.media.deleteMany();
  await prisma.ballArsenal.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.athleteProfile.deleteMany();
  await prisma.coachProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // --- Admin User ---
  const admin = await prisma.user.create({
    data: {
      email: "diandra@strikingshowcase.com",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // --- Demo Athlete: Autumn Strode ---
  const autumnUser = await prisma.user.create({
    data: {
      email: "autumn@example.com",
      passwordHash,
      role: "ATHLETE",
    },
  });

  const autumn = await prisma.athleteProfile.create({
    data: {
      userId: autumnUser.id,
      firstName: "Autumn",
      lastName: "Strode",
      classYear: 2025,
      state: "Kansas",
      school: "Wichita Heights High School",
      gender: "Female",
      dominantHand: "RIGHT",
      style: "ONE_HANDED",
      bio: "Bowling has been my passion since I was 8 years old. Growing up in Wichita, Kansas, I fell in love with the sport watching my mom compete in her weekend league. Over the past four years, I have dedicated myself to improving every aspect of my game, from my physical approach to my mental game. My season average has climbed from 185 to 213 through disciplined practice and competitive tournament play. I am looking for a collegiate program where I can continue to grow as both an athlete and a student, pursuing my degree in Business Administration while competing at the highest level.",
      seasonAverage: 213.5,
      highGame: 289,
      highSeries: 782,
      revRate: 375,
      ballSpeed: 16.8,
      spareConversion: 87.5,
      pap: "5 3/8 x 3/8 up",
      axisTilt: 12.5,
      axisRotation: 45.0,
      gpa: 3.85,
      act: 28,
      sat: 1280,
      ncaaStatus: "Eligible",
      intendedMajor: "Business Administration",
      usbcId: "USBC-12345678",
      usbcVerified: true,
      coachName: "Mike Johnson",
      coachContact: "mjohnson@heights.ks.edu",
      proShop: "Strike Zone Pro Shop",
      bowlingCenter: "Northrock Lanes",
      isActivelyRecruiting: true,
      profileVisibility: "PUBLIC",
      portfolioLayout: "CLASSIC",
      colorScheme: "MAROON",
      preferredDivisions: ["D1", "D2"],
      preferredRegions: ["Midwest", "Southwest"],
    },
  });

  await prisma.subscription.create({
    data: {
      userId: autumnUser.id,
      plan: "FREE",
      status: "ACTIVE",
    },
  });

  // Autumn's tournaments
  const tournaments = [
    {
      name: "Kansas State Championship",
      place: 2,
      average: 221.3,
      date: "2024-03-15",
      format: "Singles",
    },
    {
      name: "Midwest Junior Gold Qualifier",
      place: 5,
      average: 215.8,
      date: "2024-02-20",
      format: "All-Events",
    },
    {
      name: "Wichita Metro Classic",
      place: 1,
      average: 228.4,
      date: "2024-01-28",
      format: "Singles",
    },
    {
      name: "USBC Junior Gold Championships",
      place: 12,
      average: 208.6,
      date: "2023-07-15",
      format: "All-Events",
    },
    {
      name: "Kansas JBT Regional",
      place: 3,
      average: 219.2,
      date: "2023-11-10",
      format: "Baker",
    },
    {
      name: "Great Plains Invitational",
      place: 4,
      average: 212.7,
      date: "2023-10-05",
      format: "Team",
    },
  ];

  for (const t of tournaments) {
    await prisma.tournament.create({
      data: { athleteId: autumn.id, ...t },
    });
  }

  // Autumn's arsenal
  const arsenal = [
    {
      name: "Hyper Cell Fused",
      brand: "Roto Grip",
      weight: 15,
      condition: "Excellent",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      name: "Phase II",
      brand: "Storm",
      weight: 15,
      condition: "Good",
      isPrimary: false,
      sortOrder: 1,
    },
    {
      name: "Hustle Ink",
      brand: "Roto Grip",
      weight: 15,
      condition: "Excellent",
      isPrimary: false,
      sortOrder: 2,
    },
    {
      name: "Ice Storm",
      brand: "Storm",
      weight: 15,
      condition: "New",
      isPrimary: false,
      sortOrder: 3,
    },
    {
      name: "T-Zone (Spare)",
      brand: "Brunswick",
      weight: 15,
      condition: "Good",
      isPrimary: false,
      sortOrder: 4,
    },
  ];

  for (const ball of arsenal) {
    await prisma.ballArsenal.create({
      data: { athleteId: autumn.id, ...ball },
    });
  }

  console.log("Created athlete: Autumn Strode");

  // --- Demo Coach: Coach Williams ---
  const coachUser = await prisma.user.create({
    data: {
      email: "williams@wichitastate.edu",
      passwordHash,
      role: "COACH",
    },
  });

  const coach = await prisma.coachProfile.create({
    data: {
      userId: coachUser.id,
      school: "Wichita State University",
      division: "D1",
      conference: "American Athletic",
      isVerified: true,
      verifiedAt: new Date(),
      rosterSize: 12,
      openSpots: 3,
    },
  });

  console.log("Created coach: Coach Williams (Wichita State)");

  // --- Sample Message Thread ---
  const thread = await prisma.messageThread.create({
    data: {
      athleteId: autumn.id,
      coachId: coach.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        threadId: thread.id,
        senderId: coachUser.id,
        senderRole: "COACH",
        content:
          "Hi Autumn! I've been following your tournament results and I'm very impressed with your consistency. Your 213 average and 289 high game really caught my attention. Would you be interested in learning more about our program at Wichita State?",
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        threadId: thread.id,
        senderId: autumnUser.id,
        senderRole: "ATHLETE",
        content:
          "Thank you so much, Coach Williams! I would absolutely love to learn more about Wichita State's bowling program. It's actually one of my top choices since it's close to home. When would be a good time to talk?",
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        threadId: thread.id,
        senderId: coachUser.id,
        senderRole: "COACH",
        content:
          "That's great to hear! We have a campus visit day coming up on March 28th. I'd love for you to come see our facilities, meet the team, and we can discuss potential scholarship opportunities. Can you make it?",
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
  });

  // Coach adds Autumn to watchlist
  await prisma.watchlist.create({
    data: {
      coachId: coach.id,
      athleteId: autumn.id,
      notes:
        "Strong right-handed bowler. High average, good academics. Great fit for our program.",
      contacted: true,
    },
  });

  // Profile views for Autumn
  for (let i = 0; i < 15; i++) {
    await prisma.profileView.create({
      data: {
        athleteId: autumn.id,
        viewerType: i % 3 === 0 ? "COACH" : "anonymous",
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30),
      },
    });
  }

  // --- 9 More Demo Athletes ---
  const demoAthletes = [
    {
      first: "Marcus",
      last: "Chen",
      email: "marcus@example.com",
      year: 2025,
      state: "Texas",
      school: "Plano East High",
      gender: "Male",
      hand: "RIGHT" as const,
      style: "TWO_HANDED" as const,
      avg: 225.2,
      high: 300,
      series: 812,
      gpa: 3.6,
      revRate: 480,
      speed: 18.2,
    },
    {
      first: "Sofia",
      last: "Rodriguez",
      email: "sofia@example.com",
      year: 2026,
      state: "Florida",
      school: "Miami Lakes High",
      gender: "Female",
      hand: "RIGHT" as const,
      style: "ONE_HANDED" as const,
      avg: 207.8,
      high: 278,
      series: 745,
      gpa: 3.92,
      revRate: 310,
      speed: 15.5,
    },
    {
      first: "Jake",
      last: "Thompson",
      email: "jake@example.com",
      year: 2025,
      state: "Ohio",
      school: "Centerville High",
      gender: "Male",
      hand: "LEFT" as const,
      style: "ONE_HANDED" as const,
      avg: 218.4,
      high: 290,
      series: 798,
      gpa: 3.45,
      revRate: 365,
      speed: 17.0,
    },
    {
      first: "Aaliyah",
      last: "Washington",
      email: "aaliyah@example.com",
      year: 2026,
      state: "Michigan",
      school: "Detroit Academy",
      gender: "Female",
      hand: "RIGHT" as const,
      style: "TWO_HANDED" as const,
      avg: 211.6,
      high: 285,
      series: 768,
      gpa: 3.78,
      revRate: 420,
      speed: 16.5,
    },
    {
      first: "Ethan",
      last: "Miller",
      email: "ethan@example.com",
      year: 2027,
      state: "Indiana",
      school: "Brownsburg High",
      gender: "Male",
      hand: "RIGHT" as const,
      style: "ONE_HANDED" as const,
      avg: 198.3,
      high: 268,
      series: 720,
      gpa: 3.55,
      revRate: 340,
      speed: 16.8,
    },
    {
      first: "Mia",
      last: "Patel",
      email: "mia@example.com",
      year: 2025,
      state: "California",
      school: "San Jose Prep",
      gender: "Female",
      hand: "LEFT" as const,
      style: "ONE_HANDED" as const,
      avg: 205.1,
      high: 279,
      series: 738,
      gpa: 4.0,
      revRate: 295,
      speed: 15.2,
    },
    {
      first: "Noah",
      last: "Williams",
      email: "noah@example.com",
      year: 2026,
      state: "New York",
      school: "Syracuse Central",
      gender: "Male",
      hand: "RIGHT" as const,
      style: "TWO_HANDED" as const,
      avg: 220.7,
      high: 298,
      series: 805,
      gpa: 3.3,
      revRate: 500,
      speed: 19.0,
    },
    {
      first: "Emma",
      last: "Davis",
      email: "emma@example.com",
      year: 2025,
      state: "Illinois",
      school: "Naperville North",
      gender: "Female",
      hand: "RIGHT" as const,
      style: "ONE_HANDED" as const,
      avg: 216.9,
      high: 287,
      series: 775,
      gpa: 3.72,
      revRate: 350,
      speed: 16.0,
    },
    {
      first: "Liam",
      last: "O'Brien",
      email: "liam@example.com",
      year: 2027,
      state: "Pennsylvania",
      school: "Allentown Central",
      gender: "Male",
      hand: "LEFT" as const,
      style: "TWO_HANDED" as const,
      avg: 195.6,
      high: 265,
      series: 708,
      gpa: 3.88,
      revRate: 450,
      speed: 17.8,
    },
  ];

  for (const a of demoAthletes) {
    const user = await prisma.user.create({
      data: { email: a.email, passwordHash, role: "ATHLETE" },
    });

    await prisma.athleteProfile.create({
      data: {
        userId: user.id,
        firstName: a.first,
        lastName: a.last,
        classYear: a.year,
        state: a.state,
        school: a.school,
        gender: a.gender,
        dominantHand: a.hand,
        style: a.style,
        seasonAverage: a.avg,
        highGame: a.high,
        highSeries: a.series,
        gpa: a.gpa,
        revRate: a.revRate,
        ballSpeed: a.speed,
        isActivelyRecruiting: true,
        profileVisibility: "PUBLIC",
        preferredDivisions: ["D1", "D2"],
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        status: "ACTIVE",
      },
    });

    console.log(`Created athlete: ${a.first} ${a.last}`);
  }

  console.log("\nSeed complete! Login credentials:");
  console.log("  Admin:   diandra@strikingshowcase.com / password123");
  console.log("  Athlete: autumn@example.com / password123");
  console.log("  Coach:   williams@wichitastate.edu / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
