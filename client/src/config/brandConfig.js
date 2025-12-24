export const brandConfig = {
  identity: {
    name: "IndoCafe",
    logoUrl: "/logo.png", // Place your logo in public folder
    tagline: "Authentic Flavors, Modern Experience",
    description: "Experience the finest culinary delights delivered straight to your doorstep."
  },
  theme: {
    light: {
      primary: "234 88 12", // Orange-600
      secondary: "71 85 105", // Slate-600
      background: "248 250 252", // Slate-50
      surface: "255 255 255", // White
      text: "15 23 42", // Slate-900
      "on-primary": "255 255 255", // White
    },
    dark: {
      primary: "249 115 22", // Orange-500
      secondary: "148 163 184", // Slate-400
      background: "2 6 23", // Slate-950
      surface: "15 23 42", // Slate-900
      text: "248 250 252", // Slate-50
      "on-primary": "255 255 255",
    }
  },
  ui: {
    borderRadius: "0.75rem", // rounded-xl
    fontFamily: "'Inter', sans-serif",
  }
};
