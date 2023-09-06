/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import { Github } from "../logos/github"
import { LinkedIn } from "../logos/linkedIn"
import { Envelope } from "../logos/envelope"
import { Feed } from "../logos/feed"
import Mail from "./mail"
import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
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
      <StaticImage
        src="../images/babblingfish-logo.png"
        alt={author}
        placeholder="blurred"
        layout="fixed"
        width={85}
        height={85}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
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
            marginTop: rhythm(1 / 4),
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
            href={`https://github.com/babblingfish/babbling.fish`}
          >
            <Github/>
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
            <LinkedIn/>
            <span className={`hidden`}>Linked In</span>
          </a>
          {` `}
          <a
            style={{
              backgroundImage: `none`,
            }}
            target={`_blank`}
            rel={`noopener noreferrer`}
            href={`mailto:mattbass@babbling.fish`}
          >
            <Envelope/>
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
            <Feed/>
            <span className={`hidden`}>RSS</span>
          </a>
        </p>
        <Mail />
      </div>
    </div>
  )
}

export default Bio
