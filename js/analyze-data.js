//@ts-check
import {SearchFilter} from "./walkTextNodes.js";
import { SearchOutput } from "./search-output.js";
export {exec_search, analyzeData, fetchData};


class ItemMap {
  static test_items = ['title:text', 'content:html'];

  /**
   * Picks up query-matching entries
   * @param {Element} entry 
   * @param {string} query_str // Regex expression
   * @param {{ignore_case: boolean, ignore_accents: boolean}}
   */
  constructor(entry, query_str, {ignore_case = true, ignore_accents = true}) {
    /** @type {Map<string, {ii: number[], nfkcText: string}>} */
    this.map = new Map();
    const query = query_str.normalize('NFKD');
    const combining_chars_regex = ignore_accents ? /\p{Mark}/gu : '';
    this.query = ignore_accents ? query.replace(combining_chars_regex, '') : query;
    const url = entry.querySelector('url')?.textContent;
    if (!url)
      throw Error('Failed to get url from entry!');
    this.url = url; 
    const searchFilter = new SearchFilter(query, {ignore_case, ignore_accents});
    this.filter = searchFilter.filter;// IndexText
    this.test(entry);
  }

  /**
   * @param {Element} entry
   */
  test(entry) {
    for (const item_type of ItemMap.test_items) { 
      const [item, type] = item_type.split(':');
      const content = entry.querySelector(item)?.textContent;
      if (content) { 
        if (type == 'html') { // content
          const content_tree = new DOMParser().parseFromString(content, "text/html");
          if (!content_tree) {
            throw Error(`Failed to parse from string text/html at entry:${entry.TEXT_NODE}`);
          }
          const bodyText = content_tree.body.textContent;
          if (bodyText) {
            const filter_result = this.filter(bodyText);
            this.map.set(item, filter_result);
          }
          else
            throw Error(`content_tree.body.textContent not found!`);
        }
        else { // title
          const filter_result = this.filter(content); 
          this.map.set(item, filter_result);
        }
      }
      else {
        console.info(`No content in ${item} of ${entry} !`);
      }
    }
    if (!this.map.has('title')) {
      this.map.set('title', {ii: [], nfkcText: ''});
    }
    if (!this.map.has('content')) {
      this.map.set('content', {ii: [], nfkcText: ''});
    }
  }

  /**
   * @returns {string}
   */
  get title() {
    const title = this.map.get('title');
    if (title) {
      return title.nfkcText;
    }
    else {
      return '';
      // throw Error('No title in map!');
    }
  }

  /**
   * @returns {string}
   */
  get content() {
      const text = this.map.get('content')?.nfkcText;
      if (typeof(text) == 'undefined')
       throw Error('text is undefined in content of ItemMap!');
      return text;
  }

  /**
   * @returns {boolean}
   */
  get isValid() {
    for (const item of ['title', 'content']) {
      const content = this.map.get(item);
      if (content && content.ii.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * @returns {number[]}
   */
  get ii() {
    const ii = this.map.get('content')?.ii;
    if (!ii)
      throw Error('No ii in map!');
    return ii;
  }

}

class FullMap {
  /**
   * 
   * @param {Element} entry 
   * @param {ItemMap} itemMap 
   */
  constructor(entry, itemMap) {
    this.entry = entry;
    this.itemMap = itemMap;
  }

  /**
   * @returns {string|undefined|null}
   */
  get title() {
    const t = this.itemMap.title;
    if (!t) {
      return this.entry.querySelector('title')?.textContent;
    }
  }

  /**
   * @returns {string|undefined|null}
   */
  get content() {
    const c = this.itemMap.content;
    if (!c) {
      return this.entry.querySelector('content')?.textContent;
    }
  }

  /**
   * @returns {number[]|undefined}
   */
  get ii() {
    return this.itemMap.ii;
  }

  /**
   * @returns {string|null}
   */
  get markedContent() {
    if (this.content && this.ii)
      return mark_text(this.content, this.ii);
    else
      return null;
  }

  /**
   * @returns {string|undefined|null}
   */
  get url() {
    return this.entry.querySelector('url')?.textContent;
  }

}

/**
 * Picks up query-matching entries
 * @param {Document} document // XML
 * @param {string} query_str // Regex expression
 * @param {{ignore_case: boolean, ignore_accents: boolean}}
 * @yields {ItemMap} 
 */
function* analyzeData(document, query_str, {ignore_case = true, ignore_accents = true}) {
  const entries = document.querySelectorAll('entry');
  if (!entries)
    throw Error(`No entries!`);
  for (const entry of entries) {
    const itemMap = new ItemMap(entry, query_str, {ignore_case, ignore_accents});
    if (itemMap.isValid) {
      yield itemMap;
    }
  }
}

/**
 * @param {Promise} fetch_data
 * @param {string} query
 * @param {{ignore_case: boolean, ignore_accents: boolean}}
 * @param {{id: string, heading: string, entries: string}}search_result_container_map
 * @param {{id: string, title: string, date: string, content: string}} search_result_entry_map
 */
function exec_search(fetch_data = fetchData(), query, { ignore_case = true, ignore_accents = true }, search_result_container_map, search_result_entry_map) {
  fetch_data.then(xml => {
    const search_output = new SearchOutput(search_result_container_map, search_result_entry_map);
    for (const itemMap of analyzeData(xml, query, { ignore_case, ignore_accents })) {
      search_output.addSearchResult({url: itemMap.url, title: itemMap.title, content: itemMap.content, ii: itemMap.ii});
    }
    const count = search_output.count;
    search_output.addHeading(`${count} post(s) found:`);
  }, reason => {
    throw Error(`exec_search failed. reason:${reason}`);
  })
}


const fetch_path = '/search.xml';
/**
 * 
 * @param {string} fetchUrl 
 * @returns {Promise}
 */
function fetchData(fetchUrl = fetch_path) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', fetchUrl, true)
    xhr.responseType = 'document'
    xhr.overrideMimeType('text/xml')
    xhr.onreadystatechange = () => {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200 || xhr.status === 304) {
          resolve(xhr.response)
        }
      }
    }
    xhr.send(null)
  })
}