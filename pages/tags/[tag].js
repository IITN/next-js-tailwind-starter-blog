import { TagSEO } from "@/components/SEO";
import siteMetadata from "@/data/siteMetadata";
import ListLayout from "@/layouts/ListLayout";
import generateRss from "@/lib/generate-rss";
import { getAllFilesFrontMatter, getFileBySlug, pathToSlug } from "@/lib/mdx";
import kebabCase from "@/lib/utils/kebabCase";
import fs from "fs";
import path from "path";

const root = process.cwd();

export async function getStaticPaths() {
  const tags = await getAllFilesFrontMatter("tag");

  return {
    paths: tags.map((t) => ({ params: { tag: t.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const allPosts = await getAllFilesFrontMatter("blog");

  const tag = await (await getFileBySlug("tag", params.tag)).frontMatter;

  const filteredPosts = allPosts.filter(
    (post) =>
      post.draft !== true && post.tags.includes(`data/tag/${params.tag}.md`)
  );

  const postsWithTags = await Promise.all(
    filteredPosts.map(async (post) => {
      const tags = await Promise.all(
        post.tags.map(async (path) => {
          const slug = pathToSlug(path);
          const tag = await getFileBySlug("tag", slug);
          return tag.frontMatter;
        })
      );

      return {
        ...post,
        tags,
      };
    })
  );

  return { props: { posts: postsWithTags, tag: tag } };
}

export default function Tag({ posts, tag }) {
  // Capitalize first letter and convert space to dash
  const title = tag.name.toUpperCase();
  return (
    <>
      <TagSEO
        title={`${tag.name} - ${siteMetadata.author}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  );
}
