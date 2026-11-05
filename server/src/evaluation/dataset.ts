export type BenchmarkCase = {
  id: number;
  question: string;
  expectedPage: number | null;
  answerable: boolean;
};

export const benchmarkCases: BenchmarkCase[] = [
  {
    id: 1,
    question: "What certifications are offered by ISC2?",
    expectedPage: 5,
    answerable: true,
  },
  {
    id: 2,
    question:
      "Which professional certifications is ISACA known for, and what roles are they suited for?",
    expectedPage: 6,
    answerable: true,
  },
  {
    id: 3,
    question:
      "What types of security training and certifications does the SANS Institute provide?",
    expectedPage: 7,
    answerable: true,
  },
  {
    id: 4,
    question:
      "What three components are combined in an Information Assurance Management System?",
    expectedPage: 9,
    answerable: true,
  },
  {
    id: 5,
    question: "What stages make up the information life cycle?",
    expectedPage: 10,
    answerable: true,
  },
  {
    id: 6,
    question: "What information is included in the Statement of Applicability?",
    expectedPage: 14,
    answerable: true,
  },
  {
    id: 7,
    question: "What activities are performed during the Do phase of the PDCA model?",
    expectedPage: 15,
    answerable: true,
  },
  {
    id: 8,
    question:
      "What activities are performed during the Check phase of the PDCA model?",
    expectedPage: 16,
    answerable: true,
  },
  {
    id: 9,
    question: "What are the four phases of Boyd’s OODA loop?",
    expectedPage: 18,
    answerable: true,
  },
  {
    id: 10,
    question:
      "What are the six stages of the cybersecurity kill chain described in the lecture?",
    expectedPage: 19,
    answerable: true,
  },
  {
    id: 11,
    question: "What is the difference between due care and due diligence?",
    expectedPage: 21,
    answerable: true,
  },
  {
    id: 12,
    question: "What privacy and data protection principles are identified by the OECD?",
    expectedPage: 24,
    answerable: true,
  },
  {
    id: 13,
    question: "Who won the 2022 FIFA World Cup?",
    expectedPage: null,
    answerable: false,
  },
  {
    id: 14,
    question: "What is the boiling point of water?",
    expectedPage: null,
    answerable: false,
  },
  {
    id: 15,
    question: "What is the capital of Australia?",
    expectedPage: null,
    answerable: false,
  },
  {
    id: 16,
    question: "How does photosynthesis convert sunlight into energy?",
    expectedPage: null,
    answerable: false,
  },
  {
    id: 17,
    question: "In what year did Apollo 11 land on the Moon?",
    expectedPage: null,
    answerable: false,
  },
];
