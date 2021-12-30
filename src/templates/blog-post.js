import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Category from "../components/category"
import ReadingProgress from "../components/progress"
import { rhythm, scale } from "../utils/typography"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext
    const author = this.props.data.site.siteMetadata.author
    const target = React.createRef()

    return (
      <div>
        <ReadingProgress target={target} />
        <Layout location={this.props.location} title={siteTitle}>
          <Seo
            title={post.frontmatter.title}
            description={post.frontmatter.description || post.excerpt}
          />
          <article ref={target}>
            <header>
              <h1
                style={{
                  marginTop: rhythm(1 / 2),
                  marginBottom: rhythm(1 / 4),
                  fontSize: "50px",
                }}
              >
                {post.frontmatter.title}
              </h1>
              <small
                style={{
                  ...scale(-1 / 5),
                  fontWeight: 600,
                  display: `block`,
                  marginBottom: rhythm(1 / 2),
                  fontFamily: `Josefin Sans`,
                }}
              >
                By {author} · {post.frontmatter.date}
                {` `}·
                <Category category={post.frontmatter.category} />
              </small>
            </header>
            <section dangerouslySetInnerHTML={{ __html: post.html }} />
            <hr
              style={{
                marginBottom: rhythm(1),
              }}
            />
            <footer
              style={{
                marginTop: rhythm(1.5),
                marginBottom: rhythm(1),
              }}
            >
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
      </div>
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
        category
      }
    }
  }
`
