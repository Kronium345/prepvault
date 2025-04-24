// import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
// import { z } from "zod";

export const mappings = {
    // React Ecosystem
    "react.js": "react-native",
    reactjs: "react-native",
    react: "react-native", // Icons8 uses "react-native"

    // Next.js doesn't exist on Icons8
    "next.js": "react-native",
    nextjs: "react-native",
    next: "react-native",

    // Vue
    "vue.js": "vue-js",
    vuejs: "vue-js",
    vue: "vue-js",

    // Express - Icons8 uses "expressjs"
    "express.js": "expressjs",
    expressjs: "expressjs",
    express: "expressjs",

    // Node.js
    "node.js": "nodejs",
    nodejs: "nodejs",
    node: "nodejs",

    mongodb: "mongodb",
    mongo: "mongodb",

    // SQL/Databases
    mysql: "mysql-logo",
    postgresql: "postgresql",
    sqlite: "sqlite",
    mongoose: "mongodb",

    // Cloud / Infra
    firebase: "firebase",
    docker: "docker",
    kubernetes: "kubernetes",
    aws: "amazon-web-services",
    azure: "microsoft-azure",
    gcp: "google-cloud",
    digitalocean: "digitalocean",
    heroku: "heroku",

    // Design Tools
    photoshop: "adobe-photoshop",
    "adobe photoshop": "adobe-photoshop",
    figma: "figma",

    // Frontend Core
    html5: "html-5",
    html: "html-5",
    css3: "css3",
    css: "css3",
    sass: "sass",
    scss: "sass",
    tailwindcss: "tailwind-css",
    tailwind: "tailwind-css",
    bootstrap: "bootstrap",

    // JS Ecosystem
    typescript: "typescript",
    ts: "typescript",
    javascript: "javascript",
    js: "javascript",

    // Frameworks
    angular: "angularjs",
    "angular.js": "angularjs",
    angularjs: "angularjs",

    // Version Control
    git: "git",
    github: "github",
    gitlab: "gitlab",
    bitbucket: "bitbucket",

    // State Management / APIs
    redux: "redux",
    graphql: "graphql",
    apollo: "graphql",

    // Build Tools
    webpack: "webpack",
    babel: "babel",
    npm: "npm",
    yarn: "yarn",

    // Testing
    jest: "jest",
    mocha: "mocha",
    cypress: "cypress",

    // Hosting / Deployment
    netlify: "netlify",
    vercel: "vercel",

    // CMS / Others
    wordpress: "wordpress",
    contentful: "contentful",
    strapi: "strapi",
    prisma: "prisma",
};


// export const interviewer: CreateAssistantDTO = {
//   name: "Interviewer",
//   firstMessage:
//     "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
//   transcriber: {
//     provider: "deepgram",
//     model: "nova-2",
//     language: "en",
//   },
//   voice: {
//     provider: "11labs",
//     voiceId: "sarah",
//     stability: 0.4,
//     similarityBoost: 0.8,
//     speed: 0.9,
//     style: 0.5,
//     useSpeakerBoost: true,
//   },
//   model: {
//     provider: "openai",
//     model: "gpt-4",
//     messages: [
//       {
//         role: "system",
//         content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

// Interview Guidelines:
// Follow the structured question flow:
// {{questions}}

// Engage naturally & react appropriately:
// Listen actively to responses and acknowledge them before moving forward.
// Ask brief follow-up questions if a response is vague or requires more detail.
// Keep the conversation flowing smoothly while maintaining control.
// Be professional, yet warm and welcoming:

// Use official yet friendly language.
// Keep responses concise and to the point (like in a real voice interview).
// Avoid robotic phrasing—sound natural and conversational.
// Answer the candidate's questions professionally:

// If asked about the role, company, or expectations, provide a clear and relevant answer.
// If unsure, redirect the candidate to HR for more details.

// Conclude the interview properly:
// Thank the candidate for their time.
// Inform them that the company will reach out soon with feedback.
// End the conversation on a polite and positive note.


// - Be sure to be professional and polite.
// - Keep all your responses short and simple. Use official language, but be kind and welcoming.
// - This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
//       },
//     ],
//   },
// };

// export const feedbackSchema = z.object({
//   totalScore: z.number(),
//   categoryScores: z.tuple([
//     z.object({
//       name: z.literal("Communication Skills"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Technical Knowledge"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Problem Solving"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Cultural Fit"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//     z.object({
//       name: z.literal("Confidence and Clarity"),
//       score: z.number(),
//       comment: z.string(),
//     }),
//   ]),
//   strengths: z.array(z.string()),
//   areasForImprovement: z.array(z.string()),
//   finalAssessment: z.string(),
// });

export const interviewCovers = [
    "https://img.icons8.com/color/96/000000/amazon.png",
    "https://img.icons8.com/color/96/000000/facebook.png",
    "https://img.icons8.com/color/96/000000/reddit.png",
    "https://img.icons8.com/color/96/000000/skype.png",
    "https://img.icons8.com/color/96/000000/spotify.png",
    "https://img.icons8.com/color/96/000000/telegram-app.png",
    "https://img.icons8.com/color/96/000000/tiktok.png",
    "https://img.icons8.com/color/96/000000/yahoo.png",
];



export interface Interview {
    id: string;
    userId: string;
    role: string;
    type: string;
    techstack: string[];
    level: string;
    questions: string[];
    finalized: boolean;
    createdAt: string;
}

export const dummyInterviews: Interview[] = [
    {
        id: "1",
        userId: "user1",
        role: "Frontend Developer",
        type: "Technical",
        techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        level: "Junior",
        questions: ["What is React?"],
        finalized: false,
        createdAt: "2024-03-15T10:00:00Z",
    },
    {
        id: "2",
        userId: "user1",
        role: "Full Stack Developer",
        type: "Technical",
        techstack: ["React", "Node.js", "MongoDB", "Express.js"],
        level: "Mid-level",
        questions: ["Explain REST API", "What is CORS?"],
        finalized: true,
        createdAt: "2024-03-14T15:30:00Z",
    }
];
