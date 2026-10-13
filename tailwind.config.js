/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brutal: {
          black: '#1A1A1A',
          white: '#FAFAFA',
          cream: '#F5F0E8',
          blue: '#2563EB',
          // Darkened for 4.5:1 on white: the redesign is a high-contrast light theme.
          green: '#15803D',
          red: '#DC2626',
          muted: '#3D3D3D',
          faint: '#595959',
          purple: '#8B5CF6',
          teal: '#14B8A6',
          yellow: '#FACC15',
          orange: '#F97316',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #1A1A1A',
        'brutal-sm': '2px 2px 0px 0px #1A1A1A',
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
};
