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

function analyzeData(document, query) {
  const entries = document.getElementsByTagName('entry')
  const matchEntries = []
  for (var entry of entries) {
    const regExp = new RegExp(query)
    if (regExp.test(entry.children[0].textContent) ||
        regExp.test(entry.children[2].textContent)) {
      matchEntries.push(entry)
    }
  }
  return matchEntries
}

function makeSearchResult (entries) {
  let innerHTML = ''
  for (let entry of entries) {
    innerHTML += '<div class="search-result-entry">'
    const title = entry.children[0].textContent
    const url = entry.children[3].textContent
    const content = entry.children[3].textContent
    innerHTML += '<h2><a href="' + url + '">' + title + '</a></h2>'
    const thumbnail = /<img[^>]*>/.exec(content)
    if (thumbnail && thumbnail.length >= 1) {
      innerHTML += '<div class="search-result-thumbnail">' + thumbnail[1] + '</div>'
    }
    innerHTML += content.replace(/<[^>]*>/g, '').substring(0, 300)
    innerHTML += '...</div>'
  }
  return innerHTML
}

function getSearchQueryFromUrlParams () {
  const params = window.location.search.substring(1).split('&');
  const search = params.filter(param => param.search(/$search=/));
  return search.length > 0 ? search[0].split('=')[1] : null;
}

const template_search_result_str = "template#search-result";
let searchResultStr = "search-result";
let form = document.querySelector("form#search");
if (!form) {
  console.log("'form#search' is not found.");
}

const search_text_tag = "input#search-text";
function search() {
  const searchResult = document.querySelector(template_search_result_str);
  if (!searchResult) {
    console.error(template_search_result_str + " is not found!");
    return false;
  }
  const search_text = document.querySelector(search_text_tag);
  if (!search_text) {
    console.error(search_text_tag + " is not found.");
    return false;
  }
  if (search_text.value.length <= 0) {
    console.error("search text length is 0!");
    return false;
  }
  const queryWord = search_text.value;
  const fetch_path = '/search.xml';
  searchResult.textContent = `FetchData from ${fetch_path} with ${queryWord}`;
  fetchData('/search.xml').then(document => {
    const entries = analyzeData(document, queryWord); 
    if (entries.length <= 0) {
      console.log("entries.length is zero.");
    }
    debugger;
    searchResult.innerHTML = makeSearchResult(entries)
  })
  return true;
}

// Replace serchResultStr to 'plugin-search-result' if '#search-result' not found.
function init_search() {
  let searchResult = document.querySelector(`#${searchResultStr}`);
  if (!searchResult) {
    const url_prefix = "plugin-";
    console.log(`#${searchResultStr} is not found.`);
    searchResultStr = url_prefix + searchResultStr;
    console.log(`Fell back to #${searchResultStr}.`);
    searchResult = document.querySelector(`#${searchResultStr}`);
    if (!searchResult) {
      console.error(searchResultStr + " is not found!");
      return false;
    }
    searchResult.textContent = 'Loading...'
    fetchData('/search.xml').then(document => {
      const queryWord = getSearchQueryFromUrlParams();
      if (queryWord == null) {
        console.log("Query word is null.");
        return;
      }
      console.log(`Query word is ${queryWord}.`);
      const entries = analyzeData(document, queryWord); 
      searchResult.innerHTML = makeSearchResult(entries)
    })
    return true;
  }
  return true;
}

if (!init_search())
  console.error("init_search() call failed!");