/*global document*/
"use strict";
const Scraper = require("./scraper");

class ScraperOld extends Scraper {
  constructor(browser, url, fileName) {
    super(
      browser,
      url,
      fileName,
      "div.content-well>div>article:last-of-type>div.article-inner>header.article-header>div.rank-wrapper>span.rank",
      50,
      ["ArrowUp", "End", "End"]
    );
  }

  async parseItems() {
    this.items = (await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll("div.article-inner")).map(article => {
        let values = [];
        let o = article.querySelector("h1.article-headline");
        if (o) values.push({ name: "Name", value: o.innerText });

        o = article.querySelectorAll("table>tbody>tr");
        if (o)
          o.forEach(a => {
            let n = a.querySelector("th");
            let v = a.querySelector("td");
            if (n && v)
              values.push({
                name: n.innerText,
                value: v.innerText
              });
          });

        return values;
      });
    })).filter(o => Array.isArray(o) && o.length > 0);
    //console.log(this.items);
  }
}
module.exports = ScraperOld;
