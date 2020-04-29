const isAbsolute = require("is-absolute");
const relative = require("relative");
const getConfig = require("@contentz/utils/get-config");
const getMeta = require("@contentz/utils/get-meta");
const { readFile } = require("@contentz/utils/fs");

const generateOG = require("./lib/generate-og");

async function main(paths) {
  console.log("Preparing to start.");
  const config = await getConfig();

  const files = await Promise.all(
    paths.map(async _path => {
      const path = isAbsolute(_path) ? relative(process.cwd(), _path) : _path;
      switch (path) {
        case "home":
        case "articles":
        case "archive":
        case "links":
        case "slides":
        case "error":
        case "cv": {
          return path;
        }
        default: {
          return { path: path, content: await readFile(path, "utf8") };
        }
      }
    })
  );

  const withData = files.map(file => {
    switch (file) {
      case "home": {
        return {
          path: "home.mdx",
          data: {
            title: config.title,
            description: config.description
          }
        };
      }
      case "articles":
      case "archive": {
        return {
          path: "articles.mdx",
          data: {
            title: "Articles",
            description: `List of articles of ${config.title}`
          }
        };
      }
      case "links": {
        return {
          path: "links.mdx",
          data: {
            title: "Shared Links"
          }
        };
      }
      case "error": {
        return {
          path: "error.mdx",
          data: {
            title: "Error 404",
            description:
              "The page or article you have tried to access was not found"
          }
        };
      }
      case "slides": {
        return {
          path: "slides.mdx",
          data: {
            title: "Talks",
            description: `List of talks of ${config.title}`
          }
        };
      }
      case "cv": {
        return {
          path: "cv.mdx",
          data: {
            title: "CV",
            description: `${config.title}'s resume`
          }
        };
      }
      default: {
        return {
          path: file.path,
          data: getMeta(file).data
        };
      }
    }
  });

  await generateOG(withData);
  console.log("Done! Your social images has been successfully generated.");
}

module.exports = main;
