export {SearchFilter}
//@ts-check
type IiText = { ii: Array<number>, nfkcText: string };
class SearchFilter {
	public ignore_case: boolean;
	public ignore_accents: boolean;
	public regex: boolean;
	public filter: {(text: string): IiText};
  static combining_chars_regex = /\p{Mark}/gu;

  /**
   * @param {string} query 
   * @param {{ignore_case: boolean, ignore_accents: boolean, regex: boolean}} 
   */
  constructor(query: string, { ignore_case = true, ignore_accents = true, regex = false}: { ignore_case: boolean; ignore_accents: boolean; regex: boolean; }) {
    this.ignore_case = ignore_case;
    this.ignore_accents = ignore_accents;
    this.regex = regex;

    /**
    * @param {string} text 
    * @returns { {ii: Array<number>, nfkcText: string}} // {IndexText}
    */
    this.filter = regex ? (text) => { const _re = RegExp(query.trim(), ignore_case ? 'ui' : 'u'); 
      const org_text = text.slice().trim();
      if (org_text.length == 0) {
        console.warn("text consists of only spaces!");
        return {ii: [], nfkcText: ''};
      }
      const nfkd_text = org_text.normalize('NFKD');
      if (nfkd_text.length != org_text.length) {
        console.warn(`text length changed by NFKD normalize.`);
      }
      text = nfkd_text.replace(/[\s\n]+/gu, ' '); // compress spaces
      const nfkcText = org_text.normalize('NFKC').replace(/[\s\n]+/gu, ' ');
      if (text.length == 0) {
        console.warn("text became empty after trimming, normalizing and replacing spaces.");
        return {ii: [], nfkcText: ''};
      }
      if (this.ignore_accents) {
        text = text.replace(SearchFilter.combining_chars_regex, '');
        console.assert(text.length > 0, "text became empty after replacing accents!");
        console.assert(text.length === nfkcText.length, "Search text length changed by normalize and replacing accents.")
      }
        const _ii = text.match(_re);
        if (_ii?.index) {
          const ii = [_ii.index, _ii.index + _ii[0].length];
          return { ii, nfkcText };
        }
        else {
          return { ii: [], nfkcText };
        }
    } : 
    (text) => {
      const org_text = text.slice().trim();
      if (org_text.length == 0) {
        console.warn("text consists of only spaces!");
        return {ii: [], nfkcText: ''};
      }
      const nfkd_text = org_text.normalize('NFKD');
      if (nfkd_text.length != org_text.length) {
        console.warn(`text length changed by NFKD normalize.`);
      }
      text = nfkd_text.replace(/[\s\n]+/gu, ' '); // compress spaces
      const nfkcText = org_text.normalize('NFKC').replace(/[\s\n]+/gu, ' ');
      if (!text) {
        console.warn("text became empty after trimming, normalizing and replacing spaces.");
        return {ii: [], nfkcText: ''};
      }
      if (this.ignore_accents) {
        text = text.replace(SearchFilter.combining_chars_regex, '');
        console.assert(text.length > 0, "text became empty after replacing accents!");
        console.assert(text.length == nfkcText.length, "Search text length changed by normalize and replacing accents.")
      }
        const _i = ignore_case ? text.toLowerCase().indexOf(query.trim().toLowerCase()) : text.indexOf(query.trim());
        if (_i < 0) {
          return { ii: [], nfkcText };
        }
        else {
          return { ii: [_i, _i + query.length], nfkcText };
        }
    } ;
  }

}