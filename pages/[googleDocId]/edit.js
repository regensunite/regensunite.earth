import { getPageMetadata } from "../../lib/lib";
import sitemap from "../../sitemap.json";

export async function getStaticPaths() {
  const paths = [];
  Object.keys(sitemap).forEach((key) => {
    if (key.match(/^collectives/)) return;
    paths.push({
      params: {
        googleDocId: sitemap[key].googleDocId,
      },
    });
    if (sitemap[key].aliases) {
      sitemap[key].aliases.map((alias) => {
        paths.push({
          params: {
            googleDocId: alias,
          },
        });
      });
    }
    paths.push({
      params: {
        googleDocId: key,
      },
    });
  });
  // console.log(paths);
  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const pageInfo = getPageMetadata(params.googleDocId);
  const googleDocId = pageInfo.googleDocId || params.googleDocId;

  return {
    redirect: {
      destination: `https://docs.google.com/document/d/${googleDocId}/edit`,
    },
  };
}

export default function Edit() {
  return <div>Redirecting...</div>;
}
