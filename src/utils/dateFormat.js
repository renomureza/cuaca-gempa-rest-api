/**
 * Format date to string YYYYMMDDhhmm
 * @param Date ddate
 * @returns String 
 */
const dateFormat = (ddate) => {
  let year = ddate.getFullYear();
  let month = (ddate.getMonth()+1)+'';
  let day = ddate.getDate()+'';
  let h = ddate.getHours()+'';
  let m = ddate.getMinutes()+'';
  let s = ddate.getSeconds()+'';

  month = ((month.length<2) ? '0':'')+month;
  day = ((day.length<2) ? '0':'')+day;  
  h = ((h.length<2) ? '0':'')+h;  
  m = ((m.length<2) ? '0':'')+m;
  s = ((s.length<2) ? '0':'')+s;
  return year+''+month+day+h+m;
};

/**
 * String date YYYYMMDDhhmm to Date
 * @param String strdate
 * @returns Date
 */
const dateFrom = (strdate) => {
  let y = strdate.substr(0,4);
  let m = strdate.substr(4,2);
  let d = strdate.substr(6,2);
  let hh = strdate.substr(8,2);
  let mm = strdate.substr(10,2);

  let ndate = new Date(y, m, d, hh, mm);
  return ndate;
};

/**
 * String date YYYYMMDDhhmm to Date
 * @param String strdate
 * @returns Date
 */
const timeStrDate = (strdate) => {
  return strdate.substr(8,2) + ':' + strdate.substr(10,2);  
};

module.exports = { dateFormat, dateFrom, timeStrDate };
