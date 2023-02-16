//@ts-check
// import {XRegExp} from 'xregexp';
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
 * @returns {Array<Element>}
 */
function analyzeData(document, query_str) {
  const entries = document.getElementsByTagName('entry');
  const matchEntries = [];
  const normalized_query = query_str.normalize('NFKD');
  const combining_chars_regex = /\p{Mark}/gu;
  const query = normalized_query.replace(combining_chars_regex, '');
  const query_regex = RegExp(query);
  const test_children = [0, 2];
  for (var entry of entries) {
    let match = false;
    let content = '';
    for (var cn of test_children) {
      let _content = entry.children[cn]?.textContent;
      if (_content)
        content = _content.normalize('NFKD').replace(combining_chars_regex, "");
      if (query_regex.test(content)) {
        match = true;
        break;
      }
    }
    if (match)
      matchEntries.push(entry);
  }
  return matchEntries;
}

/**
 * 
 * @param {Array<Element>} entries 
 * @returns {Element}
 */
function makeSearchResultFromTemplates (entries) {
  let template_str = "template#search-result-container";
  let template = document.querySelector(template_str);
  if (!template) {
    throw `${template_str} is not found!`;
  }
  const search_result_container = document.importNode(template.content, true);
  const search_result_entries = search_result_container.querySelector('.entries');
  if (!search_result_entries) {
    throw `.entries is not found!`;
  }

  template_str = "template#search-result-entry";
  template = document.querySelector(template_str);
  if (!template) {
    throw `${template_str} is not found!`;
  }
  for (let entry of entries) {
    const entry_output = document.importNode(template.content, true);
    const title = entry.children[0].textContent
    if (!title) {
      throw "No title!";
    }
    const url = entry.children[2].textContent
    if (!url) {
      throw "No url!";
    }

    // const tags = entry.children[4].textContent
    const ar = entry_output.querySelector('a.title');
    ar.href = url;
    ar.innerText = title;
    // pick up date from url beginning
    const date_str = startsFromDate(url);
    if (date_str) {
      const dt = entry_output.querySelector('.date');
      if (dt) {
        dt.innerText = date_str;
      }
    }

    const ct = entry_output.querySelector('.content');
    if (ct){
      const content = entry.children[3].textContent;
      const content_tree = content ? new DOMParser().parseFromString(content, "text/html") : null;
      const text_content = content_tree?.children[0]?.textContent;
      if (text_content) {
        // ct.innerText = content.replace(/<[^>]*>/g, '').substring(0, 300) + '...';
        ct.innerText = text_content.substring(0, 300) + '...';
      }
    }
    search_result_entries.append(entry_output);
  }
  return search_result_container;
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
    const entries = analyzeData(document, queryWord); 
    if (entries.length <= 0) {
      console.log("entries.length is zero.");
    }
    while (searchResult.firstChild) {
      searchResult.firstChild.remove();
    }
    const search_result = makeSearchResultFromTemplates(entries)
    if (search_result) {
      searchResult.append(search_result);
    }
    // searchResult.innerHTML = search_result;
    // Event.preventDefault();
  })
  return true;
}