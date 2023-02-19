//@ts-check
// import {makeThumbnail} from './thumbnail.js';
/**
 * 
 * @param {string} fetchUrl 
 * @returns {Promise}
 */
function fetchData (fetchUrl) {
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

// import XRegExp from 'xregexp/xregexp-all.js';
/**
 * 
 * @param {Document} document // XML
 * @param {string} query_str // Regex expression
 * @returns {Object< Array<Element>, Array<string> >}
 */
function analyzeData(document, query_str) {
  const entries = document.getElementsByTagName('entry');
  const matchEntries = [];
  const matchItems = [];
  const normalized_query = query_str.normalize('NFKD');
  const combining_chars_regex = /\p{Mark}/gu;
  const query = normalized_query.replace(combining_chars_regex, '');
  const query_regex = RegExp(query, 'i'); // ignore case
  const test_children = [0, 2];
  const test_items = ['title', 'content'];
  for (let entry of entries) {
    let match = false;
    let content = '';
    let item = '';
    for (item of test_items) { // for (let cn of test_children) {
      const elements = entry.querySelectorAll(item);
      if (elements) {
        for (let elem of elements) {
          let text = elem.textContent;
          if (text) {
            content = text.normalize('NFKD').replace(combining_chars_regex, "");
            if (content && query_regex.test(content)) {
              match = true;
              break;
            }
          }
        }
      }
    }
    if (match)
      matchEntries.push(entry);
      matchItems.push(item);
  }
  return {'entries': matchEntries, 'items': matchItems};
}

/**
 * 
 * @param {Array<Element>} entries
 * @param {Array<string>} items 
 * @returns {Element}
 */
function makeSearchResultFromTemplates (entries, items) {
  let template_str = "template#search-result-container";
  let template = document.querySelector(template_str);
  if (!template) {
    throw `'${template_str}' is not found!`;
  }
  const search_result_container = document.importNode(template.content, true);
  const search_result_entries = search_result_container.querySelector('.entries');
  if (!search_result_entries) {
    throw `.entries is not found in search result container!`;
  }

  template_str = "template#search-result-entry";
  template = document.querySelector(template_str);
  if (!template) {
    throw `'${template_str}' template is not found!`;
  }
  for (const [index, entry] of entries.entries()) {
    const entry_output = document.importNode(template.content, true);
    const title = entry.querySelector('title')?.textContent; // children[0]
    if (!title) {
      throw "No title in entry!";
    }
    const url = entry.querySelector('url')?.textContent; // 2
    if (!url) {
      throw "No 'url' in entry!";
    }
    const ar = entry_output.querySelector('a.title');
    if (!ar) {
      throw "No 'a' in template!"
    }
    ar.href = url;
    ar.innerText = title;
    const date_str = startsFromDate(url);
    if (date_str) {
      const dt = entry_output.querySelector('.date');
      if (dt) {
        dt.innerText = date_str;
      }
    }
    const ct = entry_output.querySelector('.content');
    if (ct){
      const content_elem = entry.querySelector('content'); // ?.textContent;
      if (content_elem && content_elem.textContent) {
        const content_tree = new DOMParser().parseFromString(content_elem.textContent, "text/html");
        const innerHTML = content_tree?.children[0]?.innerHTML; // textContent;
        if (innerHTML) {
          const cpcp = Array.from(innerHTML.replace(/<[^>]*>/g, ' ')); // code point sequences
          const length = ct.getAttribute('data-length');
          let len = 300;
          if (length) {
            const _len = parseInt(length, 10);
            if (_len) {
              len = _len;
            }
          }
          const {output: limitedStr, on_break: onBreak} = getFirstNChars(cpcp, len);
          ct.innerText = limitedStr + (onBreak ? '...' : '');
          const img_out = entry_output.querySelector('img');
          if (img_out) {
            const img_in = content_tree.querySelector('img');
            if (img_in) {
              const img_src = img_in.getAttribute('src');
              if (img_src) {
                img_out.setAttribute('src', img_src);
              }
            }
          }
        }
      }
    }
    const it = entry_output.querySelector('.found-in');
    if (it) {
      it.innerText += items[index];
    }
    search_result_entries.append(entry_output);
  }
  return search_result_container;
}

/**
 * 
 * @param {string[]} src 
 * @param {Number} n 
 * @returns {Object}
 */
function getFirstNChars(src, n) {
  let lc = '';
  let i = 0;
  let out = '';
  let on_break = false;
  for (let c of src) {
    if (lc === ' ' && lc === c) {
      continue;
    }
    else {
      lc = c;
    }
    out += c;
    if(++i >= n) {
      on_break = true;
      break;
    }
  }
  return {output: out, on_break: on_break};
}

/**
 * Check url string represents a valid date
 * @param {string} url 
 * @returns {string}
 */
function startsFromDate(url) {
  const re = /(\d\d\d\d)\/(\d\d)\/(\d\d)/;
  const date = re.exec(url);
  if (date && date.length > 3) {
    const dt = [date[1], date[2], date[3]].join('-');
    const dateNum = Date.parse(dt);
    if (!isNaN(dateNum))
      return dt;
  }
  return '';
}

const search_result_str = "#search-result";
const searchResult = document.querySelector(search_result_str);
if (!searchResult) {
  console.error(`${search_result_str} is not found!`);
}

const fetch_path = '/search.xml';
const fetch_data = fetchData(fetch_path);
if (!fetch_data) {
  console.error("fetch_data promise is null!");
}

const search_text_tag = "input#search-text";
const search_text = document.querySelector(search_text_tag);
if (!search_text) {
  console.error(search_text_tag + " is not found.");
}

/**
 * 
 * @returns {boolean}
 */
function search() {
  if (!fetch_data) {
    throw "'Cause fetch_data is null, exiting search()..";
  }
  if (!searchResult) {
    throw search_result_str + " is not found!";
  }
  if (!search_text) {
    throw search_text_tag + " is not found.";
  }
  const queryWord = search_text.value;
  if (!queryWord || queryWord.length <= 0) {
    console.log("No search_text.value or search_text.length <= 0 !");
    return false;
  }
  // let search_result = `FetchData from ${fetch_path} with ${queryWord}`;
  fetch_data.then(document => {
    const {entries, items} = analyzeData(document, queryWord); 
    if (entries.length <= 0) {
      console.log("entries.length is zero.");
    }
    while (searchResult.firstChild) {
      searchResult.firstChild.remove();
    }
    const search_result = makeSearchResultFromTemplates(entries, items);
    if (search_result) {
      searchResult.append(search_result);
    }
    // searchResult.innerHTML = search_result;
    // Event.preventDefault();
  })
  return true;
}