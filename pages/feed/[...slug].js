import siteMetadata from "@/data/siteMetadata";
import projectsData from "@/data/projectsData";
import Card from "@/components/Card";
import { PageSEO } from "@/components/SEO";
import FeedLayouyt from "@/layouts/FeedLayout";

import { getFiles, formatSlug, getFileBySlug } from "@/lib/mdx";

export async function getStaticPaths() {
  const feeds = getFiles("feed");

  return {
    paths: feeds.map((p) => ({
      params: {
        slug: formatSlug(p).split("/"),
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const feed = await getFileBySlug("feed", params.slug.join("/"));

  return {
    props: { page: { ...feed.frontMatter } }, // will be passed to the page component as props
  };
}

export default function Projects({ page }) {
  console.log(page);

  return <FeedLayouyt posts={[]} />;
}
