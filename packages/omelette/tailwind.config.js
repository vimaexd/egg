module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "exyl-orange": "#ff5b03",
        "exyl-red": "#ff0b17",
        'str-cotton': "#8548F5",
        'str-yarn': '#FA93FF',
        'str-bleck': '#060606',
        'str-bleck-100': '#0a0a0a',
        'str-bleck-200': '#0f0f0f',
        'str-ice': '#f5f5f5',
        'str-ice-100': '#ebebeb',
        'str-ice-200': '#dedede'
      },
      fontFamily: {
        'sans': "Montserrat"
      }
    },
  },
  plugins: [],
}
