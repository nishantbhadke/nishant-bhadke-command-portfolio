export const profile = {
  name: "Nishant Bhadke",
  role: ".NET Backend Engineer",
  location: "Nashik, India",
  email: "nishantbhadke119@gmail.com",
  phone: "+91 9172773982",
  linkedin: "https://www.linkedin.com/in/nishant-bhadke-983837185/",
  resume: "Nishant_Bhadke_Resume.pdf",
  intro:
    "I build backend systems for banks and finance teams: APIs, SQL-heavy workflows, Redis-backed performance fixes, document flows, and maker-checker journeys. I like work where the business rules are messy and the software still has to be calm.",
  workedAcross: ["Winjit Technologies", "Suryoday Small Finance Bank", "City Union Bank", "RBL-BCMS Project", "RBL-RADC Project"],
  commands: [
    "help",
    "about",
    "work",
    "projects",
    "skills",
    "resume",
    "contact",
    "rbl-bcms",
    "rbl-radc",
    "suryoday",
    "cub",
    "clear"
  ]
};

export const projects = [
  {
    id: "suryoday",
    command: "suryoday",
    title: "Suryoday Small Finance Bank - Secure Banking API Platform",
    shortTitle: "Suryoday Banking APIs",
    label: "Banking APIs",
    duration: "10 months",
    summary:
      "A banking API build where response time and database load mattered every day, not just during demos.",
    problem:
      "Transaction and authentication endpoints were doing too much database work during peak usage.",
    contribution:
      "Built .NET APIs, tightened SQL access, and added Redis caching in the right read paths instead of caching everything blindly.",
    impact:
      "Reduced database query load by roughly 95 percent on targeted flows and improved API latency during busy periods.",
    tech: [".NET Core", "SQL Server", "Redis", "REST APIs", "Authentication"]
  },
  {
    id: "cub",
    command: "cub",
    title: "City Union Bank - Enterprise Banking Platform",
    shortTitle: "City Union Migration",
    label: "Migration and Security",
    duration: "5 months",
    summary:
      "A migration and integration effort where the work had to respect existing banking data, not pretend it was a clean-room rewrite.",
    problem:
      "The platform needed Oracle migration work and secure third-party communication without breaking banking workflows.",
    contribution:
      "Redesigned schemas, stored procedures, and service access patterns while integrating certificate-based authentication.",
    impact:
      "Moved critical data paths toward Oracle and improved trust boundaries for third-party API calls.",
    tech: ["Oracle", "SQL Server", ".NET", "Secure APIs", "Data Migration"]
  },
  {
    id: "rbl-bcms",
    command: "rbl-bcms",
    title: "RBL-BCMS Project",
    shortTitle: "RBL BCMS",
    label: "Loan Workflows",
    duration: "1141 days",
    summary:
      "Long-running BFSI workflow work across loan applications, account opening, renewals, and approval paths.",
    problem:
      "Loan operations needed controlled maker-checker journeys with enough flexibility for real branch and agent workflows.",
    contribution:
      "Worked across modules, approval states, accessibility improvements, and backend rules using .NET, EF, SQL Server, AWS S3, and Docker.",
    impact:
      "Helped retail agents process loan disbursement with clearer controls and stronger operational traceability.",
    tech: [".NET Core", "Entity Framework", "SQL Server", "AWS S3", "Docker"]
  },
  {
    id: "rbl-radc",
    command: "rbl-radc",
    title: "RBL-RADC Project",
    shortTitle: "RBL RADC",
    label: "Loan Collections",
    duration: "RADC module",
    summary:
      "Loan collection support work focused on documents, product-linked actions, and operational visibility.",
    problem:
      "Collection teams needed generated documents, download tracking, and integrations without losing audit context.",
    contribution:
      "Built backend utilities for dynamic PDF generation, activity tracking, product-linked actions, and service integration.",
    impact:
      "Improved traceability around generated documents and user activity in loan collection workflows.",
    tech: [".NET Core", "ASP.NET", "SQL Server", "REST APIs", "Docker"]
  },
  {
    id: "churn",
    command: "churn",
    title: "Bank Customer Churn Prediction System",
    shortTitle: "Churn Prediction",
    label: "Applied ML",
    duration: "Personal project",
    summary:
      "A personal experiment connecting backend service thinking with practical machine-learning signals.",
    problem:
      "Customer profile and transaction data can hide early churn signals if it only sits in tables.",
    contribution:
      "Combined .NET services with Python models and compared Random Forest and Logistic Regression outputs.",
    impact:
      "Turned raw banking-style data into churn-risk indicators that are easier to act on.",
    tech: [".NET", "Python", "Scikit-learn", "Pandas", "SQL"]
  }
];

export const skills = [
  {
    group: "Backend",
    items: ["C#", ".NET Core", "ASP.NET Core", "MVC Architecture", "Entity Framework", "ADO.NET"]
  },
  {
    group: "Data",
    items: ["SQL Server", "Oracle", "Stored Procedures", "Query Tuning", "Redis", "MongoDB"]
  },
  {
    group: "Integration",
    items: ["REST APIs", "Web APIs", "SOAP", "Swagger", "Certificate Auth", "Third-party Services"]
  },
  {
    group: "Delivery",
    items: ["AWS", "AWS S3", "Docker", "CI/CD", "Azure DevOps", "GitHub"]
  },
  {
    group: "Frontend",
    items: ["React.js", "JavaScript", "HTML", "CSS", "Bootstrap", "jQuery", "AJAX"]
  }
];

export const work = [
  {
    company: "Winjit Technologies",
    role: "Software Engineer",
    period: "Sep 2021 - Present",
    bullets: [
      "Delivered backend features for BFSI loan, compliance, account-opening, and document workflows.",
      "Reduced SQL execution time by roughly 40-45 percent through query tuning and data-access cleanup.",
      "Built maker-checker flows where approvals, roles, and audit trails mattered more than visual polish.",
      "Worked on AWS S3 integrations, Docker-based releases, API integrations, and production support."
    ]
  }
];

export const education = [
  { degree: "MCA, Computers", school: "Pune University", year: "2023" },
  { degree: "B.Sc, Computers", school: "Pune University", year: "2021" }
];

export const recognition = {
  certifications: ["AWS Fundamentals: Going Cloud Native"],
  awards: ["Agile Excellence Award"]
};
