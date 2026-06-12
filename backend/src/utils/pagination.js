const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
};

const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total: parseInt(total),
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
  },
});

module.exports = { paginate, paginatedResponse };
