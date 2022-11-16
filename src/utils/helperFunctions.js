const { dateFromStr, monthName, dayName, timeStrDate }  = require('./dateFormat');

const setvar = (varName, varValue, options) => {
  options.data.root[varName] = varValue;
};

const isdatechange = (strtime, strtime2, options) => { 
  return strtime.substr(0,8) != strtime2.substr(0,8); 
};

const tostringdate = (strtime, options) => { 
  let ndate = dateFromStr(strtime);
  return dayName(ndate)+ ', ' + ndate.getDate() + ' ' + monthName(ndate) + ' ' +ndate.getFullYear();
};

const tostringtime = (strtime, options) => { 
  return timeStrDate(strtime);
};

const when = (operand_1, operator, operand_2, options) => {
  var operators = {
   'eq': function(l,r) { return l == r; },
   'noteq': function(l,r) { return l != r; },
   'gt': function(l,r) { return Number(l) > Number(r); },
   'or': function(l,r) { return l || r; },
   'and': function(l,r) { return l && r; },
   '%': function(l,r) { return (l % r) === 0; }
  }
  , result = operators[operator](operand_1,operand_2);

  if (result) return options.fn(this);
  else  return options.inverse(this);
};

module.exports = { setvar, isdatechange, tostringdate, tostringtime, when };