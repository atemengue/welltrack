import { PrismaClient, TrackingType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Default Symptoms ──────────────────────────────────────────────────────
  const defaultSymptoms = [
    { name: 'Headache', category: 'neurological' },
    { name: 'Fatigue', category: 'general' },
    { name: 'Joint Pain', category: 'pain' },
    { name: 'Muscle Pain', category: 'pain' },
    { name: 'Nausea', category: 'digestive' },
    { name: 'Brain Fog', category: 'neurological' },
    { name: 'Dizziness', category: 'neurological' },
    { name: 'Insomnia', category: 'sleep' },
    { name: 'Anxiety', category: 'mental' },
    { name: 'Stomach Pain', category: 'digestive' },
    { name: 'Back Pain', category: 'pain' },
  ];

  const existingSymptomCount = await prisma.symptom.count({ where: { userId: null } });
  if (existingSymptomCount === 0) {
    await prisma.symptom.createMany({ data: defaultSymptoms });
    console.log(`Seeded ${defaultSymptoms.length} default symptoms`);
  } else {
    console.log('Default symptoms already seeded, skipping');
  }

  // ── Default Habits ────────────────────────────────────────────────────────
  const defaultHabits = [
    { name: 'Sleep Duration', trackingType: TrackingType.duration, unit: 'hours' },
    { name: 'Water Intake', trackingType: TrackingType.numeric, unit: 'glasses' },
    { name: 'Exercise', trackingType: TrackingType.boolean, unit: null },
    { name: 'Alcohol', trackingType: TrackingType.boolean, unit: null },
    { name: 'Caffeine', trackingType: TrackingType.numeric, unit: 'cups' },
  ];

  const existingHabitCount = await prisma.habit.count({ where: { userId: null } });
  if (existingHabitCount === 0) {
    await prisma.habit.createMany({ data: defaultHabits });
    console.log(`Seeded ${defaultHabits.length} default habits`);
  } else {
    console.log('Default habits already seeded, skipping');
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
