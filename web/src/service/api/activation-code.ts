import { request } from '../request';

/**
 * @description: 获取激活码列表
 */
export const getActivationCodeList = (params: Api.ActivationCode.ActivationCodeSearchParams) => {
  return request<Api.Common.PaginatingQueryRecord<Api.ActivationCode.ActivationCode>>({
    url: '/activation-code',
    method: 'get',
    params,
  });
};

/**
 * @description: 获取激活码详情
 */
export const getActivationCodeDetail = (id: string) => {
  return request<Api.ActivationCode.ActivationCode>({
    url: `/activation-code/${id}`,
    method: 'get',
  });
};

/**
 * @description: 创建激活码
 */
export const addActivationCode = (data: Api.ActivationCode.SaveActivationCode) => {
  return request<Api.ActivationCode.ActivationCode>({
    url: '/activation-code',
    method: 'post',
    data,
  });
};

/**
 * @description: 更新激活码
 */
export const updateActivationCode = (id: string, data: Api.ActivationCode.SaveActivationCode) => {
  return request<Api.ActivationCode.ActivationCode>({
    url: `/activation-code/${id}`,
    method: 'put',
    data,
  });
};

/**
 * @description: 删除激活码
 */
export const delActivationCode = (data: { id: string }) => {
  return request<Api.ActivationCode.ActivationCode>({
    url: `/activation-code/${data.id}`,
    method: 'delete',
  });
};

/**
 * @description: 激活码激活
 */
export const activateActivationCode = (id: string) => {
  return request<Api.ActivationCode.ActivationCode>({
    url: `/activation-code/${id}/activate`,
    method: 'patch',
  });
};

/**
 * @description: 激活码退款
 */
export const refundActivationCode = (id: string, data: Api.ActivationCode.RefundActivationCode) => {
  return request<Api.ActivationCode.ActivationCode>({
    url: `/activation-code/${id}/refund`,
    method: 'patch',
    data,
  });
};

/**
 * @description: 激活码收回
 */
export const revokeActivationCode = (id: string) => {
  return request<Api.ActivationCode.ActivationCode>({
    url: `/activation-code/${id}/revoke`,
    method: 'patch',
  });
};

/**
 * @description: 批量导入激活码
 */
export const batchImportActivationCode = (data: Api.ActivationCode.BatchImportActivationCode) => {
  return request<boolean>({
    url: '/activation-code/batch-import',
    method: 'post',
    data,
  });
};

/**
 * @description: 导出激活码数据
 */
export const exportActivationCode = (params: Api.ActivationCode.ExportActivationCodeParams) => {
  return request<{ data: string; count: number; filename: string }>({
    url: '/activation-code/export',
    method: 'get',
    params,
  });
};
