// Function to extract code from an message
const findCode = async (message) => {
  const regex = /data\s+(\w+)/i;
  const match = regex.exec(message);
  return match?.[1]?.trim();
};

module.exports = findCode;
