const moment = require('moment');
const ls = require('../common/latexsnips');
const funcs = require('../common/funcs');

export const mth = ({
  year,
  month,
  weeks = true,
  weekStart = 1
}: { year: number, month: number, weeks?: boolean, weekStart?: 1 | 7 }) => {
  let cal = ls.monthlySemiFinished({year, month, weeks, weekStart});

  if (weeks) {
    cal = cal.map(row => [rotateWeek(month, row[0]), ...row.slice(1)]);
  }

  return cal
    .map(row => weeks ? [row[0], ...row.slice(1).map(corner)] : row.map(corner))
    .map(row => weeks ? row : row.map(item => item && item + '\\vspace{\\dimexpr\\myLenMonthlyCellHeight-\\baselineskip}'))
    .map(row => row.join(' &\n')).join(' \\\\ \\hline \n') + '\\\\ \\hline';
};

export const monthlyPage = ({
  year,
  month,
  weeks = true,
  weekStart = 1
}: { year: number, month: number, weeks?: boolean, weekStart?: 1 | 7 }) => {
  const date = new Date(year, month, 1);

  const calendar = mth({year, month: month + 1, weeks, weekStart});
  const weekdays = getWeekdays(weekStart).map(day => `\\hfil ${day}`).join(' & ');
  const leftList = [
    ls.slink(year),
    ls.slink(`Q${Math.floor(month / 3) + 1}`),
    ls.starget(moment(date).format('MMMM'))
  ];

  const rightList = [];
  if (month > 0) {
    const prevMonth = moment(new Date(year, month - 1, 1)).format('MMMM');
    rightList.push(ls.slink(prevMonth))
  }

  if (month < 11) {
    const nextMonth = moment(new Date(year, month + 1, 1)).format('MMMM');
    rightList.push(ls.slink(nextMonth))
  }

  return `${ls.header(leftList, rightList)}\n${funcs.interpolateTpl('monthly', {
    weekCols: weeks ? 'l!{\\vrule width \\myLenLineThicknessThick}' : '',
    weekCol: weeks ? '&' : '',
    weekdays,
    calendar
  })}\n`;
}

const rotateWeek = (month, weekNum) => {
  const link = month === 0 && weekNum > 50
    ? ls.link('fwWeek ' + weekNum, 'Week ' + weekNum)
    : ls.slink('Week ' + weekNum);

  return funcs.interpolateTpl('rotatedWeekNum', {weekNum: link})
}

const getWeekdays = (weekStart: 1 | 7) => {
  const base = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  weekStart === 1 ? base.push('Sunday') : base.unshift('Sunday');

  return base;
}

const corner = (date) => {
  return date ? funcs.interpolateTpl('monthlyCornerDate', {date}) : '';
}
