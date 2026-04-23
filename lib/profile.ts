export const profile = {
  name: "Nishant Bhadke",
  role: ".NET Backend Engineer",
  location: "Nashik, India",
  email: "nishantbhadke119@gmail.com",
  phone: "+91 9172773982",
  linkedin: "https://www.linkedin.com/in/nishant-bhadke-983837185/",
  resume: "Nishant_Bhadke_Resume.pdf",
  intro:
    "Software engineer at Winjit Technologies focused on .NET Core, SQL Server, secure APIs, Redis caching, AWS, Docker, and BFSI platform delivery.",
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
    label: "Banking APIs",
    duration: "10 months",
    summary:
      "Developed transaction and authentication APIs for a small finance bank deployment, then introduced Redis caching to reduce database pressure during peak usage.",
    impact:
      "Implemented Redis caching strategy to reduce database query load by 95%, significantly improving API response latency at peak transaction volumes.",
    tech: [".NET Core", "SQL Server", "Redis", "REST APIs", "Authentication"]
  },
  {
    id: "cub",
    command: "cub",
    title: "City Union Bank - Enterprise Banking Platform",
    label: "Migration and Security",
    duration: "5 months",
    summary:
      "Designed and implemented Oracle database migration from SQL Server, redesigning schemas, stored procedures, and data-access layers to meet enterprise banking compliance standards.",
    impact:
      "Integrated certificate-based third-party API authentication with multiple encryption methods, ensuring end-to-end data integrity across core banking workflows.",
    tech: ["Oracle", "SQL Server", ".NET", "Secure APIs", "Data Migration"]
  },
  {
    id: "rbl-bcms",
    command: "rbl-bcms",
    title: "RBL-BCMS Project",
    label: "Loan Workflows",
    duration: "1141 days",
    summary:
      "Worked on BCMS modules for loan application, account opening, product renewal, and maker-checker approval journeys across BFSI lending workflows.",
    impact:
      "Contributed to maker/checker accessibility features, allowing retail agents to process loan disbursement securely.",
    tech: [".NET Core", "Entity Framework", "SQL Server", "AWS S3", "Docker"]
  },
  {
    id: "rbl-radc",
    command: "rbl-radc",
    title: "RBL-RADC Project",
    label: "Loan Collections",
    duration: "RADC module",
    summary:
      "Built utilities for BFSI loan collection workflows, including dynamic PDF generation, download tracking, product-linked actions, and third-party service integrations.",
    impact:
      "Improved operational traceability for document generation and user activity across loan collection workflows.",
    tech: [".NET Core", "ASP.NET", "SQL Server", "REST APIs", "Docker"]
  },
  {
    id: "churn",
    command: "churn",
    title: "Bank Customer Churn Prediction System",
    label: "Applied ML",
    duration: "Personal project",
    summary:
      "Combined .NET services with Python classification models to identify customers with higher likelihood of attrition.",
    impact:
      "Used Random Forest and Logistic Regression to turn transaction and profile data into churn-risk signals.",
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
      "Delivered backend and workflow features for BFSI loan and compliance systems.",
      "Reduced SQL execution time by 40-45% through query tuning and data-access improvements.",
      "Built secure maker-checker flows for compliance-heavy financial operations.",
      "Worked on AWS S3, Docker-based releases, API integrations, and production support."
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
