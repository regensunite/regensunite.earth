import fetch from "node-fetch";
import cheerio from "cheerio";
import { renderToString } from "react-dom/server";
import XMLToReact from "@condenast/xml-to-react";
import YouTubeEmbed from "../components/YouTubeEmbed";
import TwitterEmbed from "../components/TwitterEmbed";
import RevueEmbed from "../components/RevueEmbed";
import { getPageMetadata } from "./lib";
import slugify from "slugify";
import { decode } from "html-entities";

function cleanHTML(html) {
  return html
    .replace(
      /<a [^>]*>https?:\/\/(www\.)?(youtu.be\/|youtube.com\/(embed\/|watch\?v=))([a-z0-9_-]{11})[^<]*<\/a>/gi,
      (match, p1, p2, p3, p4) => `<YouTube id="${p4}" />`
    )
    .replace(
      /<a [^>]*>(https?:\/\/(www\.)?twitter.com\/(.){1,15}\/status(es)?\/([0-9]+)[^<]*)<\/a>/gi,
      (match, p1, p2, p3, p4, p5) => `<Twitter tweetUrl="${p1}" />`
    )
    .replace(
      /<a [^>]*>(https?:\/\/(www\.)?getrevue.co\/profile\/[^<]+)<\/a>/gi,
      (match, p1, p2, p3, p4) => {
        return `<Revue revueUrl="${p1}" />`;
      }
    )
    .replace(/<img ([^>]+)>/gi, "<img $1 />")
    .replace(/ (alt|title)=""/gi, "")
    .replace(/<hr style="page-break[^"]+">/gi, '<div class="pagebreak" />');
}

function convertDomToReactTree(xml, classes) {
  const $ = cheerio.load(xml, { xmlMode: true });
  function Image({ children, i, src, style }) {
    const size = style.match(/width: ([0-9]+).*height: ([0-9]+)/i);
    const parentStyle = $(`img[src="${src}"]`).parent().first().attr("style");
    const parentClass = $(`img[src="${src}"]`)
      .parent()
      .first()
      .parent()
      .first()
      .attr("class");
    const transform = parentStyle.match(/ transform: ([^;]+);/i);
    const margin = parentStyle.match(/ margin: ([^;]+);/i);
    const containerStyle = {
      display: "block",
      transform: transform[1],
      // margin: margin[1],
    };

    const wrapperClasses = ["imageWrapper"];
    if (size[1] > 500) {
      containerStyle.textAlign = "center";
      wrapperClasses.push("fullWidth");
    } else {
      if (classes[parentClass].match(/text-align:center/)) {
        containerStyle.margin = "0 auto";
        containerStyle.textAlign = "center";
      }
      containerStyle.maxWidth = Math.round(size[1]);
    }

    const img = (
      <span className={wrapperClasses.join(" ")} style={containerStyle}>
        <img
          src={src}
          width={Math.round(size[1])}
          height={Math.round(size[2])}
        />
      </span>
    );
    return img;
  }

  function Br({ children }) {
    return (
      <span>
        <br />
        {children}
      </span>
    );
  }

  function Hr({ children }) {
    return (
      <div>
        <hr />
        {children}
      </div>
    );
  }

  function Link({ children, href, className }) {
    if (!href) return null;
    let linkText = children,
      title = "";

    // Turn links to other Google Docs documents
    // e.g. https://docs.google.com/document/d/1Nl9JsoDPHHGtoQAHWaY-7GAsrTur8XixemGZsIKb9Vs/edit#heading=h.xgnlbr1pklz4
    // e.g. https://docs.google.com/document/u/0/d/1Nl9JsoDPHHGtoQAHWaY-7GAsrTur8XixemGZsIKb9Vs/edit#heading=h.xgnlbr1pklz4
    // into internal links /1Nl9JsoDPHHGtoQAHWaY-7GAsrTur8XixemGZsIKb9Vs
    let newValue = decodeURIComponent(
      href
        .replace("https://www.google.com/url?q=", "")
        .replace(/&sa=D(&source=.+)?&ust=[0-9]+&usg=.{28}/, "")
    );

    const matches = href.match(
      /https:\/\/docs.google.com\/document\/(?:u\/[0-9]\/)?d\/(.{44})/i
    );
    if (
      newValue.indexOf("docs.google.com/document/") !== -1 &&
      newValue.indexOf("/copy") === -1
    ) {
      const googleDocId = matches[1];
      const pageInfo = getPageMetadata(googleDocId);

      newValue = `/${pageInfo.slug || matches[1]}`;
    }

    // Limit display links to 40 chars (since they don't wrap)
    if (linkText.length > 40 && linkText.match(/^https?:\/\/[^ ]+$/)) {
      title = linkText;
      linkText = `${linkText
        .replace(/https?:\/\/(www\.)?/, "", "i")
        .substr(0, 39)}…`;
    }

    return (
      <span>
        <a href={newValue} className={className} title={title}>
          {linkText}
        </a>
      </span>
    );
  }

  const xmlToReact = new XMLToReact({
    html: () => ({ type: "html" }),
    body: () => ({ type: "body" }),
    // style: (attrs) => ({ type: "style", props: attrs }),
    div: (attrs) => ({ type: "div", props: { className: attrs.class } }),
    span: (attrs) => ({
      type: "span",
      props: { className: attrs.class },
    }),
    a: (attrs) => ({
      type: Link,
      props: { className: attrs.class, href: attrs.href },
    }),
    p: (attrs) => ({ type: "p", props: { className: attrs.class } }),
    br: (attrs) => ({ type: Br, props: { className: attrs.class } }),
    hr: (attrs) => ({ type: Hr, props: { className: attrs.class } }),
    h1: (attrs) => ({
      type: "h1",
      props: { className: attrs.class, id: attrs.id },
    }),
    h2: (attrs) => ({
      type: "h2",
      props: { className: attrs.class, id: attrs.id },
    }),
    h3: (attrs) => ({
      type: "h3",
      props: { className: attrs.class, id: attrs.id },
    }),
    h4: (attrs) => ({
      type: "h4",
      props: { className: attrs.class, id: attrs.id },
    }),
    h5: (attrs) => ({
      type: "h5",
      props: { className: attrs.class, id: attrs.id },
    }),
    ul: (attrs) => ({ type: "ul", props: { className: attrs.class } }),
    ol: (attrs) => ({ type: "ol", props: { className: attrs.class } }),
    li: (attrs) => ({ type: "li", props: { className: attrs.class } }),
    table: (attrs) => ({ type: "table", props: { className: attrs.class } }),
    tbody: (attrs) => ({ type: "tbody", props: { className: attrs.class } }),
    tr: (attrs) => ({ type: "tr", props: { className: attrs.class } }),
    td: (attrs) => ({ type: "td", props: { className: attrs.class } }),
    YouTube: (attrs) => ({ type: YouTubeEmbed, props: { id: attrs.id } }),
    Twitter: (attrs) => ({
      type: TwitterEmbed,
      props: { tweetUrl: attrs.tweetUrl },
    }),
    Revue: (attrs) => ({
      type: RevueEmbed,
      props: { revueUrl: attrs.revueUrl },
    }),
    img: (attrs) => ({ type: Image, props: attrs }),
  });
  return xmlToReact.convert(xml);
}

const processHTML = (htmlText) => {
  if (htmlText.indexOf("#email-display") !== -1) {
    throw new Error("not_published");
  }
  const classes = {};
  // console.log(">>> html", htmlText);
  const $ = cheerio.load(cleanHTML(htmlText), { xmlMode: true });
  const styles = decode($("#contents style").html());
  // console.log(">>> styles", styles);
  styles.replace(/\.(c[0-9]+)\{([^\}]*)}/g, (match, className, css) => {
    classes[className] = css;
    return match;
  });
  const newStyles = styles.replace(
    /([^{]+){([^}]+)}/gi,
    (matches, selector, style) => {
      if (selector.match(/\.c[0-9]+/)) {
        // return matches;
        return matches
          .replace(/font-family:[^;}]+;?/gi, "")
          .replace(/line-height:[^;}]+;?/gi, "")
          .replace(
            /(margin|padding)(-(top|right|bottom|left))?:[^};]+\;?/gi,
            ""
          );
      } else return "";
    }
  );

  let title = null,
    description = null;
  $("h1,h2,p").each((i, e) => {
    if (["h1", "h2"].includes(e.name)) {
      const text = $(e).text();
      if (text && !title) {
        title = text;
      }
    } else if (title && !description) {
      description = $(e).text();
    }
  });

  let outline = [];
  $("h1, h2, h3, h4, h5, h6").each((i, e) => {
    const level = Number(e.name.substr(1)) - 1;
    const title = $(e).text();
    if (!title) return;
    const slug = slugify(title).toLowerCase();
    outline.push({ level, title, slug });
    $(e).attr("id", slug);

    // console.log(
    //   ">>> title",
    //   level,
    //   e.name,
    //   typeof e.children,
    //   "text:",
    //   $(e).text()
    // );
  });
  // console.log(outline);

  $("#contents > div").removeClass(); // remove the first container that has a max-width
  const xml = $("<div/>").append($("#contents > div")).html();
  // console.log(">>> xml", xml);
  const tree = convertDomToReactTree(xml, classes);
  try {
    const body = `<style>${newStyles}</style>${renderToString(tree)}`;
    return { title, description, outline, body };
  } catch (e) {
    console.log("!!! processHTML > renderToString error", e);
  }
};

export async function getHTMLFromGoogleDocId(docid) {
  if (docid.length !== 44) {
    throw new Error("invalid_googledocid");
  }
  const googledoc = `https://docs.google.com/document/d/${docid}`;
  const res = await fetch(`${googledoc}/pub`);
  console.log(">>> loading google doc", googledoc);

  const htmlText = await res.text();
  try {
    const doc = processHTML(htmlText);
    return doc;
  } catch (e) {
    console.log("!!! getHTMLFromGoogleDocId > processHTML error", e);
  }
}
