const dateFormat = (ddate) => {
  let year = ddate.getFullYear();
  let month = (ddate.getMonth()+1)+'';
  let day = ddate.getDate()+'';
  let h = ddate.getHours()+'';
  let m = ddate.getMinutes()+'';
  let s = ddate.getSeconds()+'';
  console.log('==', month.length);
  month = ((month.length<2) ? '0':'')+month;
  day = ((day.length<2) ? '0':'')+day;  
  h = ((h.length<2) ? '0':'')+h;  
  m = ((m.length<2) ? '0':'')+m;
  s = ((s.length<2) ? '0':'')+s;
  return year+''+month+day+h+m;
};

module.exports = dateFormat;
