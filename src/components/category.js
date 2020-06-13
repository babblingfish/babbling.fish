import React from "react"

export default class Category extends React.Component {
  getColor = category => {
    const colorMap = {
      "Python + SQL": "#b8860b",
      "Web Scraping": "#B30000",
      "Language": "#006081",
      "Databases": "#603267",
    }

    if (category in colorMap) {
      return colorMap[category]
    } else {
      return "blue"
    }
  }

  render() {
    const category = this.props.category
    const color = this.getColor(category)

    return <small 
            style={{
                 color: color, 
                 borderRadius: "10px",
                 padding: "2px 5px 2px 5px",
                }}
            >
                {category}
            </small>
  }
}
