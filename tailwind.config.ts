import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
    fontFamily: {
      sans: ["ui-sans-serif"],
      serif: ["ui-serif"],
      mono: ["ui-monospace"],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      orange: {
        100: "#FF6B3B",
        40: "#FFC4B1",
        20: "#FFE1D8",
        10: "#FFF0EB",
      },
      black: {
        100: "#150618",
        90: "#2C1F2F",
        80: "#443846",
        60: "#736A74",
        40: "#A19BA3",
        30: "#B8B4B9",
        20: "#D0CDD1",
        10: "#E8E6E8",
        "05": "#F3F3F3",
        "03": "#f7f7f7",
      },
      white: {
        100: "rgb(255, 255, 255)",
        90: "rgba(255, 255, 255, 0.9)",
        80: "rgba(255, 255, 255, 0.8)",
        60: "rgba(255, 255, 255, 0.6)",
        40: "rgba(255, 255, 255, 0.4)",
        20: "rgba(255, 255, 255, 0.2)",
        10: "rgba(255, 255, 255, 0.1)",
        "05": "rgba(255, 255, 255, 0.05)",
      },
      green: {
        100: "rgba(30, 197, 27)",
        10: "rgba(30, 197, 27, 0.1)",
      },
      red: {
        100: "rgb(233, 77, 77)",
        40: "rgba(233, 77, 77, 0.4)",
        10: "rgba(233, 77, 77, 0.1)",
      },
      purple: {
        100: "rgba(207, 63, 242, 1.0)",
        "08": "rgba(21, 6, 24, 0.8)",
      },
      blue: {
        100: "#3B82F6", // Vibrant primary blue
        80: "#60A5FA", // Lighter shade
        60: "#93C5FD", // Even lighter
        50: "#A9D0FE",
        40: "#BFDBFE", // Soft blue
        20: "#DBEAFE", // Very light blue
        10: "#EFF6FF", // Extremely light blue
        "05": "#F8FAFF", // Almost white blue
      },
    },
  },

  plugins: [],
} satisfies Config;
