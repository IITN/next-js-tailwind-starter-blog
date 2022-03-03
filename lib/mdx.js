import { bundleMDX } from "mdx-bundler";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import readingTime from "reading-time";
import { visit } from "unist-util-visit";
import getAllFilesRecursively from "./utils/files";
// Remark packages
import remarkGfm from "remark-gfm";
import remarkFootnotes from "remark-footnotes";
import remarkMath from "remark-math";
import remarkExtractFrontmatter from "./remark-extract-frontmatter";
import remarkCodeTitles from "./remark-code-title";
import remarkTocHeadings from "./remark-toc-headings";
import remarkImgToJsx from "./remark-img-to-jsx";
// Rehype packages
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeCitation from "rehype-citation";
import rehypePrismPlus from "rehype-prism-plus";
import rehypePresetMinify from "rehype-preset-minify";
import MarkdownIt from "markdown-it";

const root = process.cwd();

const md = new MarkdownIt({ html: true });

export function getFiles(type) {
  const prefixPaths = path.join(root, "data", type);
  const files = getAllFilesRecursively(prefixPaths);
  // Only want to return blog/path and ignore root, replace is needed to work on Windows
  return files.map((file) =>
    file.slice(prefixPaths.length + 1).replace(/\\/g, "/")
  );
}

export function formatSlug(slug) {
  return slug.replace(/\.(md)/, "");
}

export function dateSortDesc(a, b) {
  if (a > b) return -1;
  if (a < b) return 1;
  return 0;
}

export async function getFileBySlug(type, slug) {
  const mdPath = path.join(root, "data", type, `${slug}.md`);
  const source = fs.readFileSync(mdPath, "utf8");

  const { data: frontmatter, content } = matter(source);

  const contentHtml = md.render(content || "");

  // https://github.com/kentcdodds/mdx-bundler#nextjs-esbuild-enoent
  if (process.platform === "win32") {
    process.env.ESBUILD_BINARY_PATH = path.join(
      root,
      "node_modules",
      "esbuild",
      "esbuild.exe"
    );
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(
      root,
      "node_modules",
      "esbuild",
      "bin",
      "esbuild"
    );
  }

  return {
    contentHtml: contentHtml,
    frontMatter: {
      // readingTime: readingTime(code),
      slug: slug || null,
      fileName: `${slug}.md`,
      ...frontmatter,
      date: frontmatter.date ? new Date(frontmatter.date).toISOString() : null,
    },
  };
}

export async function getAllFilesFrontMatter(folder) {
  const prefixPaths = path.join(root, "data", folder);

  const files = getAllFilesRecursively(prefixPaths);

  const allFrontMatter = [];

  files.forEach((file) => {
    // Replace is needed to work on Windows
    const fileName = file.slice(prefixPaths.length + 1).replace(/\\/g, "/");
    // Remove Unexpected File
    if (path.extname(fileName) !== ".md") {
      return;
    }

    const source = fs.readFileSync(file, "utf8");
    const { data: frontmatter } = matter(source);

    if (frontmatter.draft !== true) {
      allFrontMatter.push({
        ...frontmatter,
        slug: formatSlug(fileName),
        date: frontmatter.date
          ? new Date(frontmatter.date).toISOString()
          : null,
      });
    }
  });

  return allFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date));
}
