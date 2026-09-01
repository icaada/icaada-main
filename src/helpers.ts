export const photos = {
  hero: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=85",
  youth:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
  workshop:
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=85",
  portrait:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=85",
  community:
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=85",
  hands:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85",
  classroom:
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=85",
  meeting:
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85",
};

export const events = [
  { slug: 'youth-voices-summit-2025', month: 'NOV', day: '14', year: '2025', type: 'Summit', title: 'Youth Voices Summit: From conversation to action', location: 'Lagos, Nigeria', description: 'A working session for young people, educators and decision-makers designing healthier futures together.' },
  { slug: 'community-champions-training', month: 'OCT', day: '08', year: '2025', type: 'Training', title: 'Community Champions facilitator training', location: 'Abeokuta, Ogun State', description: 'Two days of practical tools for community leaders who want to build safer, more supportive spaces.' },
  { slug: 'world-mental-health-day-dialogue', month: 'OCT', day: '10', year: '2025', type: 'Dialogue', title: 'Care, connection and the courage to ask for help', location: 'Online + Abuja hub', description: 'An open conversation about mental health, substance use and the support systems that make recovery possible.' },
  { slug: 'school-partners-roundtable', month: 'SEP', day: '22', year: '2025', type: 'Roundtable', title: 'School partners roundtable', location: 'Lagos, Nigeria', description: 'A closed learning exchange for school owners, counsellors and youth-serving organisations.' },
];

export const team = [
  { slug: 'dr-amaka-nwosu', name: 'Dr Amaka Nwosu', role: 'Executive Director', initials: 'AN', image: photos.portrait, bio: 'Public health practitioner and community organiser with two decades of experience building practical prevention systems in Nigeria.' },
  { slug: 'tunde-adebayo', name: 'Tunde Adebayo', role: 'Director, Programmes', initials: 'TA', image: photos.meeting, bio: 'Leads ICAADA’s youth and community programmes, with a focus on peer learning and accountable partnerships.' },
  { slug: 'amina-yusuf', name: 'Amina Yusuf', role: 'Research & Learning Lead', initials: 'AY', image: photos.classroom, bio: 'Translates local evidence and young people’s lived experience into useful insight for institutions.' },
  { slug: 'ifeoma-okeke', name: 'Ifeoma Okeke', role: 'Partnerships Manager', initials: 'IO', image: photos.hands, bio: 'Builds the relationships that help ideas travel from a community room into policy and practice.' },
  { slug: 'samuel-obi', name: 'Samuel Obi', role: 'Community Engagement Lead', initials: 'SO', image: photos.community, bio: 'A trained facilitator who works with local leaders, families and volunteers across the South West.' },
  { slug: 'zainab-bello', name: 'Zainab Bello', role: 'Youth Advisory Chair', initials: 'ZB', image: photos.youth, bio: 'A youth advocate and storyteller ensuring programmes are designed with young people, not simply for them.' },
];

export const news = [
  { slug: 'what-we-heard-from-240-young-people', category: 'Research', date: '18 June 2025', title: 'What we heard from 240 young people about asking for help', excerpt: 'Our latest listening work points to trust, privacy and practical support as the foundations of early help.', image: photos.workshop, read: '6 min read' },
  { slug: 'community-champions-reach-ogun', category: 'Field notes', date: '02 May 2025', title: 'In Ogun, community champions are making room for honest conversations', excerpt: 'A field note from the first six months of our locally led prevention programme.', image: photos.community, read: '4 min read' },
  { slug: 'why-prevention-belongs-in-every-school', category: 'Perspective', date: '11 March 2025', title: 'Why prevention belongs in every school conversation', excerpt: 'A school is more than a place to pass exams. It is one of the first places a young person learns who they can trust.', image: photos.classroom, read: '5 min read' },
  { slug: 'icaada-joins-national-learning-network', category: 'ICAADA news', date: '24 January 2025', title: 'ICAADA joins national learning network on substance use prevention', excerpt: 'We are joining peers across Nigeria to share what works, what does not and what must change.', image: photos.meeting, read: '3 min read' },
];

export const mediaItems = [
  { type: 'Photo essay', title: 'A Saturday in the listening lab', date: 'June 2025', image: photos.workshop, description: 'Young people map the support systems around them.' },
  { type: 'Video', title: 'Small steps, real support', date: 'May 2025', image: photos.youth, description: 'A short film about the people behind early help.', video: true },
  { type: 'Publication', title: 'Designing for trust', date: 'April 2025', image: photos.classroom, description: 'A practical briefing for youth-serving organisations.' },
  { type: 'Audio', title: 'The work of staying connected', date: 'March 2025', image: photos.community, description: 'A conversation with two Community Champions.', video: true },
  { type: 'Photo essay', title: 'Community is a verb', date: 'February 2025', image: photos.hands, description: 'Scenes from a neighbourhood outreach day.' },
  { type: 'Publication', title: 'A guide for caring conversations', date: 'January 2025', image: photos.meeting, description: 'A simple starting point for families and educators.' },
];

export const workAreas = [
  {
    title: "Prevention & awareness",
    description:
      "Practical, age-appropriate conversations that help people make informed choices before harm takes root.",
  },
  {
    title: "Research & learning",
    description:
      "Locally grounded evidence that helps institutions understand what young people and communities actually need.",
  },
  {
    title: "Training & capacity",
    description:
      "Equipping teachers, health workers, parents and peer leaders to respond with skill and care.",
  },
  {
    title: "Community outreach",
    description:
      "Taking trusted information and support into schools, neighbourhoods, faith spaces and workplaces.",
  },
  {
    title: "Advocacy & systems",
    description:
      "Working with government and partners to make prevention and recovery part of public life.",
  },
  {
    title: "Recovery support",
    description:
      "Walking alongside people and families with dignity, referral pathways and a belief in fresh starts.",
  },
];

export const programs = [
  {
    title: "Safe Spaces, Strong Futures",
    tag: "Youth leadership",
    description:
      "A peer-led learning programme across secondary schools in Lagos and Ogun states.",
    image: photos.youth,
  },
  {
    title: "Community Champions",
    tag: "Capacity building",
    description:
      "Training local leaders to spot risk, open conversations and connect families to support.",
    image: photos.community,
  },
  {
    title: "The Listening Lab",
    tag: "Research",
    description:
      "A youth advisory and research platform turning lived experience into better policy and practice.",
    image: photos.workshop,
  },
];

export const heroSlides = [
    {
      eyebrow: "Prevention & awareness",
      title: "Building healthier communities.",
      description:
        "ICAADA works to prevent substance use harm through awareness, education and community action.",
      image: photos.hero,
      alt: "African children and young people gathered outdoors in a community setting",
      location: "Lagos · Nigeria",
      primary: { label: "Explore our work", href: "/our-work" },
      secondary: { label: "How we work", href: "/about" },
    },
    {
      eyebrow: "Youth empowerment",
      title: "Protecting the future starts with our young people.",
      description:
        "We equip young people with knowledge, opportunity and the confidence to make healthier choices.",
      image: photos.youth,
      alt: "African young people standing together and smiling at a community gathering",
      location: "Ogun · Nigeria",
      primary: { label: "Our programmes", href: "/our-work" },
      secondary: { label: "Meet the team", href: "/team" },
    },
    {
      eyebrow: "Advocacy & action",
      title: "Turning advocacy into action.",
      description:
        "We work with communities, institutions and stakeholders to strengthen prevention and support.",
      image: photos.community,
      alt: "African community leader speaking with people during an outreach activity",
      location: "South West · Nigeria",
      primary: { label: "Learn about our advocacy", href: "/our-work" },
      secondary: { label: "Partner with us", href: "/get-involved" },
    },
    {
      eyebrow: "Community outreach",
      title: "Change begins in the community.",
      description:
        "Creating awareness, strengthening trusted networks and building space for meaningful change.",
      image: photos.workshop,
      alt: "African students collaborating around a table during a workshop",
      location: "Abuja · Nigeria",
      primary: { label: "Get involved", href: "/get-involved" },
      secondary: { label: "See upcoming events", href: "/events" },
    },
    {
      eyebrow: "Hope & recovery",
      title: "Together, we can create a healthier future.",
      description:
        "Join ICAADA in building communities where people can find support, dignity and a way forward.",
      image: photos.hands,
      alt: "African community members joining hands during a group support session",
      location: "Across Nigeria",
      primary: { label: "Partner with us", href: "/contact" },
      secondary: { label: "Find your way in", href: "/get-involved" },
    },
  ];