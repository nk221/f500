/*global document*/
"use strict";
const Scraper = require("./scraper");

class ScraperNew extends Scraper {
  constructor(browser, url, fileName) {
    super(browser, url, fileName, ".company-list>li:last-of-type>a>span:first-of-type", 500, [
      "End"
    ]);
  }

  async parseItems() {
    this.items = (await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll("ul.company-list>li")).map(article => {
        let values = [];
        let o = article.querySelector("a");
        if (o) values.push({ name: "url", value: o["href"] });

        o = article.querySelector("span.company-rank");
        if (o) values.push({ name: "Rank", value: o.innerText });

        o = article.querySelector("span.company-title");
        if (o) values.push({ name: "Name", value: o.innerText });

        return values;
      });
    })).filter(o => Array.isArray(o) && o.length > 0);

    for (let i = 0; i < this.items.length; i += global.maxConcurentDetailsDownloads) {
      let end = i + global.maxConcurentDetailsDownloads;
      if (end >= this.items.length) end = this.items.length;

      console.log(`Dowloading details ${i + 1}-${end} of ${this.items.length}`);

      let xx = this.items.slice(i, end);
      await Promise.all(xx.map(i => this.downloadItemDetails(i)));
    }
  }

  async downloadItemDetails(item) {
    try {
      let urlField = item.filter(i => i.name == "url");
      if (urlField.length == 0) return;

      let tmpPage = await this.browser.newPage();
      await tmpPage.goto(urlField[0].value, {
        timeout: global.navigateTimeout
      });

      item.push(
        ...(await tmpPage.evaluate(() => {
          return Array.from(
            document.querySelectorAll("div.company-info-card-table>div>div.row")
          ).map(row => {
            let n = row.querySelector(".company-info-card-label");
            let v = row.querySelector("div>div.company-info-card-data>p");

            if (n && v) return { name: n.innerText, value: v.innerText };

            return null;
          });
        })).filter(i => i)
      );

      item.push(
        ...(await tmpPage.evaluate(() => {
          return Array.from(document.querySelectorAll("div.F500-table>div>table>tbody>tr")).map(
            row => {
              let tds = row.querySelectorAll("td");
              if (tds && tds.length > 2) {
                return {
                  name: tds[0].innerText,
                  value: tds[1].innerText != "" ? tds[1].innerText : tds[2].innerText
                };
              }

              return null;
            }
          );
        })).filter(i => i)
      );

      await tmpPage.close();
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = ScraperNew;
