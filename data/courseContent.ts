import { Course, CourseChapter, QuizQuestion } from '@/types/course';

const chapter1Questions: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is the correct order of the four phases in this quitting cannabis course?',
    options: [
      'Awareness, Detox, Habit Change, Long-term Maintenance',
      'Detox, Awareness, Habit Change, Long-term Maintenance',
      'Awareness, Habit Change, Detox, Long-term Maintenance',
      'Detox, Habit Change, Awareness, Long-term Maintenance'
    ],
    correctAnswer: 'Awareness, Detox, Habit Change, Long-term Maintenance'
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'According to the course, when do most physical withdrawal symptoms typically peak?',
    options: [
      'Day 1-2',
      'Day 3-4',
      'Day 7-10',
      'Week 2-3'
    ],
    correctAnswer: 'Day 3-4'
  },
  {
    id: 'q3',
    type: 'multi-select',
    question: 'Which of the following are identified in the course as common reasons people quit cannabis? (Select all that apply)',
    options: [
      'Financial strain from spending $200-400 monthly',
      'Career stagnation due to persistent brain fog',
      'Pressure from law enforcement',
      'Relationship tension with partners',
      'Life transitions like pregnancy or new jobs',
      'Peer pressure from friends who still use'
    ],
    correctAnswer: [
      'Financial strain from spending $200-400 monthly',
      'Career stagnation due to persistent brain fog',
      'Relationship tension with partners',
      'Life transitions like pregnancy or new jobs'
    ]
  },
  {
    id: 'q4',
    type: 'matching',
    question: 'Match each course phase with its primary focus:',
    matches: {
      concepts: [
        { id: 'c1', text: 'Awareness (Weeks 1-2)' },
        { id: 'c2', text: 'Detox (Weeks 3-6)' },
        { id: 'c3', text: 'Habit Change (Weeks 7-12)' },
        { id: 'c4', text: 'Long-term Maintenance (Months 3-12+)' }
      ],
      definitions: [
        { id: 'd1', text: 'Getting honest about why you use cannabis and whether it aligns with who you want to be' },
        { id: 'd2', text: 'Managing withdrawal symptoms while your brain remodels itself' },
        { id: 'd3', text: 'Replacing old patterns and relearning how to handle stress without cannabis' },
        { id: 'd4', text: 'Building a life where cannabis feels irrelevant' }
      ],
      correctPairs: [
        { conceptId: 'c1', definitionId: 'd1' },
        { conceptId: 'c2', definitionId: 'd2' },
        { conceptId: 'c3', definitionId: 'd3' },
        { conceptId: 'c4', definitionId: 'd4' }
      ]
    }
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    question: 'According to the course, how long does true brain recovery typically take after quitting cannabis?',
    options: [
      '1-2 weeks',
      '30 days',
      '3-6 months',
      '12-18 months'
    ],
    correctAnswer: '3-6 months'
  },
  {
    id: 'q6',
    type: 'multi-select',
    question: 'Which benefits do former users consistently report within the first month of quitting, according to the course? (Select all that apply)',
    options: [
      'Dramatic dream return with vivid, restorative sleep',
      'Complete elimination of all anxiety',
      'Financial breathing room from savings',
      'Energy restoration and productive mornings',
      'Memory improvements for names and conversations',
      'Immediate weight loss'
    ],
    correctAnswer: [
      'Dramatic dream return with vivid, restorative sleep',
      'Financial breathing room from savings',
      'Energy restoration and productive mornings',
      'Memory improvements for names and conversations'
    ]
  },
  {
    id: 'q7',
    type: 'multiple-choice',
    question: 'Why does the course identify the Habit Change phase (Weeks 7-12) as where most people stumble?',
    options: [
      'Physical withdrawal symptoms are most intense during this period',
      'Social pressure to resume use is strongest at this time',
      'The brain is relearning how to handle stress and boredom without cannabis, requiring new patterns',
      'This is when most people run out of willpower'
    ],
    correctAnswer: 'The brain is relearning how to handle stress and boredom without cannabis, requiring new patterns'
  },
  {
    id: 'q8',
    type: 'multiple-choice',
    question: 'How does this course differ from generic "just say no" approaches to quitting cannabis?',
    options: [
      'It emphasizes willpower and self-discipline as the primary tools',
      'It requires medical supervision and prescription medications',
      'It\'s built on neuroscience and acknowledges cannabis benefits while teaching alternatives without the costs',
      'It focuses solely on the negative consequences of cannabis use'
    ],
    correctAnswer: 'It\'s built on neuroscience and acknowledges cannabis benefits while teaching alternatives without the costs'
  },
  {
    id: 'q9',
    type: 'multiple-choice',
    question: 'According to the course guidance, how much time should you expect to spend daily on course activities like journaling, breathing exercises, and planning?',
    options: [
      '5-10 minutes',
      '15-30 minutes',
      '45-60 minutes',
      'At least 2 hours'
    ],
    correctAnswer: '15-30 minutes'
  }
];

const chapter1: CourseChapter = {
  id: 'chapter-1',
  number: 1,
  title: 'Quitting Cannabis',
  subtitle: 'A complete guide to quitting cannabis and building a weed-free life.',
  description: 'Start your journey toward a cannabis-free life with science-based strategies and practical tools.',
  sections: [
    {
      id: 'section-1-1',
      title: 'Welcome and Course Overview',
      content: `Welcome to your journey toward a weed-free life. This course is your roadmap from realizing cannabis isn't serving you anymore to building a life where you don't need it. Think of it as a GPS for your brain—guiding you through the twists and turns of quitting while helping you avoid the common detours that send people back to square one.

## Your Journey Through Four Phases

The course follows a natural progression that mirrors how real change happens in your brain and life. Each phase builds on the previous one, creating momentum that carries you forward.

**Awareness (Weeks 1-2):** This isn't about judgment—it's about getting honest with yourself. You'll explore why you use cannabis, what it's actually doing for you, and whether it aligns with who you want to be. Expect some uncomfortable realizations here, but also the first taste of clarity that makes everything else possible.

**Detox (Weeks 3-6):** Your brain is remodeling itself. During these weeks, you'll experience withdrawal symptoms that range from annoying to intense. The science shows most physical symptoms peak around day 3-4, but psychological ones can linger. You'll learn specific strategies for managing insomnia, irritability, and anxiety without reaching for the pipe.

**Habit Change (Weeks 7-12):** This is where most people stumble. Your brain is relearning how to handle stress, boredom, and social situations without cannabis. You'll replace old patterns with new ones—like learning to drive stick after years in an automatic. The dopamine system that cannabis hijacked needs time to recalibrate, so we'll focus on activities that naturally boost your mood.

**Long-term Maintenance (Months 3-12 and beyond):** Relapse prevention isn't about white-knuckling through cravings forever. It's about building a life where cannabis feels irrelevant. You'll develop systems for handling triggers, create new social connections, and discover that your reasons for quitting become your motivation to stay quit.

/highlight
The Reality of Recovery Timelines
Most people feel significantly better after 30 days, but true brain recovery takes 3-6 months. Don't panic if you still have cravings months in—this is normal, not a sign you're failing.
/endhighlight

## How to Use This Course Effectively

This isn't a book to read cover-to-cover. Each module includes practical exercises that rewire your brain's relationship with cannabis. Expect to spend 15-30 minutes daily on activities like journaling prompts, breathing exercises, or planning responses to high-risk situations. The research on habit change shows that consistent, small actions beat sporadic heroic efforts every time.

Download the companion app for daily check-ins and craving management tools. The course works offline for when you're in a tough spot without internet access. Each lesson includes a "TL;DR" summary for when your brain feels foggy, plus deeper explanations when you're ready to understand the science behind why these strategies work.

Your progress isn't linear. Some weeks you'll feel unstoppable; others, you'll question everything. That's normal. The course includes specific protocols for handling setbacks without spiraling into shame or giving up entirely.

## Course Structure and Expectations
### What Makes This Different

Unlike generic "just say no" approaches, this course is built on neuroscience and addiction research. You'll understand exactly what cannabis does to your brain's natural systems, why quitting feels harder than it "should," and how to work with your biology instead of against it.

The course includes real conversations about the benefits you get from cannabis—because pretending it doesn't help is a recipe for relapse. Instead, you'll learn alternative ways to achieve those same benefits without the costs to your memory, motivation, and mental health.

You'll also find strategies for different quitting styles. Maybe you need to taper gradually. Maybe cold turkey works for you. The course adapts to your situation while maintaining the structure that keeps you moving forward.

### Setting Yourself Up for Success

Before diving in, take 10 minutes to set up your environment for success. Delete dealer contacts. Tell one trusted person about your plan. Stock your kitchen with foods that help with withdrawal symptoms. Most importantly, schedule your first week of lessons like important appointments—you're learning to show up for yourself in a whole new way.

The journey ahead isn't easy, but it's worth it. Thousands have walked this path before you, and the science is clear: with the right support and strategies, you can build a life where cannabis simply isn't part of the equation anymore.`,
      readTime: '8 min',
      xpReward: 50
    },
    {
      id: 'section-1-2',
      title: 'Why People Quit Cannabis',
      content: `People quit cannabis for reasons as unique as their fingerprints, yet certain patterns emerge again and again. Some wake up foggy-headed for the thousandth morning and realize the "chill plant" has become their jailer. Others watch friends build careers while they're stuck on the couch, or they simply can't afford the mental haze anymore when life demands peak performance.

## The Motivation Moment

Most quitting stories share a spark—a moment when the costs finally outweigh the benefits. Sarah, a 28-year-old graphic designer, describes watching her non-smoking friends plan weekend hikes while she cancelled plans to stay home and smoke. "I realized I was living in grayscale while everyone else was in color," she says. Motivation to quit often crystallizes during these moments of stark comparison.

The reasons cluster into several categories:

• **Financial strain:** Spending $200-400 monthly on cannabis while struggling with rent
• **Career stagnation:** Missing promotions or opportunities due to persistent brain fog
• **Relationship tension:** Partners feeling emotionally disconnected from the "stoned version"
• **Health concerns:** Developing anxiety, memory issues, or respiratory problems
• **Life transitions:** Pregnancy, new jobs, or simply outgrowing the lifestyle

/highlight
The Tipping Point
Most successful quitters don't wait until they hit "rock bottom." Instead, they recognize when cannabis stops serving them and starts extracting a daily tax on their potential.
/endhighlight

## Common Quitting Triggers

Addiction rarely announces itself with dramatic intervention scenes. More often, it's a quiet accumulation of moments that erode the appeal. Tom, 34, quit after his daughter asked why daddy always needed to "step outside" before playing. "That question gutted me," he remembers. "I wasn't present for the moments that mattered."

Many cite the "Sunday Scaries"—that anxious feeling creeping in Sunday evening—as their breaking point. The pattern becomes clear: weekend smoking bleeds into Monday morning fog, Tuesday irritability, Wednesday cravings, and by Thursday they're planning the next weekend's supply. This weekly cycle traps users in a loop where cannabis becomes both problem and supposed solution.

Social pressures also shift. Early twenties might revolve around smoke sessions, but by thirty, friend groups change. Non-smoking colleagues invite you to morning workouts, networking events, or family gatherings where showing up high feels inappropriate. The social cost compounds as responsibilities increase.

## The Benefits That Motivate

Former users consistently report similar improvements, creating a compelling case for change. Within the first month, most experience:

• **Dramatic dream return:** Vivid, restorative sleep replaces the cannabis blackout
• **Financial breathing room:** An extra $300 monthly suddenly available for goals
• **Emotional clarity:** Feelings become manageable rather than overwhelming
• **Energy restoration:** Mornings become productive rather than recovery periods
• **Memory improvements:** Names, appointments, and conversations stick again

Lisa, 42, describes the change: "After three months clean, I read three books, started jogging, and actually remembered my nephew's birthday without Facebook reminding me. These seem like small wins, but they represent getting my life back."

The recovery timeline varies, but most report the most dramatic improvements in the first 90 days. Sleep normalizes, anxiety decreases, and the brain's natural reward system begins resetting. Many describe feeling "emotionally reborn"—experiencing joy, sadness, and excitement with a clarity they'd forgotten existed.

## Finding Your Personal Reasons

Generic lists rarely inspire lasting change. The key is connecting benefits to your specific situation. Someone managing anxiety might focus on how cannabis actually increases anxiety long-term through rebound effects. A creative professional might examine how the drug that once enhanced creativity now blocks it.

James, a 31-year-old teacher, created a "cost-benefit inventory" before quitting. His list included: "Benefit: relaxes me after work. Cost: I'm too foggy to grade papers effectively, creating more stress tomorrow." Seeing the cycle clearly provided motivation when cravings hit.

Your reasons don't need dramatic—they need to matter to you. Maybe it's playing with your kids without getting winded, remembering conversations with your partner, or simply waking up clear-headed. The most powerful motivations often emerge from imagining your life six months after quitting: how you'll feel, what you'll accomplish, who you'll become.`,
      readTime: '10 min',
      xpReward: 50
    }
  ],
  quiz: {
    title: 'Course Structure, Quitting Motivations, and Recovery Expectations',
    description: 'This knowledge check assesses understanding of the course\'s four-phase structure, realistic recovery timelines, common reasons people quit cannabis, and the process of identifying personal motivations for change.',
    questions: chapter1Questions,
    passingScore: 70,
    xpReward: 100
  },
  locked: false,
  icon: '🌱'
};

// Placeholder chapters
const createPlaceholderChapter = (num: number): CourseChapter => ({
  id: `chapter-${num}`,
  number: num,
  title: `Chapter ${num}`,
  subtitle: 'Coming Soon',
  description: 'This chapter will be available after completing the previous chapter.',
  sections: [],
  quiz: {
    title: `Chapter ${num} Quiz`,
    description: 'Complete the previous chapters to unlock this quiz.',
    questions: [],
    passingScore: 70,
    xpReward: 100
  },
  locked: true,
  icon: '🔒'
});

export const courseData: Course = {
  id: 'quit-cannabis-course',
  title: 'Quit Cannabis: Your Complete Guide',
  description: 'A comprehensive, science-based course to help you quit cannabis and build a fulfilling life without it.',
  chapters: [
    chapter1,
    ...Array.from({ length: 12 }, (_, i) => createPlaceholderChapter(i + 2))
  ]
};

export const getCourseChapter = (chapterNumber: number): CourseChapter | undefined => {
  return courseData.chapters.find(chapter => chapter.number === chapterNumber);
};

export const getChapterSection = (chapterNumber: number, sectionId: string): CourseSection | undefined => {
  const chapter = getCourseChapter(chapterNumber);
  return chapter?.sections.find(section => section.id === sectionId);
};
