/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons"
import { faRss } from "@fortawesome/fontawesome-free-solid"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PopUp from "./popup"
import { rhythm } from "../utils/typography"

config.autoAddCss = false

const Bio = () => {  
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author
          social {
            github
          }
        }
      }
    }
  `)

  const { author } = data.site.siteMetadata
  return (
    <div
      style={{
        display: `flex`,
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author}
        style={{
          marginRight: rhythm(1 / 2),
          marginTop: rhythm(1 / 5),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <div
        style={{
          display: `flex`,
          flexDirection: `column`,
          fontFamily: `Montserrat`,
        }}
      >
        <p
          style={{
            fontFamily: `Montserrat`,
            marginBottom: 0,
          }}
        >
          A blog written by {author}
          {` `}
          <a 
            style={{
              backgroundImage: `none`,
            }}
            target={`_blank`}
            rel={`noopener noreferrer`}
            href={`https://github.com/mbass171/babbling.fish`}
          >
            <FontAwesomeIcon icon={faGithub} />
            <span className={`hidden`}>Github</span>
          </a>
          {` `}
          <a 
            style={{
              backgroundImage: `none`,
            }}
            target={`_blank`}
            rel={`noopener noreferrer`}
            href={`https://linkedin.com/in/babbling-fish`}
          >
            <FontAwesomeIcon icon={faLinkedinIn} />
            <span className={`hidden`}>Linked In</span>
          </a>
          {` `}
          <a 
            style={{
              backgroundImage: `none`,
            }}
            target={`_blank`}
            rel={`noopener noreferrer`}
            href={`/rss.xml`}
          >
            <FontAwesomeIcon icon={faRss} />
            <span className={`hidden`}>RSS</span>
          </a>
        </p>
        <PopUp />
      </div>
    </div>
  )
}

export default Bio
