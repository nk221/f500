/*global document*/
"use strict";
const fs = require("fs");

class Scraper {
  constructor(browser, url, fileName, lastNumSelector, delay, keysToSend) {
    this.browser = browser;
    this.url = url;
    this.fileName = fileName;
    this.lastNum = 0;
    this.page = null;
    this.lastNumSelector = lastNumSelector;
    this.delay = delay;
    this.keysToSend = keysToSend;
    this.items = [];
  }

  async getData() {
    try {
      this.prepareTarget();
      if (!(await this.getPageData())) return;
      await this.parseItems();
      await this.saveData();
      await this.page.close();
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async parseItems() {}

  prepareTarget() {
    if (!fs.existsSync(global.resultsDirectory)) {
      fs.mkdirSync(global.resultsDirectory);
    }
    if (fs.existsSync(this.getFileName())) fs.unlinkSync(this.getFileName());
  }

  getFileName() {
    return `${global.resultsDirectory}/${this.fileName}`;
  }

  async saveData() {
    let keys = [];
    //find unique keys
    this.items.forEach(i => {
      i.forEach(j => {
        if (j.name != "url" && keys.indexOf(j.name) == -1) keys.push(j.name);
      });
    });

    let data =
      `${keys.map(value => `"${value}"`).join(global.csvColumnSeparator)}` + global.csvRowSeparator;

    this.items.forEach(i => {
      let values = [];
      keys.forEach(key => {
        let v = i.filter(x => x.name == key);
        values.push(v.length > 0 ? v[0].value : null);
      });

      data +=
        `${values
          .map(value => {
            if (null == value) return "";
            if (Number.isInteger(value)) return value;
            return `"${value}"`;
          })
          .join(global.csvColumnSeparator)}` + global.csvRowSeparator;
    });

    fs.writeFile(this.getFileName(), data, async err => {
      if (err) {
        return console.log(err);
      }

      console.log(`The file ${this.fileName} was saved.`);
    });
  }

  async getPageData() {
    this.lastNum = 0;
    this.page = await this.browser.newPage();

    console.log(`Navigating to ${this.url}...`);
    await this.page.goto(this.url, { timeout: global.navigateTimeout });

    console.log(`Retrieving data...`);
    while (await this.loadData());
    if (this.lastNum >= global.fortune500ListLength) console.log(`Retrieving data finished.`);

    return this.lastNum >= global.fortune500ListLength;
  }

  async getLastNum() {
    return await this.page.evaluate(selector => {
      let child = document.querySelector(selector);
      return child ? parseInt(child.textContent) : 0;
    }, this.lastNumSelector);
  }

  trim(str) {
    return str ? str.replace(new RegExp(/(\s{2,})/g), " ").trim() : str;
  }

  async loadData() {
    let dataTimeOut = global.retrieveDataTimeOut;
    let currNum = await this.getLastNum();

    if (currNum < global.fortune500ListLength) {
      while (currNum == this.lastNum && dataTimeOut > 0) {
        this.keysToSend.forEach(async key => await this.page.keyboard.press(key));
        await sleep(this.delay);
        currNum = await this.getLastNum();
        dataTimeOut -= this.delay;
      }
    }

    if (currNum == this.lastNum) {
      console.log(`Failed to get new data`);
      return false;
    }

    console.log(`${currNum} items loaded`);
    this.lastNum = currNum;
    return this.lastNum < global.fortune500ListLength;
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports = Scraper;
