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
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p
        style={{
          fontFamily: `Montserrat`,
        }}
      >
        Written by <strong>{author}</strong>
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
          <span class={`hidden`}>Github</span>
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
          <span class={`hidden`}>Linked In</span>
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
          <span class={`hidden`}>RSS</span>
        </a>
        <br />
        A personal blog about Data Engineering.
      </p>
    </div>
  )
}

export default Bio
