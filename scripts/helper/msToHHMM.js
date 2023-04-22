const msToHHMM = (ms) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms - h * 3600000) / 60000);
  return `${h}h${m.toString().padStart(2, '0')}`;
};

module.exports = msToHHMM;
