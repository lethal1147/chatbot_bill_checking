const dayjs = require("dayjs");

function generatePublicId(date) {
  const formattedDate = dayjs(date).format("YYMMDD");

  const randomCode = Array.from({ length: 6 }, () =>
    Math.random().toString(36).charAt(2).toUpperCase()
  ).join("");

  return `${formattedDate}-${randomCode}`;
}

module.exports = { generatePublicId };
