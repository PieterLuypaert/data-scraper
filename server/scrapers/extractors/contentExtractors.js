const { extractAttributes } = require('../../utils/helpers');

/**
 * Extract paragraphs
 */
function extractParagraphs($) {
  const paragraphs = [];
  
  $('p').each((i, elem) => {
    const text = $(elem).text().trim();
    const id = $(elem).attr('id') || '';
    const className = $(elem).attr('class') || '';
    if (text) {
      paragraphs.push({
        text,
        id,
        className,
        attributes: extractAttributes($, elem)
      });
    }
  });
  
  return paragraphs;
}

/**
 * Extract lists
 */
function extractLists($) {
  const lists = {
    unordered: [],
    ordered: []
  };
  
  $('ul').each((i, elem) => {
    const items = [];
    $(elem).find('li').each((j, li) => {
      const text = $(li).text().trim();
      const id = $(li).attr('id') || '';
      const className = $(li).attr('class') || '';
      if (text) {
        items.push({ text, id, className });
      }
    });
    if (items.length > 0) {
      lists.unordered.push({
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        items
      });
    }
  });
  
  $('ol').each((i, elem) => {
    const items = [];
    $(elem).find('li').each((j, li) => {
      const text = $(li).text().trim();
      const id = $(li).attr('id') || '';
      const className = $(li).attr('class') || '';
      if (text) {
        items.push({ text, id, className });
      }
    });
    if (items.length > 0) {
      lists.ordered.push({
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        items
      });
    }
  });
  
  return lists;
}

/**
 * Extract tables
 */
function extractTables($) {
  const tables = [];
  
  $('table').each((i, elem) => {
    const table = {
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      caption: $('caption', elem).text().trim() || '',
      headers: [],
      rows: []
    };
    
    // Extract headers
    $('thead th, tr:first-child th, tr:first-child td', elem).each((j, th) => {
      const text = $(th).text().trim();
      if (text) table.headers.push(text);
    });
    
    // Extract rows
    $('tbody tr, tr', elem).each((j, tr) => {
      const row = [];
      $(tr).find('td, th').each((k, td) => {
        const text = $(td).text().trim();
        row.push(text);
      });
      if (row.length > 0) table.rows.push(row);
    });
    
    if (table.headers.length > 0 || table.rows.length > 0) {
      tables.push(table);
    }
  });
  
  return tables;
}

/**
 * Extract forms
 */
function extractForms($) {
  const forms = [];
  
  $('form').each((i, elem) => {
    const form = {
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      action: $(elem).attr('action') || '',
      method: $(elem).attr('method') || 'get',
      enctype: $(elem).attr('enctype') || '',
      inputs: [],
      buttons: [],
      selects: [],
      textareas: []
    };
    
    // Extract inputs
    $(elem).find('input').each((j, input) => {
      form.inputs.push({
        type: $(input).attr('type') || 'text',
        name: $(input).attr('name') || '',
        id: $(input).attr('id') || '',
        placeholder: $(input).attr('placeholder') || '',
        value: $(input).attr('value') || '',
        required: $(input).attr('required') !== undefined,
        attributes: extractAttributes($, input)
      });
    });
    
    // Extract selects
    $(elem).find('select').each((j, select) => {
      const options = [];
      $(select).find('option').each((k, option) => {
        options.push({
          value: $(option).attr('value') || '',
          text: $(option).text().trim(),
          selected: $(option).attr('selected') !== undefined
        });
      });
      form.selects.push({
        name: $(select).attr('name') || '',
        id: $(select).attr('id') || '',
        options
      });
    });
    
    // Extract textareas
    $(elem).find('textarea').each((j, textarea) => {
      form.textareas.push({
        name: $(textarea).attr('name') || '',
        id: $(textarea).attr('id') || '',
        placeholder: $(textarea).attr('placeholder') || '',
        rows: $(textarea).attr('rows') || '',
        cols: $(textarea).attr('cols') || '',
        value: $(textarea).text().trim()
      });
    });
    
    // Extract buttons
    $(elem).find('button, input[type="submit"], input[type="button"]').each((j, btn) => {
      form.buttons.push({
        type: $(btn).attr('type') || 'button',
        text: $(btn).text().trim() || $(btn).attr('value') || '',
        id: $(btn).attr('id') || '',
        className: $(btn).attr('class') || ''
      });
    });
    
    forms.push(form);
  });
  
  return forms;
}

/**
 * Extract standalone buttons
 */
function extractButtons($) {
  const buttons = [];
  
  $('button').each((i, elem) => {
    // Skip buttons that are inside a form
    if ($(elem).closest('form').length > 0) {
      return;
    }
    buttons.push({
      text: $(elem).text().trim(),
      type: $(elem).attr('type') || 'button',
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      attributes: extractAttributes($, elem)
    });
  });
  
  return buttons;
}

module.exports = {
  extractParagraphs,
  extractLists,
  extractTables,
  extractForms,
  extractButtons
};

