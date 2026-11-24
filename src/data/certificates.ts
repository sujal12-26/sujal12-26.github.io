export interface CertificateItem {
  id: string;
  title: string;
  provider: string;
  description: string;
  completedOn?: string;
  image: string;
  file: string;
  documents?: { label: string; file: string }[];
}

const certificateAsset = (path: string) => `${import.meta.env.BASE_URL}certificates/${path}`;

const certificates: Record<string, CertificateItem> = {
  solidworks: {
    id: 'solidworks-2024',
    title: 'SOLIDWORKS 2024 Essential Training',
    provider: 'LinkedIn Learning',
    description:
      'Introduces SOLIDWORKS tools and workflows for 3D CAD design.',
    completedOn: 'Nov 18, 2026',
    image: certificateAsset('linkedin-solidworks-2024-essential-training.jpg'),
    file: certificateAsset('linkedin-solidworks-2024-essential-training.pdf'),
  },
  cProgramming: {
    id: 'c-programming-foundations',
    title: 'Complete Guide to C Programming Foundations',
    provider: 'LinkedIn Learning',
    description:
      'C language basics and programming foundations.',
    completedOn: 'Nov 18, 2026',
    image: certificateAsset('linkedin-c-programming-foundations.jpg'),
    file: certificateAsset('linkedin-c-programming-foundations.pdf'),
  },
  aiFoundations: {
    id: 'ai-foundations-thinking-machines',
    title: 'Artificial Intelligence Foundations: Thinking Machines',
    provider: 'LinkedIn Learning',
    description:
      'An introduction to artificial intelligence and machine learning concepts.',
    completedOn: 'Nov 18, 2026',
    image: certificateAsset('linkedin-ai-foundations-thinking-machines.jpg'),
    file: certificateAsset('linkedin-ai-foundations-thinking-machines.pdf'),
  },
  leadership: {
    id: 'leadership-through-feedback',
    title: 'Leadership through Feedback',
    provider: 'LinkedIn Learning',
    description:
      'Covers constructive feedback as a leadership skill. Includes the companion copy with PMI professional development details.',
    completedOn: 'Nov 16, 2026',
    image: certificateAsset('linkedin-leadership-through-feedback.jpg'),
    file: certificateAsset('linkedin-leadership-through-feedback.pdf'),
    documents: [
      {
        label: 'LinkedIn Learning Certificate',
        file: certificateAsset('linkedin-leadership-through-feedback.pdf'),
      },
      {
        label: 'Certificate with PMI PDUs',
        file: certificateAsset('linkedin-leadership-through-feedback-pmi.pdf'),
      },
    ],
  },
  cBeginners: {
    id: 'c-programming-for-beginners',
    title: 'C Programming For Beginners - Learn C Language from Scratch',
    provider: 'CodeWithHarry',
    description:
      'A beginner course covering the C programming language from scratch.',
    image: certificateAsset('codewithharry-c-programming-beginners.jpg'),
    file: certificateAsset('codewithharry-c-programming-beginners.pdf'),
  },
  jioAi: {
    id: 'jio-ai-foundation-course',
    title: 'AI Foundation Course',
    provider: 'Jio AI Classroom',
    description:
      'Certificate of completion for the AI Foundation Course powered by JioPC.',
    image: certificateAsset('jio-ai-foundation-course.jpg'),
    file: certificateAsset('jio-ai-foundation-course.pdf'),
  },
};

export const FEATURED_CERTIFICATES: CertificateItem[] = [
  certificates.solidworks,
  certificates.cProgramming,
  certificates.aiFoundations,
];

export const ADDITIONAL_CERTIFICATES: CertificateItem[] = [
  certificates.leadership,
  certificates.cBeginners,
  certificates.jioAi,
];

export const ALL_CERTIFICATES: CertificateItem[] = [
  ...FEATURED_CERTIFICATES,
  ...ADDITIONAL_CERTIFICATES,
];
