import type { User, Job, Application } from "./types"

// Mock users data
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password_hash: "hashed_password",
    role: "admin",
    is_blocked: false,
    profile_picture_url: null,
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "John Doe",
    email: "employer@example.com",
    password_hash: "hashed_password",
    role: "employer",
    is_blocked: false,
    profile_picture_url: null,
    created_at: "2023-01-02T00:00:00Z",
    employer: {
      company_name: "Acme Inc.",
      company_website: "https://acme.com",
      company_description: "A leading technology company specializing in innovative solutions.",
      company_logo_url: null,
    },
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "candidate@example.com",
    password_hash: "hashed_password",
    role: "candidate",
    is_blocked: false,
    profile_picture_url: null,
    created_at: "2023-01-03T00:00:00Z",
    candidate: {
      resume_url: "https://example.com/resume.pdf",
      bio: "Experienced software developer with a passion for building user-friendly applications.",
      skills: ["JavaScript", "React", "Node.js", "TypeScript"],
      experience_years: 5,
      education: "Bachelor's in Computer Science",
      linkedin_url: "https://linkedin.com/in/janesmith",
      
    },
  },
  {
    id: "4",
    name: "Bob Johnson",
    email: "employer2@example.com",
    password_hash: "hashed_password",
    role: "employer",
    is_blocked: false,
    profile_picture_url: null,
    created_at: "2023-01-04T00:00:00Z",
    employer: {
      company_name: "TechCorp",
      company_website: "https://techcorp.com",
      company_description: "Building the future of technology.",
      company_logo_url: null,
    },
  },
  {
    id: "5",
    name: "Alice Williams",
    email: "candidate2@example.com",
    password_hash: "hashed_password",
    role: "candidate",
    is_blocked: false,
    profile_picture_url: null,
    created_at: "2023-01-05T00:00:00Z",
    candidate: {
      resume_url: "https://example.com/resume2.pdf",
      bio: "UX/UI designer with a focus on creating intuitive user experiences.",
      skills: ["UI Design", "UX Research", "Figma", "Adobe XD"],
      experience_years: 3,
      education: "Master's in Design",
      linkedin_url: "https://linkedin.com/in/alicewilliams",
    
    },
  },
  {
    id: "6",
    name: "Charlie Brown",
    email: "blocked@example.com",
    password_hash: "hashed_password",
    role: "candidate",
    is_blocked: true,
    profile_picture_url: null,
    created_at: "2023-01-06T00:00:00Z",
    candidate: {
      resume_url: null,
      bio: null,
      skills: [],
      experience_years: null,
      education: null,
      linkedin_url: null,
  
    },
  },
]

// Mock jobs data
export const mockJobs: Job[] = [
  {
    id: "1",
    employer_id: "2",
    title: "Senior Frontend Developer",
    description:
      "We are looking for a Senior Frontend Developer to join our team. You will be responsible for building user interfaces for our web applications.\n\nResponsibilities:\n- Develop new user-facing features\n- Build reusable components and libraries for future use\n- Ensure the technical feasibility of UI/UX designs\n- Optimize applications for maximum speed and scalability\n\nRequirements:\n- Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model\n- Thorough understanding of React.js and its core principles\n- Experience with popular React.js workflows (such as Redux)\n- Familiarity with newer specifications of ECMAScript\n- Experience with data structure libraries (e.g., Immutable.js)\n- Knowledge of isomorphic React is a plus\n- Understanding of server-side rendering",
    type: "Full-time",
    tags: ["React", "JavaScript", "TypeScript", "Redux", "Remote"],
    salary: "$120,000 - $150,000",
    deadline: "2024-06-30",
    created_at: "2024-05-01T00:00:00Z",
    company_name: "Acme Inc.",
  },
  {
    id: "2",
    employer_id: "2",
    title: "Backend Developer",
    description:
      "We are seeking a skilled Backend Developer to design, implement, and maintain server-side applications. The ideal candidate will have experience with Node.js and database design.\n\nResponsibilities:\n- Design and implement robust, scalable, and secure server-side applications\n- Develop and maintain databases\n- Integrate front-end components with server-side logic\n- Implement security and data protection measures\n\nRequirements:\n- Strong proficiency in Node.js\n- Experience with database design and management\n- Knowledge of server-side frameworks\n- Understanding of fundamental design principles for building a scalable application\n- Proficient understanding of code versioning tools, such as Git",
    type: "Full-time",
    tags: ["Node.js", "Express", "MongoDB", "API", "Backend"],
    salary: "$110,000 - $140,000",
    deadline: "2024-07-15",
    created_at: "2024-05-05T00:00:00Z",
    company_name: "Acme Inc.",
  },
  {
    id: "3",
    employer_id: "4",
    title: "UX/UI Designer",
    description:
      "TechCorp is looking for a talented UX/UI Designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design, possess superior UI skills, and be able to translate high-level requirements into interaction flows and artifacts.\n\nResponsibilities:\n- Collaborate with product management and engineering to define and implement innovative solutions for product direction, visuals, and experience\n- Execute all visual design stages from concept to final hand-off to engineering\n- Conceptualize original ideas that bring simplicity and user friendliness to complex design roadblocks\n\nRequirements:\n- Proven experience as a UI/UX Designer or similar role\n- Portfolio of design projects\n- Knowledge of wireframe tools (e.g., Wireframe.cc, InVision)\n- Up-to-date knowledge of design software like Adobe Illustrator and Photoshop\n- Team spirit; strong communication skills to collaborate with various stakeholders",
    type: "Full-time",
    tags: ["UI", "UX", "Figma", "Adobe XD", "Design"],
    salary: "$90,000 - $120,000",
    deadline: "2024-06-20",
    created_at: "2024-05-10T00:00:00Z",
    company_name: "TechCorp",
  },
  {
    id: "4",
    employer_id: "4",
    title: "DevOps Engineer",
    description:
      "TechCorp is seeking a DevOps Engineer to help build and maintain our infrastructure. You will be responsible for deploying and configuring systems, monitoring performance, and ensuring high availability and security.\n\nResponsibilities:\n- Implement and manage CI/CD pipelines\n- Configure and maintain cloud infrastructure\n- Monitor system performance and troubleshoot issues\n- Implement security measures and ensure compliance\n\nRequirements:\n- Experience with cloud platforms (AWS, Azure, or GCP)\n- Knowledge of infrastructure as code tools (Terraform, CloudFormation)\n- Experience with containerization technologies (Docker, Kubernetes)\n- Understanding of networking concepts and security practices",
    type: "Full-time",
    tags: ["DevOps", "AWS", "Docker", "Kubernetes", "CI/CD"],
    salary: "$130,000 - $160,000",
    deadline: "2024-07-30",
    created_at: "2024-05-15T00:00:00Z",
    company_name: "TechCorp",
  },
  {
    id: "5",
    employer_id: "2",
    title: "Product Manager",
    description:
      "Acme Inc. is looking for a Product Manager to help define and launch new products. You will work closely with engineering, design, and marketing teams to ensure successful product delivery.\n\nResponsibilities:\n- Define product vision, strategy, and roadmap\n- Gather and prioritize product requirements\n- Work closely with engineering teams to deliver features\n- Analyze market trends and competition\n\nRequirements:\n- Proven experience as a Product Manager or similar role\n- Strong analytical and problem-solving skills\n- Excellent communication and presentation abilities\n- Technical background is a plus",
    type: "Full-time",
    tags: ["Product Management", "Agile", "Scrum", "Strategy"],
    salary: "$100,000 - $130,000",
    deadline: "2024-06-15",
    created_at: "2024-05-20T00:00:00Z",
    company_name: "Acme Inc.",
  },
  {
    id: "6",
    employer_id: "4",
    title: "Data Scientist",
    description:
      "TechCorp is looking for a Data Scientist to help analyze and interpret complex data. You will work on building machine learning models and extracting insights from large datasets.\n\nResponsibilities:\n- Develop machine learning models\n- Analyze large datasets to extract insights\n- Collaborate with engineering and product teams\n- Present findings to stakeholders\n\nRequirements:\n- Strong background in statistics and mathematics\n- Experience with machine learning frameworks (TensorFlow, PyTorch)\n- Proficiency in Python and data analysis libraries\n- Knowledge of SQL and database systems",
    type: "Full-time",
    tags: ["Data Science", "Machine Learning", "Python", "TensorFlow", "SQL"],
    salary: "$140,000 - $170,000",
    deadline: "2024-07-10",
    created_at: "2024-05-25T00:00:00Z",
    company_name: "TechCorp",
  },
  {
    id: "7",
    employer_id: "2",
    title: "QA Engineer",
    description:
      "Acme Inc. is seeking a QA Engineer to ensure the quality of our software products. You will be responsible for developing and executing test plans, identifying bugs, and working with developers to resolve issues.\n\nResponsibilities:\n- Develop and execute test plans\n- Identify and report bugs\n- Perform regression testing\n- Collaborate with developers to resolve issues\n\nRequirements:\n- Experience with manual and automated testing\n- Knowledge of testing frameworks and tools\n- Understanding of software development lifecycle\n- Strong attention to detail",
    type: "Full-time",
    tags: ["QA", "Testing", "Selenium", "Automation", "JIRA"],
    salary: "$80,000 - $110,000",
    deadline: "2024-06-25",
    created_at: "2024-05-30T00:00:00Z",
    company_name: "Acme Inc.",
  },
  {
    id: "8",
    employer_id: "4",
    title: "Mobile Developer",
    description:
      "TechCorp is looking for a Mobile Developer to build and maintain mobile applications. You will work on developing features, fixing bugs, and improving performance for our iOS and Android apps.\n\nResponsibilities:\n- Develop and maintain mobile applications\n- Collaborate with design and backend teams\n- Optimize applications for performance\n- Fix bugs and improve code quality\n\nRequirements:\n- Experience with React Native or Flutter\n- Knowledge of iOS and Android platforms\n- Understanding of RESTful APIs\n- Familiarity with version control systems",
    type: "Contract",
    tags: ["Mobile", "React Native", "Flutter", "iOS", "Android"],
    salary: "$90,000 - $120,000",
    deadline: "2024-07-05",
    created_at: "2024-06-01T00:00:00Z",
    company_name: "TechCorp",
  },
  {
    id: "9",
    employer_id: "2",
    title: "Technical Writer",
    description:
      "Acme Inc. is seeking a Technical Writer to create documentation for our software products. You will work on user guides, API documentation, and other technical content.\n\nResponsibilities:\n- Create and maintain technical documentation\n- Collaborate with engineers to understand product features\n- Ensure documentation is clear and accurate\n- Keep documentation up-to-date with product changes\n\nRequirements:\n- Strong writing and editing skills\n- Experience with documentation tools\n- Ability to understand technical concepts\n- Attention to detail",
    type: "Part-time",
    tags: ["Technical Writing", "Documentation", "Markdown", "Content"],
    salary: "$60,000 - $80,000",
    deadline: "2024-06-10",
    created_at: "2024-06-05T00:00:00Z",
    company_name: "Acme Inc.",
  },
  {
    id: "10",
    employer_id: "4",
    title: "Frontend Intern",
    description:
      "TechCorp is offering an internship opportunity for a Frontend Developer. You will work with our engineering team to learn and contribute to our web applications.\n\nResponsibilities:\n- Assist in developing user interfaces\n- Learn modern frontend technologies\n- Participate in code reviews\n- Collaborate with senior developers\n\nRequirements:\n- Basic knowledge of HTML, CSS, and JavaScript\n- Familiarity with React or similar frameworks\n- Eagerness to learn and grow\n- Currently pursuing a degree in Computer Science or related field",
    type: "Internship",
    tags: ["Internship", "Frontend", "React", "Entry Level"],
    salary: "$20 - $25 per hour",
    deadline: "2024-06-20",
    created_at: "2024-06-10T00:00:00Z",
    company_name: "TechCorp",
  },
]

// Mock applications data
export const mockApplications: Application[] = [
  {
    id: "1",
    candidate_id: "3",
    job_id: "1",
    resume_url: "https://example.com/resume.pdf",
    message:
      "I am excited to apply for this position. With my 5 years of experience in frontend development, I believe I would be a great fit for your team. I have worked extensively with React and TypeScript, and I am passionate about creating user-friendly interfaces.",
    applied_at: "2024-05-05T00:00:00Z",
  },
  {
    id: "2",
    candidate_id: "5",
    job_id: "3",
    resume_url: "https://example.com/resume2.pdf",
    message:
      "As a UX/UI designer with 3 years of experience, I am thrilled to apply for this position. I have a strong portfolio of projects that demonstrate my ability to create intuitive and visually appealing designs. I am particularly interested in working at TechCorp because of your focus on user-centered design.",
    applied_at: "2024-05-15T00:00:00Z",
  },
  {
    id: "3",
    candidate_id: "3",
    job_id: "2",
    resume_url: "https://example.com/resume.pdf",
    message:
      "I am applying for the Backend Developer position. While my primary experience is in frontend development, I have also worked on several backend projects using Node.js and Express. I am eager to expand my skills in this area and believe I can contribute to your team.",
    applied_at: "2024-05-10T00:00:00Z",
  },
  {
    id: "4",
    candidate_id: "5",
    job_id: "6",
    resume_url: "https://example.com/resume2.pdf",
    message:
      "I am interested in the Data Scientist position. Although my background is in UX/UI design, I have been studying data science and machine learning in my spare time. I believe my design background gives me a unique perspective on data visualization and interpretation.",
    applied_at: "2024-06-01T00:00:00Z",
  },
]

// Mock job matches data (for AI matching feature)
export const mockJobMatches = [
  {
    job_id: "1",
    candidate_id: "3",
    score: 92,
  },
  {
    job_id: "3",
    candidate_id: "5",
    score: 88,
  },
  {
    job_id: "2",
    candidate_id: "3",
    score: 75,
  },
  {
    job_id: "6",
    candidate_id: "5",
    score: 65,
  },
]

// Mock dashboard stats
export const mockDashboardStats = {
  totalUsers: 156,
  newUsers: 12,
  totalJobs: 48,
  newJobs: 8,
  totalApplications: 237,
  newApplications: 24,
  conversionRate: 18.5,
  conversionRateChange: 2.3,
  userGrowthData: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [
      [10, 15, 25, 32, 40, 48], // Candidates
      [5, 8, 12, 18, 22, 28], // Employers
    ],
  },
  userDistribution: {
    candidates: 98,
    employers: 56,
    admins: 2,
  },
  recentJobs: [
    { title: "Frontend Developer", company: "Acme Inc.", date: "2 days ago" },
    { title: "UX Designer", company: "TechCorp", date: "3 days ago" },
    { title: "Data Scientist", company: "TechCorp", date: "5 days ago" },
    { title: "Product Manager", company: "Acme Inc.", date: "1 week ago" },
  ],
  userActivity: [
    { user: "Jane Smith", type: "join", action: "Joined as Candidate", date: "1 day ago" },
    { user: "Bob Johnson", type: "join", action: "Joined as Employer", date: "2 days ago" },
    { user: "Charlie Brown", type: "block", action: "Was blocked", date: "3 days ago" },
    { user: "Alice Williams", type: "join", action: "Joined as Candidate", date: "5 days ago" },
  ],
}

// Mock employer stats
export const mockEmployerStats = {
  activeJobs: 5,
  activeJobsChange: 2,
  totalApplications: 28,
  applicationsChange: 8,
  candidatesViewed: 42,
  viewsChange: 12,
  conversionRate: 15.2,
  conversionChange: 3.1,
  applicationsPerJobData: {
    labels: ["Job 1", "Job 2", "Job 3", "Job 4", "Job 5"],
    values: [
      [12, 8, 5, 3, 0], // Applications
    ],
  },
}
