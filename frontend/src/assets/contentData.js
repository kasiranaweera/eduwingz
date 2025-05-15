import objectImage_1 from "../assets/img/object_card_1.jpg";
import objectImage_2 from "../assets/img/object_card_2.jpg";
import objectImage_3 from "../assets/img/object_card_3.jpg";
import objectImage_4 from "../assets/img/object_card_4.jpg";
import { School, Settings, SupportAgent, BarChart } from "@mui/icons-material";

const studentTestimonials = [
  {
    username: "Sarah Johnson",
    rating: 5,
    testimonial:
      "EduWingz completely transformed how I study. The system quickly figured out that I'm a visual learner and started presenting content with diagrams and videos. My comprehension improved by at least 30% in just two weeks!",
  },
  {
    username: "David Lee",
    rating: 5,
    testimonial:
      "As someone who always struggled with traditional teaching methods, EduWingz has been life-changing. The platform adapts to my preference for hands-on learning, and I've gone from a C student to an A student in my programming course.",
  },
  {
    username: "Emma Rodriguez",
    rating: 4,
    testimonial:
      "The way EduWingz presents math concepts is incredible. It noticed I learn best through practical applications rather than theory first, and adjusted accordingly. Now calculus finally makes sense to me!",
  },
  {
    username: "Michael Chen",
    rating: 5,
    testimonial:
      "I was skeptical at first, but EduWingz genuinely understands how I learn. It presents information sequentially for complex topics but gives me the big picture first for creative subjects. My grades have improved across all subjects.",
  },
  // {
  //   username: "Olivia Patel",
  //   rating: 4,
  //   testimonial:
  //     "As someone who studies late at night after work, EduWingz has been invaluable. It recognizes when my concentration is dropping and shifts to more interactive content to keep me engaged. The personalization is impressive!",
  // },
];

const featuerData = [
  {
    title: "Intelligent Learning Recognition",
    subtitle: "Understanding You Like Never Before",
    img: objectImage_1,
    list: [
      {
        primary: "Learning Style Analysis",
        secondary:
          "Our AI engine employs the ILS (Index of Learning Styles) model to identify whether you learn best through visual, verbal, active, reflective, sequential, or global methods.",
      },
      {
        primary: "Behavioral Pattern Tracking",
        secondary:
          "The system monitors engagement patterns, time spent on different content formats, and interaction preferences to build your comprehensive learning profile.",
      },
      {
        primary: "Continuous Adaptation",
        secondary:
          "Your learning profile evolves as you use the platform, becoming more accurate and personalized over time.",
      },
    ],
  },
  {
    title: "Smart Content Transformation",
    subtitle: "The Right Content, The Right Way",
    img: objectImage_2,
    list: [
      {
        primary: "Multi-Format Delivery",
        secondary:
          "Educational materials automatically transform between visual presentations, text-based resources, audio explanations, and interactive exercises based on your preferences.",
      },
      {
        primary: "Difficulty Calibration",
        secondary:
          "Content complexity adjusts in real-time to maintain the optimal challenge level—never too easy, never too hard.",
      },
      {
        primary: "Engagement Optimization",
        secondary:
          "The system identifies when engagement is dropping and dynamically shifts presentation methods to recapture attention.",
      },
    ],
  },
  {
    title: "AI-Powered Learning Support",
    subtitle: "Help When You Need It Most",
    img: objectImage_3,
    list: [
      {
        primary: "Contextual Assistance",
        secondary:
          "Receive instant support tailored to your specific question or challenge without disrupting your learning flow.",
      },
      {
        primary: "Concept Reinforcement",
        secondary:
          "The system identifies knowledge gaps and automatically provides additional explanations using your preferred learning method.",
      },
      {
        primary: "Personalized Learning Paths",
        secondary:
          "Navigate through educational content in sequences optimized for your understanding and retention.",
      },
    ],
  },
  {
    title: "Comprehensive Analytics Dashboard",
    subtitle: "Insights That Drive Success",
    img: objectImage_4,
    list: [
      {
        primary: "Progress Visualization",
        secondary:
          "Track your learning journey through intuitive graphs and charts that highlight achievements and areas for improvement.",
      },
      {
        primary: "Learning Style Insights",
        secondary:
          "Gain valuable self-awareness about how you learn best, with detailed breakdowns of your learning preferences.",
      },
      {
        primary: "Performance Predictions",
        secondary:
          "AI-generated forecasts help identify potential learning obstacles before they impact your progress.",
      },
    ],
  },
];

const features = [
  {
    icon: <Settings fontSize="large" color="primary" />,
    title: "Intelligent Pattern Recognition",
    description:
      "Advanced algorithms analyze individual learning styles to create personalized profiles.",
  },
  {
    icon: <School fontSize="large" color="primary" />,
    title: "Adaptive Teaching Framework",
    description:
      "Automatically adapts content to your optimal learning style for maximum understanding.",
  },
  {
    icon: <SupportAgent fontSize="large" color="primary" />,
    title: "Real-Time Learning Support",
    description:
      "Instant help ensures smooth and engaging educational experiences without interruptions.",
  },
  {
    icon: <BarChart fontSize="large" color="primary" />,
    title: "Comprehensive Analytics",
    description:
      "Insightful dashboards highlight progress and areas for improvement.",
  },
];

const objectives = [
  {
    title: "Recognizes Your Learning Pattern",
    desc: "Our AI identifies how you learn best."
  },
  {
    title: "Adapts Teaching Methods",
    desc: "Content presentation changes to suit your learning style."
  },
  {
    title: "Provides Real-Time Support",
    desc: "Instant help when you need it most."
  },
  {
    title: "Tracks Your Progress",
    desc: "Detailed analytics to guide your learning journey."
  }
]

const contentData = { studentTestimonials, featuerData, features, objectives };

export default contentData;
