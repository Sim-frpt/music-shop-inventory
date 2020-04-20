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
