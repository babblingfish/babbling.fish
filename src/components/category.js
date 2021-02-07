import React from "react"

export default class Category extends React.Component {
  getColor = category => {
    const colorMap = {
      "Tutorial": "#ff00ad",
      "How-to": "#B30000",
      "Reference": "#006081",
      "Explanation": "#603267",
      "Personl Essay": "#b8860b",
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
