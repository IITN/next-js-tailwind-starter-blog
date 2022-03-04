import fs from "fs";
import PageTitle from "@/components/PageTitle";
import generateRss from "@/lib/generate-rss";
import { MDXLayoutRenderer } from "@/components/MDXComponents";
import {
  formatSlug,
  getAllFilesFrontMatter,
  getFileBySlug,
  getFiles,
} from "@/lib/mdx";
import PostLayout from "@/layouts/PostLayout";

const DEFAULT_LAYOUT = "PostLayout";

export async function getStaticPaths() {
  const posts = getFiles("blog");
  return {
    paths: posts.map((p) => ({
      params: {
        slug: formatSlug(p).split("/"),
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps(context) {
  const { params } = context;

  console.log("context", context);

  const allPosts = await getAllFilesFrontMatter("blog");
  const postIndex = allPosts.findIndex(
    (post) => formatSlug(post.slug) === params.slug.join("/")
  );
  const prev = allPosts[postIndex + 1] || null;
  const next = allPosts[postIndex - 1] || null;
  const post = await getFileBySlug("blog", params.slug.join("/"));

  console.log(post.frontMatter.authors);

  let authorDetails = [];

  if (post.frontMatter.authors) {
    const authorList = post.frontMatter.authors;
    const authorPromise = authorList.map(async (author) => {
      console.log(post.frontMatter.authors);
      const authorResults = await getFileBySlug("authors", [author]);
      return authorResults.frontMatter;
    });
    authorDetails = await Promise.all(authorPromise);
  }

  // rss
  if (allPosts.length > 0) {
    const rss = generateRss(allPosts);
    fs.writeFileSync("./public/feed.xml", rss);
  }

  return { props: { post, authorDetails, prev, next } };
}

export default function Blog({ post, authorDetails, prev, next, page }) {
  const frontMatter = Object.keys(page).length === 0 ? post.frontMatter : page;

  return (
    <PostLayout
      frontMatter={frontMatter}
      authorDetails={authorDetails}
      prev={prev}
      next={next}
      contentHtml={post.contentHtml}
    />
  );
}
