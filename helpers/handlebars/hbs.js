const hbs = require('hbs');

hbs.registerHelper("capitalize", function(options) {
  if (! Array.isArray(options.fn(this)) && typeof options.fn(this) !== 'string') {
    return '';
  };

  const strings = options.fn(this).split(' ');

  return strings
    .map( string => string.charAt(0).toUpperCase() + string.substring(1))
    .join(' ');
});

// This helper will check every element in this block against the "selected" variable and subsequently make the corresponding option selected
hbs.registerHelper("markAsSelected", function(selected, options) {
  return options.fn(this).replace(
    new RegExp(' value=\"' + selected + '\"'),
    '$& selected="selected"');
});
