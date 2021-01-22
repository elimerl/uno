import "github-markdown-css";
//@ts-expect-error
import { html } from "./how.md";
document.getElementsByClassName("markdown-body")[0].innerHTML = html.replace(
  "{{URL}}",
  `<a href="${window.location.host}">${window.location.host}</a>`
);
