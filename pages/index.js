import Link from "@/components/Link";
import { PageSEO } from "@/components/SEO";
import Tag from "@/components/Tag";
import siteMetadata from "@/data/siteMetadata";
import { getAllFilesFrontMatter, getFileBySlug, pathToSlug } from "@/lib/mdx";
import formatDate from "@/lib/utils/formatDate";
import { FAQ } from "@/components/FAQ";

import NewsletterForm from "@/components/NewsletterForm";

const MAX_DISPLAY = 4;

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

  const page = await getFileBySlug("page", "index");

  return { props: { posts: postsWithTags, page: { ...page.frontMatter } } };
}

export default function Home({ posts, page }) {
  const { header, subheader, faq } = page;

  return (
    <>
      <PageSEO
        title={siteMetadata.title}
        description={siteMetadata.description}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1
            data-cms-bind="header"
            className="editable md:leading-14 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl"
          >
            {header}
          </h1>
          <p
            data-cms-bind="subheader"
            className="text-lg leading-7 text-gray-500 dark:text-gray-400"
          >
            {subheader}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && "No posts found."}
          {posts.slice(0, MAX_DISPLAY).map((frontMatter) => {
            const { slug, date, title, summary, tags } = frontMatter;
            return (
              <li key={slug} className="py-6">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} href={tag.slug} text={tag.name} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="all posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      <div className="my-16">
        <FAQ title={faq.title} questions={faq.questions} />
      </div>
    </>
  );
}
