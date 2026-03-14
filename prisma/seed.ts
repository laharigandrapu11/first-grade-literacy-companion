import "dotenv/config";
import { PrismaClient, Role, GameMode, MaterialType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed school
  const school = await prisma.school.upsert({
    where: { id: "school-1" },
    update: {},
    create: {
      id: "school-1",
      name: "Sunshine Elementary School",
    },
  });

  // Seed school admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@sunshine.edu" },
    update: {},
    create: {
      email: "admin@sunshine.edu",
      password: adminPassword,
      name: "Principal Rivera",
      role: Role.SCHOOL_ADMIN,
      schoolId: school.id,
    },
  });

  // Seed teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: "lahari@sunshine.edu" },
    update: {},
    create: {
      email: "lahari@sunshine.edu",
      password: await bcrypt.hash("lahari123", 10),
      name: "Lahari",
      role: Role.TEACHER,
      schoolId: school.id,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "mr.smith@sunshine.edu" },
    update: {},
    create: {
      email: "mr.smith@sunshine.edu",
      password: await bcrypt.hash("teacher123", 10),
      name: "Mr. Smith",
      role: Role.TEACHER,
      schoolId: school.id,
    },
  });

  // Seed materials
  const wordListMaterial = await prisma.material.upsert({
    where: { id: "material-words-1" },
    update: {},
    create: {
      id: "material-words-1",
      title: "Basic Sight Words - Set 1",
      type: MaterialType.WORD_LIST,
      difficulty: 1,
      content: {
        words: [
          { word: "the", emoji: "👆" },
          { word: "and", emoji: "🔗" },
          { word: "see", emoji: "👀" },
          { word: "run", emoji: "🏃" },
          { word: "cat", emoji: "🐱" },
          { word: "dog", emoji: "🐶" },
          { word: "big", emoji: "🐘" },
          { word: "red", emoji: "🔴" },
          { word: "sun", emoji: "☀️" },
          { word: "fun", emoji: "🎉" },
          { word: "hat", emoji: "🎩" },
          { word: "map", emoji: "🗺️" },
          { word: "hop", emoji: "🐸" },
          { word: "sit", emoji: "🪑" },
          { word: "bat", emoji: "🦇" },
          { word: "cup", emoji: "☕" },
          { word: "bus", emoji: "🚌" },
          { word: "bug", emoji: "🐛" },
          { word: "mud", emoji: "💧" },
          { word: "pop", emoji: "🎈" },
        ],
      },
    },
  });

  const wordListMaterial2 = await prisma.material.upsert({
    where: { id: "material-words-2" },
    update: {},
    create: {
      id: "material-words-2",
      title: "Sight Words - Set 2 (Advanced)",
      type: MaterialType.WORD_LIST,
      difficulty: 3,
      content: {
        words: [
          { word: "play", emoji: "🎮" },
          { word: "jump", emoji: "🦘" },
          { word: "help", emoji: "🤝" },
          { word: "look", emoji: "🔍" },
          { word: "come", emoji: "👋" },
          { word: "make", emoji: "🔨" },
          { word: "said", emoji: "💬" },
          { word: "went", emoji: "🚶" },
          { word: "good", emoji: "👍" },
          { word: "find", emoji: "🔎" },
        ],
      },
    },
  });

  const bookMaterial1 = await prisma.material.upsert({
    where: { id: "material-book-1" },
    update: {},
    create: {
      id: "material-book-1",
      title: "The Little Red Hen",
      type: MaterialType.BOOK,
      difficulty: 2,
      content: {
        pages: [
          {
            text: "Once upon a time, a little red hen lived on a farm. She found some wheat seeds on the ground.",
            vocabularyWords: ["wheat", "seeds", "farm"],
          },
          {
            text: "She asked her friends for help. 'Who will help me plant the seeds?' she asked. But none of her friends wanted to help.",
            vocabularyWords: ["plant", "friends"],
          },
          {
            text: "The little red hen planted the seeds herself. She watered them every day. The seeds grew into tall stalks of wheat.",
            vocabularyWords: ["planted", "watered", "stalks"],
          },
          {
            text: "Finally, she baked the wheat into a loaf of bread. It smelled delicious! Now all her friends wanted some.",
            vocabularyWords: ["baked", "loaf", "delicious"],
          },
        ],
        questions: [
          {
            question: "What did the little red hen find?",
            options: ["Wheat seeds", "A big cake", "A toy ball", "Some flowers"],
            answer: 0,
          },
          {
            question: "Did her friends help her plant the seeds?",
            options: ["Yes, they all helped", "No, nobody helped", "Only the dog helped", "Only the cat helped"],
            answer: 1,
          },
          {
            question: "What did the little red hen make at the end?",
            options: ["A soup", "A sandwich", "A loaf of bread", "A cookie"],
            answer: 2,
          },
        ],
      },
    },
  });

  const bookMaterial2 = await prisma.material.upsert({
    where: { id: "material-book-2" },
    update: {},
    create: {
      id: "material-book-2",
      title: "The Big Blue Sea",
      type: MaterialType.BOOK,
      difficulty: 1,
      content: {
        pages: [
          {
            text: "The sea is big and blue. Many fish live in the sea.",
            vocabularyWords: ["sea", "fish"],
          },
          {
            text: "A little fish swims fast. She jumps over the waves.",
            vocabularyWords: ["swims", "waves"],
          },
          {
            text: "The little fish finds a shell. The shell is pink and shiny.",
            vocabularyWords: ["shell", "shiny"],
          },
        ],
        questions: [
          {
            question: "What color is the sea?",
            options: ["Red", "Green", "Blue", "Yellow"],
            answer: 2,
          },
          {
            question: "What does the little fish find?",
            options: ["A rock", "A shell", "A boat", "A starfish"],
            answer: 1,
          },
          {
            question: "What color is the shell?",
            options: ["Blue", "Green", "Yellow", "Pink"],
            answer: 3,
          },
        ],
      },
    },
  });

  // Seed classes
  const class1 = await prisma.class.upsert({
    where: { id: "class-1" },
    update: {},
    create: {
      id: "class-1",
      name: "Room 101 - Bluebirds",
      teacherId: teacher1.id,
      schoolId: school.id,
    },
  });

  const class2 = await prisma.class.upsert({
    where: { id: "class-2" },
    update: {},
    create: {
      id: "class-2",
      name: "Room 102 - Sunflowers",
      teacherId: teacher1.id,
      schoolId: school.id,
    },
  });

  const class3 = await prisma.class.upsert({
    where: { id: "class-3" },
    update: {},
    create: {
      id: "class-3",
      name: "Room 103 - Rainbows",
      teacherId: teacher1.id,
      schoolId: school.id,
    },
  });

  // Seed students for class1
  const studentNames1 = ["Aiden", "Bella", "Carlos", "Diana", "Ethan", "Fiona", "George", "Hannah"];
  for (let i = 0; i < studentNames1.length; i++) {
    await prisma.student.upsert({
      where: { id: `student-c1-${i}` },
      update: {},
      create: {
        id: `student-c1-${i}`,
        name: studentNames1[i],
        classId: class1.id,
      },
    });
  }

  // Seed students for class2
  const studentNames2 = ["Ivan", "Julia", "Kevin", "Lily", "Marco", "Nina", "Oscar", "Priya"];
  for (let i = 0; i < studentNames2.length; i++) {
    await prisma.student.upsert({
      where: { id: `student-c2-${i}` },
      update: {},
      create: {
        id: `student-c2-${i}`,
        name: studentNames2[i],
        classId: class2.id,
      },
    });
  }

  // Seed students for class3
  const studentNames3 = ["Quinn", "Rosa", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander"];
  for (let i = 0; i < studentNames3.length; i++) {
    await prisma.student.upsert({
      where: { id: `student-c3-${i}` },
      update: {},
      create: {
        id: `student-c3-${i}`,
        name: studentNames3[i],
        classId: class3.id,
      },
    });
  }

  // Seed assignments
  await prisma.assignment.upsert({
    where: { id: "assignment-1" },
    update: {},
    create: {
      id: "assignment-1",
      mode: GameMode.WORDS,
      targetScore: 8,
      classId: class1.id,
      materialId: wordListMaterial.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.assignment.upsert({
    where: { id: "assignment-2" },
    update: {},
    create: {
      id: "assignment-2",
      mode: GameMode.BOOKS,
      targetScore: 2,
      classId: class1.id,
      materialId: bookMaterial1.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.assignment.upsert({
    where: { id: "assignment-3" },
    update: {},
    create: {
      id: "assignment-3",
      mode: GameMode.LETTERS,
      targetScore: 20,
      classId: class2.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed some game sessions for demo data
  const students = await prisma.student.findMany({ where: { classId: class1.id } });
  const gameModes = [GameMode.LETTERS, GameMode.WORDS, GameMode.BOOKS];

  for (const student of students) {
    const numSessions = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numSessions; i++) {
      const mode = gameModes[Math.floor(Math.random() * gameModes.length)];
      const maxScore = mode === GameMode.BOOKS ? 3 : mode === GameMode.WORDS ? 10 : 26;
      const score = Math.floor(Math.random() * maxScore);
      await prisma.gameSession.create({
        data: {
          studentId: student.id,
          mode,
          score,
          maxScore,
          duration: Math.floor(Math.random() * 300) + 60,
          completed: score > maxScore * 0.5,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("✅ Seed completed");
  console.log("   School Admin: admin@sunshine.edu / admin123");
  console.log("   Teacher 1:    lahari@sunshine.edu / lahari123");
  console.log("   Teacher 2:    mr.smith@sunshine.edu / teacher123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
