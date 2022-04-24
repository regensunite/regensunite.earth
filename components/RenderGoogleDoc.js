import React from "react";
import Image from "next/image";
import Airtable from "../components/Airtable";
import ReactDOM from "react-dom";
import ReactHtmlParser from "react-html-parser";

class RenderGoogleDoc extends React.Component {
  prepare(ref) {
    if (!ref || !ref.querySelectorAll) return;
    const images = Array.from(ref.querySelectorAll("img"));
    images.forEach((img) => {
      ReactDOM.render(
        <Image
          src={img.src}
          width={img.width}
          height={img.height}
          layout="responsive"
        />,
        img.parentNode
      );
    });
  }

  render() {
    const { html } = this.props;
    const options = {
      transform: (node) => {
        if (node.type === "tag" && node.name === "airtable") {
          return (
            <Airtable base={node.attribs.base} table={node.attribs.table} />
          );
        }
        if (node.type === "tag" && node.name === "img") {
          return (
            <Image
              src={node.attribs.src}
              width={node.attribs.width}
              height={node.attribs.height}
              layout="responsive"
            />
          );
        }
      },
    };
    return <div>{ReactHtmlParser(`<div>${html}</div>`, options)}</div>;
  }
}

export default RenderGoogleDoc;
