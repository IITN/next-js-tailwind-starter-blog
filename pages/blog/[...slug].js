import fs from "fs";
import PageTitle from "@/components/PageTitle";
import generateRss from "@/lib/generate-rss";
import { MDXLayoutRenderer } from "@/components/MDXComponents";
import {
  formatSlug,
  getAllFilesFrontMatter,
  getFileBySlug,
  getFiles,
  pathToSlug,
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

  const allPosts = await getAllFilesFrontMatter("blog");

  const postIndex = allPosts.findIndex(
    (post) => formatSlug(post.slug) === params.slug.join("/")
  );
  const prev = allPosts[postIndex + 1] || null;
  const next = allPosts[postIndex - 1] || null;
  const post = await getFileBySlug("blog", params.slug.join("/"));

  let authorDetails = [];

  if (post.frontMatter.authors) {
    const authorList = post.frontMatter.authors;
    const authorPromise = authorList.map(async (authorPath) => {
      const author = pathToSlug(authorPath);
      const authorResults = await getFileBySlug("authors", [author]);
      return authorResults.frontMatter;
    });
    authorDetails = await Promise.all(authorPromise);
  }

  let tags = [];

  if (post.frontMatter.tags) {
    const tagList = post.frontMatter.tags;
    tags = await Promise.all(
      tagList.map(async (path) => {
        const slug = pathToSlug(path);
        const tag = await getFileBySlug("tag", slug);
        return tag.frontMatter;
      })
    );
  }

  return { props: { post, authorDetails, tags, prev, next } };
}

export default function Blog({ post, authorDetails, prev, next, page, tags }) {
  const frontMatter = Object.keys(page).length === 0 ? post.frontMatter : page;

  return (
    <PostLayout
      frontMatter={frontMatter}
      authorDetails={authorDetails}
      prev={prev}
      next={next}
      tags={tags}
      contentHtml={post.contentHtml}
    />
  );
}
