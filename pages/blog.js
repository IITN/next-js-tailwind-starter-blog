import { getAllFilesFrontMatter, pathToSlug, getFileBySlug } from "@/lib/mdx";
import siteMetadata from "@/data/siteMetadata";
import ListLayout from "@/layouts/ListLayout";
import { PageSEO } from "@/components/SEO";

export const POSTS_PER_PAGE = 5;

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter("blog");
  const postsWithTags = await Promise.all(
    posts.map(async (post) => {
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

  const initialDisplayPosts = postsWithTags.slice(0, POSTS_PER_PAGE);
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(postsWithTags.length / POSTS_PER_PAGE),
  };

  return { props: { initialDisplayPosts, posts: postsWithTags, pagination } };
}

export default function Blog({ posts, initialDisplayPosts, pagination }) {
  return (
    <>
      <PageSEO
        title={`Blog - ${siteMetadata.author}`}
        description={siteMetadata.description}
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="Alla Artiklar"
      />
    </>
  );
}
