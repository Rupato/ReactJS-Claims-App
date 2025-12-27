function addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
}

function generateId(prefix = '') {
    const randomizedNumber = Math.floor(Math.random() * 90000) + 10000;
    return prefix + randomizedNumber.toString();
}

function formatDate(date = null) {
    const d = date ? new Date(date) : new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = { addMonths, generateId, formatDate };
