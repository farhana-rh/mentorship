/**
 * Site-wide configuration.
 * Replace the placeholder values below before going live.
 */
const SITE_CONFIG = {
  // Apps Script Web App URL that the registration form POSTs to (js/form.js reads this directly).
  // TODO: deploy apps-script/Code.gs as a Web App and paste its /exec URL here before launch.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwXvx20wlhrRqfIy1LGDnXWs93seLLiIM9zwoDSd1_H8RiPgSbimT8d5Ue9OMIZN1Gu/exec",

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

    // TODO: replace with NSU's actual year/semester labels.
    academicYears: [
      "1st Year / 1st Semester",
      "1st Year / 2nd Semester",
      "2nd Year / 3rd Semester",
      "2nd Year / 4th Semester",
      "3rd Year / 5th Semester",
      "3rd Year / 6th Semester",
      "4th Year / 7th Semester",
      "4th Year / 8th Semester",
    ],

    cgpaRanges: ["Below 2.50", "2.50–2.99", "3.00–3.49", "3.50–3.74", "3.75–4.00"],

    interestAreas: [
      "Software Engineering",
      "Artificial Intelligence / Machine Learning",
      "Data Science",
      "Cybersecurity",
      "Networking",
      "Cloud Computing / DevOps",
      "Embedded Systems / IoT",
      "Research & Academia",
      "Product / Project Management",
      "Entrepreneurship",
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
  // TODO: add a photo for each mentor once available (assets/images/mentors/...); until then an initials avatar is shown.
  MENTORS: [
    {
      name: "Achia Nila",
      title: "Founder, Chief Technology Officer at LuminaDev",
      tags: ["Cybersecurity", "Women in Technology and Digital Innovation"],
      photo: "",
    },
    {
      name: "Afra Kabir",
      title: "Senior Staff Engineer | Software Engineering - Digital | IT at Grameenphone Ltd",
      tags: ["Career Planning & Goal Setting", "Communication & Networking Skills", "Career Decision-Making & Confidence Building", "Growth Mindset Development"],
      photo: "",
    },
    {
      name: "Tanzeem Haque",
      title: "Data Infrastructure & Services Lead, ACI AI Business at ACI Limited · Part-time Faculty Lecturer at American International University - Bangladesh (AIUB)",
      tags: ["Data Engineering", "Data Science", "Data Analytics"],
      photo: "",
    },
    {
      name: "Zarrin Tasnim",
      title: "Road Safety Manager PTAB (Pakistan, Turkey, Arabia, Bangladesh) at Unilever",
      tags: ["Corporate Career Development", "Leadership", "Supply Chain"],
      photo: "",
    },
    {
      name: "Tahmina Akhter",
      title: "Data Scientist and System Development Engineer at Intel Corporation",
      tags: ["Higher Study", "Research in Semiconductor"],
      photo: "",
    },
    {
      name: "Dr. Fariah Mahzabeen, Ph.D.",
      title: "Associate Professor, Electrical and Computer Engineering Department at North South University",
      tags: ["Digital Health / Interdisciplinary Research", "Graduate Studies in Top Schools", "Aiming to Work at MAANG Companies", "Entrepreneurial Stint", "Mental Health Support During Education"],
      photo: "",
    },
    {
      name: "Tasmia Tabassum Rahman",
      title: "Assistant Engineering Program Manager at Ulkasemi",
      tags: ["Biomedical Antenna Research", "Semiconductor Industry (Analog Layout & Physical Design)", "Research Methodology & Project Planning", "Engineering Project Management", "Antenna Design & RF/Microwave Engineering"],
      photo: "",
    },
    {
      name: "Fardifa Fathmiul Alam",
      title: "ISE Summer Research Fellowship GRA at George Mason University",
      tags: ["Research", "Graduate Applications", "M.S. Studies in Robotics"],
      photo: "",
    },
  ],

  PROGRAM_NAME: "INSB WIE Mentorship Program",
  ORGANIZING_BODY: "IEEE NSU SB WIE Affinity Group",
  COHORT_LABEL: "Cohort 1 | 2026",

  CONTACT_EMAIL: "ieeewie.nsu@gmail.com",
  CONTACT_PHONES: ["+8801710097856", "+8801684382112"],

  // TODO: REPLACE with real social links before launch.
  SOCIAL: {
    facebook: "https://www.facebook.com/ieeensusbwie",
    instagram: "https://www.instagram.com/ieeensusbwie",
    linkedin: "https://www.linkedin.com/company/ieee-nsu-sb-wie",
  },
};
