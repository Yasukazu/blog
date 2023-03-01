import {Search} from "./search.js";
// const search = new Search();
// const searchInput = new SearchInput(search.search_func);
function search_input({
ignore_accents_selector = "input#ignore-accents", // checkbox
ignore_case_selector = "input#ignore-case", // checkbox
search_text_selector = "input#search-text", // text
search_result_output_selector = "div#search-result-output", // div
submit_search_selector = "button#submit-search", // button
entries_template_selector = "template#"
}={}) {
  debugger;
const submit_search_button = document.querySelector(submit_search_selector);
const search_text = document.querySelector(search_text_selector);
const search_result_output = document.querySelector(search_result_output_selector);
if (submit_search_button && search_text && search_result_output) {
  submit_search_button.addEventListener("click", (event) => {
    let queryWord = search_text.value;
    if (queryWord) {
      const ignore_case_checked = document.querySelector(ignore_case_selector)?.checked ? true : false;
      const ignore_accents_checked = document.querySelector(ignore_accents_selector)?.checked ? true : false;
      const search = new Search();
      search.exec_search(queryWord, ignore_case_checked, ignore_accents_checked);
    }
    event.preventDefault();
  });
}
else
  throw Error(`!No ${submit_search_selector}`);
}