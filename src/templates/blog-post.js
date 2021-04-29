import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext
    const author = this.props.data.site.siteMetadata.author

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <article>
          <header
            style={{
              borderTop: '2px solid black',
              borderBottom: '2px solid black',
              backgroundColor: '#F7C4B2',
              marginBottom: rhythm(1),
              marginLeft: 'calc(50% - 50vw)',
              width: '100vw',
            }}
          >
            <h1
              style={{
                marginTop: rhythm(1 / 2),
                marginBottom: rhythm(1 / 4),
                fontSize: '50px',
                textAlign: 'center',
                color: 'white',
              }}
            >
              {post.frontmatter.title}
            </h1>
            <p
              style={{
                fontFamily: 'Josefin Sans',
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: 0,
                color: 'white',
                maxWidth: rhythm(24),
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.3,
              }}
              dangerouslySetInnerHTML={{
                __html: post.frontmatter.description || post.excerpt,
              }}
            />
            <small
              style={{
                ...scale(-1 / 5),
                fontWeight: 300,
                display: `block`,
                marginBottom: rhythm(1),
                fontFamily: `Lato`,
                fontStyle: `italic`,
                textAlign: 'center',
                color: 'white',
              }}
            >
              By {author} · {post.frontmatter.date}
            </small>
          </header>
          <section dangerouslySetInnerHTML={{ __html: post.html }} />
          <hr
            style={{
              marginBottom: rhythm(1),
            }}
          />
          <footer>
            <Bio />
          </footer>
        </article>

        <nav>
          <ul
            style={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `space-between`,
              listStyle: `none`,
              padding: 0,
              marginLeft: 0,
            }}
          >
            <li>
              {previous && (
                <Link to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
