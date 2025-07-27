import * as cheerio from 'cheerio';

export function cleanHtml(rawHtml) {
  const $ = cheerio.load(rawHtml || '');
  $('[style]').removeAttr('style');
  return $.html(); // removes all HTML and styles
}