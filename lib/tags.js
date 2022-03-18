import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { getFiles, getFileBySlug, pathToSlug } from "./mdx";
import kebabCase from "./utils/kebabCase";

const root = process.cwd();

export async function getAllTags(type) {
  const files = await getFiles(type);

  let tagCount = {};
  // Iterate through each post, putting all found tags into `tags`
  files.forEach((file) => {
    const source = fs.readFileSync(path.join(root, "data", type, file), "utf8");
    const { data } = matter(source);

    if (data.tags && data.draft !== true) {
      data.tags.forEach(async (path) => {
        const tag = await getFileBySlug("tag", pathToSlug(path));

        tagCount[tag.frontMatter.slug] = tag.frontMatter;

        const formattedTag = path;
        if (formattedTag in tagCount) {
          tagCount[tag.frontMatter.slug].tagCount += 1;
        } else {
          tagCount[tag.frontMatter.slug].tagCount = 1;
        }
      });
    }
  });

  return tagCount;
}
