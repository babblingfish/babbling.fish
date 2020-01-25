import '../fonts/fonts.css'

import Typography from "typography"
import gray from "gray-percentage"
import { MOBILE_MEDIA_QUERY } from "typography-breakpoint-constants"
import verticalRhythm from "compass-vertical-rhythm"

const theme = {
  title: "Beach House",
  baseFontSize: "18px",
  baseLineHeight: "27px",
  scaleRatio: 2.05,
  headerFontFamily: ["Merriweather", "serif"],
  bodyFontFamily: ["Roboto", "sans-serif"],
  headerColor: "hsla(0,0%,0%,0.90)",
  bodyColor: "hsla(0,0%,0%,0.81)",
  headerWeight: 500,
  bodyWeight: 400,
  boldWeight: 500,
  overrideStyles: ({ adjustFontSizeTo, scale, rhythm }, options) => {
    const linkColor = "#455DD3"
    const backgroundColor = "#fdfdfd"
    const vr = verticalRhythm({
      baseFontSize: "16px",
      baseLineHeight: "1.55",
    })
    return {
      a: {
        color: "inherit",
        textDecoration: "none",
        textShadow:
          `.03em 0 ${backgroundColor},-.03em 0 ${backgroundColor},0 .03em ${backgroundColor},0 -.03em ${backgroundColor},.06em 0 ${backgroundColor},-.06em 0 ${backgroundColor},.09em 0 ${backgroundColor},-.09em 0 ${backgroundColor},.12em 0 ${backgroundColor},-.12em 0 ${backgroundColor},.15em 0 ${backgroundColor},-.15em 0 ${backgroundColor}`, // eslint-disable-line
        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, ${linkColor} 1px, ${linkColor} 2.5px, rgba(0, 0, 0, 0) 2px)`, // eslint-disable-line
      },
      "a:hover,a:active": {
        textShadow: "none",
        backgroundImage: "none",
      },
      "h1,h2,h3,h4,h5,h6": {
        marginTop: rhythm(1.5),
        marginBottom: rhythm(.5),
      },
      "::selection": {
        color: "white",
        textShadow: "none",
        background: `${linkColor}`, 
      },
      "::-moz-selection": {
        color: "white",
        textShadow: "none",
        background: `${linkColor}`, 
      },
      "small": {
        color: gray(30),
        fontWeight: 300,
        fontSize: "16px",
      },
      // children ol, ul
      "li>ol,li>ul": {
        marginLeft: "20px",
        marginBottom: 0,
      },
      "code": {
        fontFamily: "Roboto Mono",
      },
      // Inline code
      "p code": {
        backgroundColor: "rgba(27,31,35,.05)",
        padding: ".2em .4em",
        margin: 0,
        fontSize: "85%",
        borderRadius: "3px",
      },
      // Blockquote styles.
      blockquote: {
        ...scale(1 / 5),
        borderLeft: `${rhythm(3 / 16)} solid ${linkColor}`,
        color: gray(30),
        paddingTop: rhythm(5 / 16), 
        paddingBottom: rhythm(5 / 16), 
        paddingLeft: rhythm(10 / 16),
        marginLeft: 0,
        marginRight: 0,
      },
      "blockquote > :last-child": {
        marginBottom: 0,
      },
      "blockquote cite": {
        ...adjustFontSizeTo(options.baseFontSize),
        color: options.bodyColor,
        fontStyle: "normal",
        fontWeight: options.bodyWeight,
      },
      "blockquote cite:before": {
        content: '"— "',
      },
      [MOBILE_MEDIA_QUERY]: {
        html: {
          ...vr.establishBaseline(),
        },
        blockquote: {
          borderLeft: `${rhythm(3 / 16)} solid ${linkColor}`,
          color: gray(35),
          paddingLeft: rhythm(9 / 16),
          marginLeft: rhythm(-3 / 4),
          marginRight: 0,
        },
      },
    }
  },
}


const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
