"use strict";

const puppeteer = require("puppeteer");
const ScraperNew = require("./scraperNew");
const ScraperOld = require("./scraperOld");

global.fortune500ListLength = 10; //should be 1000 if you need full list
global.retrieveDataTimeOut = 3000000; //ms
global.navigateTimeout = 3000000; //ms
global.maxConcurentDetailsDownloads = 3;
global.csvColumnSeparator = ";";
global.csvRowSeparator = "\r\n";
global.resultsDirectory = "./results";

(async () => {
  let browser = await puppeteer.launch({ headless: true });

  //await new ScraperOld(browser, "http://fortune.com/fortune500/2008/", "2008.csv").getData();
  //await new ScraperOld(browser, "http://fortune.com/fortune500/2009/", "2009.csv").getData();
  //await new ScraperOld(browser, "http://fortune.com/fortune500/2010/", "2010.csv").getData();
  //await new ScraperOld(browser, "http://fortune.com/fortune500/2011/", "2011.csv").getData();
  //await new ScraperOld(browser, "http://fortune.com/fortune500/2012/", "2012.csv").getData();
  //await new ScraperOld(browser, "http://fortune.com/fortune500/2013/", "2013.csv").getData();
  await new ScraperOld(browser, "http://fortune.com/fortune500/2014/", "2014.csv").getData();

  //await new ScraperNew(browser, "http://fortune.com/fortune500/2015/list", "2015.csv").getData();
  //await new ScraperNew(browser, "http://fortune.com/fortune500/2016/list", "2016.csv").getData();
  //await new ScraperNew(browser, "http://fortune.com/fortune500/2017/list", "2017.csv").getData();
  //await new ScraperNew(browser, "http://fortune.com/fortune500/list/", "2018.csv").getData();

  await browser.close();
})();
