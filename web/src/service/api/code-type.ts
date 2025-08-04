import { request } from '../request';

/** @description: 获取激活码类型列表 */
export const getCodeTypeList = (params: Api.CodeType.CodeTypeSearchParams) => {
  return request<Api.Common.PaginatingQueryRecord<Api.CodeType.CodeType>>({
    url: '/code-type',
    method: 'get',
    params,
  });
};

/** @description: 获取激活码类型详情 */
export const getCodeTypeDetail = (id: string) => {
  return request<Api.CodeType.CodeType>({
    url: `/code-type/${id}`,
    method: 'get',
  });
};

/** @description: 创建激活码类型 */
export const addCodeType = (data: Api.CodeType.SaveCodeType) => {
  return request<Api.CodeType.CodeType>({
    url: '/code-type',
    method: 'post',
    data,
  });
};

/** @description: 更新激活码类型 */
export const updateCodeType = (id: string, data: Api.CodeType.SaveCodeType) => {
  return request<Api.CodeType.CodeType>({
    url: `/code-type/${id}`,
    method: 'put',
    data,
  });
};

/** @description: 删除激活码类型 */
export const delCodeType = (data: { id: string }) => {
  return request<Api.CodeType.CodeType>({
    url: `/code-type/${data.id}`,
    method: 'delete',
  });
};

/** @description: 获取所有激活码类型（不分页） */
export const getAllCodeTypes = () => {
  return request<Api.Common.PaginatingQueryRecord<Api.CodeType.CodeType>>({
    url: '/code-type',
    method: 'get',
    params: { size: 1000 }, // 获取足够多的数据
  });
};
