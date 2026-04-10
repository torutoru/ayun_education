async function parseJsonBody(event) {
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch (error) {
    throw new Error('Invalid JSON body.');
  }
}

module.exports = {
  parseJsonBody
};
