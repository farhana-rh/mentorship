/**
 * Site-wide configuration.
 * Replace the placeholder values below before going live.
 */
const SITE_CONFIG = {
  // Apps Script Web App URL that the registration form POSTs to (js/form.js reads this directly).
  // TODO: deploy apps-script/Code.gs as a Web App and paste its /exec URL here before launch.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxZBSX5h47vxWQ7XJjrEhWbt_jW8tdw5ljJMjX3ZH9f63FY_w4L5b48DO12DcePme-u/exec",

  // Maximum accepted CV file size, in megabytes. Keep in sync with MAX_CV_BYTES in apps-script/Code.gs.
  MAX_CV_SIZE_MB: 5,

  // Options for the registration form's dropdowns and checkbox/radio groups.
  // Editing this object is the only thing needed to change what applicants see.
  FORM_OPTIONS: {
    // TODO: replace with the actual list of departments/majors eligible to apply.
    departments: [
      "Computer Science & Engineering (CSE)",
      "Electrical & Electronic Engineering (EEE)",
      "Civil & Environmental Engineering (CEE)",
      "Electronics & Telecommunication Engineering (ETE)",
      "Other",
    ],

    academicYears: [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
    ],

    cgpaRanges: ["Below 2.50", "2.50–2.99", "3.00–3.49", "3.50–3.74", "3.75–4.00"],

    interestAreas: [
      "Software Engineering",
      "Artificial Intelligence / Machine Learning",
      "Data Science",
      "Cybersecurity",
      "Embedded Systems / IoT",
      "Research & Academia",
      "Product / Project Management",
      "Entrepreneurship",
      "Seminconductor / VLSI",
      "Other",
    ],

    goals: [
      "Career guidance",
      "Internship preparation",
      "Job preparation",
      "Research/thesis guidance",
      "Graduate school guidance",
      "Technical skill development",
      "CV/resume improvement",
      "Interview preparation",
      "Networking",
      "Personal branding / LinkedIn",
      "Confidence & communication",
      "Other",
    ],

    mentorQualities: [
      "Industry experience",
      "Research experience",
      "Technical expertise",
      "Career guidance",
      "Graduate school experience",
      "Entrepreneurship",
      "Communication/coaching",
      "Similar academic background",
      "Similar career interests",
    ],

    meetingFormats: ["In-person", "Online", "Hybrid", "No preference"],
    meetingFrequencies: ["Bi-weekly", "Monthly", "No preference"],
    meetingTimes: ["Weekday morning", "Weekday afternoon", "Weekday evening", "Weekend", "Flexible"],
  },

  // Mentor profiles — shown on mentors.html and used to build the registration form's
  // mentor-choice dropdowns (js/form.js derives those from this list). Edit only here;
  // both pages update automatically.
  //
  // Optional per-mentor fields used by the profile page (mentor.html); each row is simply
  // omitted when the field is missing, so it is safe to leave them out:
  //   experience   — e.g. "10+ years". Only filled in where the mentor's own bio states it.
  //   location     — TODO: not collected yet, so no mentor shows a Location row today.
  MENTORS: [
    {
      name: "Achia Nila",
      title: "Founder, Chief Technology Officer at LuminaDev",
      education: [
        { degree: "B.Sc. in Computer Science & Engineering", institution: "United International University" },
        { degree: "M.Sc. in Computer Science & Engineering", institution: "Daffodil International University" },
      ],
      experience: "15+ years",
      bio: "Achia Nila is the Founder and Chief Technology Officer of LuminaDev. She is also the Founder and former CEO of Women in Digital, where she has worked to encourage women's participation in technology through training, mentorship, and innovation initiatives.\n\nWith over 15 years of experience in technology and digital transformation, she brings extensive expertise in emerging technologies, product development, and technical leadership.",
      tags: ["Cybersecurity", "Women in Technology and Digital Innovation"],
      photo: "assets/images/mentors/achia-nila.png",
    },
    {
      name: "Tanzeem Haque",
      title: "Data Infrastructure & Services Lead, ACI AI Business at ACI Limited · Part-time Faculty Lecturer at American International University - Bangladesh (AIUB)",
      education: [
        { degree: "Bachelors & Masters in Bioinformatics (joint degree)", institution: "Ludwig-Maximilian University of Munich & Technical University of Munich" },
      ],
      bio: "Tanzeem Haque works in ACI PLC's AI division, where she leads initiatives across data infrastructure, data science, analytics, and engineering. She also serves as Director at DataEins, working on data systems for the healthcare sector.\n\nShe has mentored students at the Technical University of Munich since 2023 and previously worked as a Data Engineer at Smartify IT Solutions GmbH and Significo Health in Germany.\n\nHer experience spans data engineering, data science, analytics, and technology-driven healthcare solutions.",
      tags: ["Data Engineering", "Data Science", "Data Analytics"],
      photo: "assets/images/mentors/tanzeem-haque.png",
    },
    {
      name: "Afra Kabir",
      title: "Senior Staff Engineer | Software Engineering - Digital | IT at Grameenphone Ltd",
      education: [
        { degree: "B.Sc. in Electrical and Electronics Engineering", institution: "North South University" },
        { degree: "M.Sc. in Electrical Engineering", institution: "University of Bridgeport" },
      ],
      bio: "Afra Kabir is a Senior Staff Engineer at Grameenphone and an alumna of North South University. She previously served as a Senior Engineer at bKash Limited and an ICRM Specialist at Robi. She has also been involved in career-development initiatives supporting women in STEM.\n\nHer professional experience spans software product management, cloud solutions, telecommunications, and digital technology, with a strong background in connectivity, digital innovation, and customer-facing technology.",
      tags: ["Career Planning & Goal Setting", "Communication & Networking Skills", "Career Decision-Making & Confidence Building", "Growth Mindset Development"],
      photo: "assets/images/mentors/afra-kabir.jpg",
    },
    {
      name: "Dr. Fariah Mahzabeen, Ph.D.",
      title: "Associate Professor, Electrical and Computer Engineering Department at North South University",
      education: [
        { degree: "Ph.D. in Electrical Engineering", institution: "Stanford University" },
      ],
      bio: "Dr. Fariah Mahzabeen is an Associate Professor of Electrical and Computer Engineering at North South University and a Ph.D. graduate in Electrical Engineering from Stanford University.\n\nShe previously served as an Assistant Professor at San Jose State University and a Technical Program Manager at Google Cloud. She has also worked with Verily Life Sciences, Facebook, and Stanford University, gaining expertise in engineering, research, and technology innovation.\n\nAs a Co-Founder and COO of Tackle, she also brings valuable entrepreneurial and leadership experience.",
      tags: ["Digital Health / Interdisciplinary Research", "Graduate Studies in Top Schools", "Aiming to Work at MAANG Companies", "Entrepreneurial Stint", "Mental Health Support During Education"],
      photo: "assets/images/mentors/fariah-mahzabeen.jpg",
    },
    {
      name: "Zarrin Tasnim",
      title: "Road Safety Manager PTAB (Pakistan, Turkey, Arabia, Bangladesh) at Unilever",
      education: [
        { degree: "B.Sc. in Electrical and Electronics Engineering", institution: "Islamic University of Technology" },
      ],
      experience: "5+ years",
      bio: "Zarrin Tasnim is the Road Safety Manager for Pakistan, Turkey, Arabia, and Bangladesh (PTAB) at Unilever, where she works across safety strategy and sustainable mobility.\n\nPrior to joining Unilever, she served in several roles at BAT, including Commercial Sustainability Manager and Production Unit Manager. She also previously worked as a Service Assurance Management Intern at Banglalink.\n\nShe has over five years of professional experience spanning supply chain, manufacturing, sustainability, market operations, and leadership.",
      tags: ["Corporate Career Development", "Leadership", "Supply Chain"],
      photo: "assets/images/mentors/zarrin-tasnim.jpg",
    },
    {
      name: "Tahmina Akhter",
      title: "Data Scientist and System Development Engineer at Intel Corporation",
      education: [
        { degree: "B.App.Sc. & M.Sc. in Applied Chemistry and Chemical Engineering", institution: "University of Dhaka" },
        { degree: "Ph.D. in Chemistry", institution: "University of Texas at El Paso" },
      ],
      bio: "Tahmina Akhter is a Data Scientist and System Development Engineer at Intel Corporation. She earned her PhD from the University of Texas at El Paso and received the Frank B. Cotton Trust Graduate Fellowship.\n\nShe also brings a strong academic and research background in engineering and advanced materials. Her professional experience spans semiconductor engineering, process development, manufacturing analytics, quality improvement, and data-driven system development.",
      tags: ["Higher Study", "Research in Semiconductor"],
      photo: "assets/images/mentors/tahmina-akhter.png",
    },
    
    {
      name: "Tasmia Tabassum Rahman",
      title: "Assistant Engineering Program Manager at Ulkasemi",
      education: [
        { degree: "B.Sc. in Electronics and Telecommunication Engineering", institution: "Rajshahi University of Engineering & Technology" },
      ],
      bio: "Tasmia Tabassum Rahman is an Assistant Engineering Program Manager at ULKASEMI Pvt. Limited. Beyond her technical work, she has been involved in community and leadership initiatives through the Hult Prize Foundation and Anirban Bangladesh.\n\nHer professional experience spans engineering program management, communication systems, embedded technologies, and technical leadership.",
      tags: ["Biomedical Antenna Research", "Semiconductor Industry (Analog Layout & Physical Design)", "Research Methodology & Project Planning", "Engineering Project Management", "Antenna Design & RF/Microwave Engineering"],
      photo: "assets/images/mentors/tasmia-tabassum-rahman.png",
    },
    {
      name: "Fardifa Fathmiul Alam",
      title: "ISE Summer Research Fellowship GRA at George Mason University",
      education: [
        { degree: "B.Sc. in Computer Science and Engineering", institution: "Islamic University of Technology" },
        { degree: "M.Sc. in Computer Science", institution: "Clemson University" },
        { degree: "Ph.D. in Electrical and Computer Engineering", institution: "George Mason University" },
      ],
      bio: "Fardifa Fathmiul Alam is a PhD researcher in Electrical and Computer Engineering at George Mason University, where she works in robotics and robot learning.\n\nPrior to joining George Mason University, she completed her M.S. at Clemson University, where she conducted research on autonomous robot localization. Her academic experience includes robotics, machine learning, and autonomous systems.",
      tags: ["Research", "Graduate Applications", "M.S. Studies in Robotics"],
      photo: "assets/images/mentors/fardifa-fathmiul-alam.jpg",
    },
    {
      name: "Kimia Tuz Zaman, Ph.D.",
      title: "Assistant Professor, Department of Computer Science at Tuskegee University",
      education: [
        { degree: "Ph.D. in Computer Science", institution: "North Dakota State University (NDSU)" },
        { degree: "B.Sc. in Computer Science & Engineering", institution: "North South University" },
      ],
      bio: "Dr. Kimia Tuz Zaman is an Assistant Professor in the Department of Computer Science at Tuskegee University. Her research lies at the intersection of Artificial Intelligence, Human-Computer Interaction (HCI), healthcare, privacy, and inclusive technology design.\n\nHer work focuses on developing intelligent, responsible, and culturally sensitive technologies that address the needs of diverse and underserved communities. As an educator and researcher, she is passionate about empowering students and using computing to create meaningful real-world impact.",
      // TODO: the "Mentorship area:" heading is blank in Mentorship Program Speaker Details.pdf —
      // ask Kimia for her areas. Until then her card and profile show no "Mentors in" section.
      tags: [],
      photo: "assets/images/mentors/kimia-tuz-zaman.jpg",
    },
    {
      name: "Oishi Maniha",
      title: "Technical Manager at Ulkasemi Limited",
      education: [
        { degree: "B.App.Sc. in Electrical and Electronics Engineering", institution: "North South University" },
      ],
      experience: "8.5+ years",
      bio: "Oishi Maniha is a Technical Manager at Ulkasemi Limited with over 8.5 years of experience in Analog and Mixed-Signal Layout Engineering and VLSI physical design. She specializes in gate-level netlist-to-GDSII design flow, advanced-node physical layout, IP integration, and full-chip implementation, with hands-on experience across TSMC, GlobalFoundries, and Samsung technologies ranging from 180nm to 3nm.\n\nAlongside her technical expertise, she also works closely with international clients and cross-functional teams, providing technical guidance, resolving complex design challenges, and ensuring successful project execution.",
      // TODO: the "Mentorship area:" heading is blank in Mentorship Program Speaker Details.pdf.
      tags: [],
      // TODO: no photo supplied — an initials avatar is shown until one is added.
      photo: "",
    },
    {
      name: "Mayeesha F. Ahmad",
      title: "Team Lead at Neural Semiconductor Limited",
      education: [
        { degree: "B.Sc. in Electrical and Electronics Engineering", institution: "East Delta University" },
      ],
      experience: "5+ years",
      bio: "Mayeesha F. Ahmad is a Team Lead at Neural Semiconductor Limited with over 5 years of experience in Analog and Mixed-Signal (AMS) Layout Engineering. She specializes in advanced-node technologies ranging from 180nm to 5nm and has experience working with leading foundries including GlobalFoundries, TSMC, and UMC.\n\nHer expertise includes AMS layout, BCD, GaN, High Voltage, FDSOI, FinFET, and Planar technologies, using industry-standard tools such as Cadence Virtuoso and Synopsys Custom Compiler. As a Team Lead, she drives engineering excellence and collaboration within her AMS Design team.\n\nPassionate about STEM and innovation, she is committed to continuous growth and contributing to the advancement of Bangladesh's semiconductor industry.",
      tags: ["Analog and Mixed-Signal (AMS) Layout Engineering", "VLSI and Semiconductor Design", "Advanced-Node Technologies", "STEM and Semiconductor Industry"],
      // TODO: no photo supplied — an initials avatar is shown until one is added.
      photo: "",
    },
  ],

  PROGRAM_NAME: "INSB WIE Mentorship Program",
  ORGANIZING_BODY: "IEEE NSU SB WIE Affinity Group",
  COHORT_LABEL: "Cohort 1 | 2026",

  CONTACT_EMAIL: "ieeewie.nsu@gmail.com",
  
  // TODO: REPLACE with real social links before launch.
  SOCIAL: {
    facebook: "https://www.facebook.com/ieeewiensu",
    instagram: "https://www.instagram.com/ieeensuwie/",
    linkedin: "https://www.linkedin.com/company/ieee-nsu-sb-wie-affinity-group/",
  },
};
