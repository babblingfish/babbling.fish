import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Category from "../components/category"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMarkdownRemark.edges

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="All posts" />
        <Bio />
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <article key={node.fields.slug}>
              <header>
                <h2
                  style={{
                    marginBottom: rhythm(1 / 4),
                    textShadow: `none`,
                  }}
                >
                  <Link
                    style={{
                      boxShadow: `none`,
                      backgroundPosition: `0 1.3em`,
                    }}
                    to={node.fields.slug}
                  >
                    {title}
                  </Link>
                </h2>
                <small
                  style={{
                    fontFamily: `Lora`,
                    fontStyle: "italic",
                  }}
                >
                  {node.frontmatter.date}
                </small>
                {` `}
                <Category category={node.frontmatter.category} />
              </header>
              <section>
                <p
                  style={{
                    fontFamily: "Josefin Sans",
                    fontWeight: 600,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: node.frontmatter.description || node.excerpt,
                  }}
                />
              </section>
            </article>
          )
        })}
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            category
          }
        }
      }
    }
  }
`
