// Builds dist/barracks.html: a single-file version (for Artifact publishing).
import fs from "fs";
let h = fs.readFileSync("index.html", "utf8");
h = h.replace(/<link rel="stylesheet" href="css\/style.css"\s*\/?>/, () => "<style>\n" + fs.readFileSync("css/style.css", "utf8") + "\n</style>");
h = h.replace(/<script src="(src\/[^"]+)"><\/script>/g, (_, f) => "<script>\n" + fs.readFileSync(f, "utf8") + "\n</script>");
h = h.replace(/<link rel="(manifest|apple-touch-icon|icon)"[^>]*>/g, "");
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/barracks.html", h);
console.log("dist/barracks.html", h.length, "bytes");
