/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import "@fortawesome/fontawesome-svg-core/styles.css"
import { config } from "@fortawesome/fontawesome-svg-core"
import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope, faRss } from "@fortawesome/fontawesome-free-solid"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Mail from "./mail"
import { rhythm } from "../utils/typography"

config.autoAddCss = false

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 75, height: 75) {
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
          minWidth: 75,
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
        }}
      >
        <p
          style={{
            fontFamily: `Josefin Sans`,
            marginBottom: rhythm(1 / 5),
            maxWidth: `600px`,
          }}
        >
          Written by
          {` `}
          <span className="author">{author}</span>
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
            href={`matt.bass@babbling.fish`}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span className={`hidden`}>Email</span>
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
        <Mail />
      </div>
    </div>
  )
}

export default Bio
