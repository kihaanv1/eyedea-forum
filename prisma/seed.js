const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma database seeding for IdeaSphere PH...');

  // 1. Delete old test users and create/upsert Owner User kihaan
  await prisma.user.deleteMany({
    where: { username: { not: 'kihaan' } },
  }).catch(() => {});

  const ownerHash = await bcrypt.hash('kianchoi093020', 10);
  const owner = await prisma.user.upsert({
    where: { username: 'kihaan' },
    update: {
      passwordHash: ownerHash,
      role: 'ADMIN',
      reputation: 1000,
    },
    create: {
      username: 'kihaan',
      email: 'kihaan@ideasphere.ph',
      passwordHash: ownerHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Platform Owner & Founder of IdeaSphere PH.',
      reputation: 1000,
    },
  });
  console.log(`👤 Owner created: ${owner.username} (${owner.email})`);

  // 2. Create Categories & Boards
  const categoriesData = [
    {
      name: 'Ideas, Innovations & Startups',
      slug: 'startups-innovations',
      description: 'Brainstorm next-generation products, pitch concepts, and get constructive feedback from builders.',
      icon: 'Lightbulb',
      sortOrder: 1,
      forums: [
        {
          name: 'Startup Pitches & Idea Validation',
          slug: 'pitches-validation',
          description: 'Share your raw concept, value proposition, and get honest critique before writing code.',
          icon: 'Rocket',
        },
        {
          name: 'AI, LLMs & Automation',
          slug: 'ai-innovations',
          description: 'Discussions on AI agents, local models, prompt engineering, and intelligent workflows.',
          icon: 'Bot',
        },
        {
          name: 'Distribution, Growth & Marketing',
          slug: 'growth-marketing',
          description: 'First 100 users, SEO strategies, viral loops, and organic growth playbooks.',
          icon: 'TrendingUp',
        },
      ],
    },
    {
      name: 'Development & Engineering',
      slug: 'development-engineering',
      description: 'Deep technical discussions, code architectures, best practices, and developer tooling.',
      icon: 'Terminal',
      sortOrder: 2,
      forums: [
        {
          name: 'Web & Mobile Engineering',
          slug: 'web-mobile-dev',
          description: 'React, Next.js, TypeScript, Flutter, Tailwind, Node.js, and frontend/backend systems.',
          icon: 'Code2',
        },
        {
          name: 'Project Showcase & Code Review',
          slug: 'project-showcase',
          description: 'Show what you built this weekend, link your GitHub repository, and request feedback.',
          icon: 'Cpu',
        },
      ],
    },
    {
      name: 'The Tambayan & Community Lounge',
      slug: 'community-tambayan',
      description: 'Casual conversations, welcoming new members, philosophy, and official site announcements.',
      icon: 'Coffee',
      sortOrder: 3,
      forums: [
        {
          name: 'Official Announcements & Rules',
          slug: 'announcements-rules',
          description: 'Platform updates, community rules, and guidelines for constructive discussions.',
          icon: 'Bell',
        },
        {
          name: 'General Discussion & Book Club',
          slug: 'general-discussion',
          description: 'Casual chit-chat, book recommendations, productivity debates, and philosophical musings.',
          icon: 'MessageCircle',
        },
      ],
    },
  ];

  for (const catData of categoriesData) {
    const { forums, ...catDetails } = catData;
    const cat = await prisma.category.upsert({
      where: { slug: catDetails.slug },
      update: {},
      create: catDetails,
    });

    for (const f of forums) {
      await prisma.forum.upsert({
        where: { slug: f.slug },
        update: {},
        create: {
          ...f,
          categoryId: cat.id,
        },
      });
    }
  }

  // 3. Create Official Announcement
  await prisma.announcement.create({
    data: {
      title: '🚀 Welcome to IdeaSphere PH! A clean bulletin board for thinkers and builders.',
      content: 'Mabuhay! We created IdeaSphere PH to bring back the golden age of bulletin-board forum communities—focused entirely on sharing intellectual ideas, tech developments, creative work, and startup brainstorming.',
      authorId: owner.id,
      priority: 'INFO',
      isActive: true,
    },
  });

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
