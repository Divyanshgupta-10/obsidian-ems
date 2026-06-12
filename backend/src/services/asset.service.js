const assetRepo = require('../repositories/asset.repository');
const notifRepo = require('../repositories/notification.repository');
const { paginate, paginatedResponse } = require('../utils/pagination');

class AssetService {
  async list({ page, limit, status }) {
    const { page: p, limit: l, offset } = paginate(page, limit);
    const { data, total } = await assetRepo.listWithAllocation({ status, limit: l, offset });
    return paginatedResponse(data, total, p, l);
  }

  async get(id) {
    const asset = await assetRepo.findById(id);
    if (!asset) { const e = new Error('Asset not found'); e.name = 'NotFoundError'; throw e; }
    return asset;
  }

  async create(data) {
    return assetRepo.create(data);
  }

  async update(id, data) {
    const asset = await assetRepo.findById(id);
    if (!asset) { const e = new Error('Asset not found'); e.name = 'NotFoundError'; throw e; }
    return assetRepo.update(id, data);
  }

  async allocate(assetId, allocatorId, { employee_id, allocated_date }) {
    const asset = await assetRepo.findById(assetId);
    if (!asset) { const e = new Error('Asset not found'); e.name = 'NotFoundError'; throw e; }
    if (asset.status !== 'available') {
      const e = new Error('Asset is not available'); e.name = 'ValidationError'; throw e;
    }
    const alloc = await assetRepo.allocate(assetId, employee_id, allocatorId, allocated_date);
    await notifRepo.create(employee_id, '🖥️ Asset Assigned', `${asset.asset_name} (${asset.asset_code}) has been assigned to you.`);
    return alloc;
  }

  async returnAsset(assetId, returnedBy) {
    await assetRepo.returnAsset(assetId, returnedBy);
    return assetRepo.findById(assetId);
  }

  async getEmployeeAssets(employeeId) {
    return assetRepo.getEmployeeAssets(employeeId);
  }
}

module.exports = new AssetService();
