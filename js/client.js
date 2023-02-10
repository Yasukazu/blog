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
  const params = window.location.search.substring(1).split('&')
  const search = params.filter(param => param.search(/$search=/))
  return search.length > 0 ? search[0].split('=')[1] : null
}

function init() {
  const searchResult = document.getElementById("plugin-search-result")
  searchResult.textContent = 'Loading...'
  fetchData('/search.xml').then(document => {
    const entries = analyzeData(document, getSearchQueryFromUrlParams())
    searchResult.innerHTML = makeSearchResult(entries)
  })
}
