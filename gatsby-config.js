module.exports = {
  siteMetadata: {
    title: `Babbling Fish`,
    author: `Matt Bass`,
    description: `A personal blog exploring topics in data.`,
    siteUrl: `http://babbling.fish/`,
    social: {
      github: `mbass171`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },

    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 740,
              linkImagesToOriginal: true,
              showCaptions: true,
              quality: 100,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-copy-linked-files`,
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "nofollow noopener noreferrer",
            },
          },
          `gatsby-remark-smartypants`,
          {
            resolve: `gatsby-remark-vscode`,
            options: {
              defaultTheme: "Dark+ (default dark)",
            },
          },
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Babbling Fish`,
        short_name: `Babbling Fish`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#28a5e9`,
        display: `minimal-ui`,
        icon: `content/assets/fish-icon.svg`,
      },
    },
    `gatsby-plugin-offline`,
    {
      resolve: "gatsby-plugin-mailchimp",
      options: {
        endpoint:
          "https://fish.us19.list-manage.com/subscribe/post?u=500fdd2fd194d5d134a52df4f&amp;id=80f458b9df",
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
