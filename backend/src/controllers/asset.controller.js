const assetService = require('../services/asset.service');
const { success } = require('../utils/response');

class AssetController {
  async list(req, res, next) {
    try {
      return success(res, await assetService.list(req.query));
    } catch (err) { next(err); }
  }

  async get(req, res, next) {
    try {
      return success(res, await assetService.get(req.params.id));
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      return success(res, await assetService.create(req.body), 'Asset created', 201);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      return success(res, await assetService.update(req.params.id, req.body), 'Asset updated');
    } catch (err) { next(err); }
  }

  async allocate(req, res, next) {
    try {
      return success(res, await assetService.allocate(req.params.id, req.user.id, req.body), 'Asset allocated');
    } catch (err) { next(err); }
  }

  async returnAsset(req, res, next) {
    try {
      return success(res, await assetService.returnAsset(req.params.id, req.user.id), 'Asset returned');
    } catch (err) { next(err); }
  }

  async getEmployeeAssets(req, res, next) {
    try {
      return success(res, await assetService.getEmployeeAssets(req.params.employeeId));
    } catch (err) { next(err); }
  }
}

module.exports = new AssetController();
