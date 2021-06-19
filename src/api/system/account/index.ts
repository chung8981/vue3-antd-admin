import http from '@/utils/http/axios';

enum Api {
  adminAccount = '/admin/account',
}

/**
 * 获取账号管理列表
 * @param params
 */
export function getAdminAccount(params) {
  return http.request({
    url: Api.adminAccount,
    method: 'GET',
    params,
  }, {
    isShowErrorMessage: true
  });
}

/**
 * 删除账号
 * @param params
 */
export function delAdminAccount(id: string) {
  return http.request({
    url: [Api.adminAccount, id].join('/'),
    method: 'DELETE',
  }, {
    isShowErrorMessage: true, // 是否显示错误提示信息
    successMessageText: '删除成功'
  });
}

/**
 * 修改账号
 * @param params
 */
export function patchAdminAccount(id, params) {
  return http.request({
    url: [Api.adminAccount, id].join('/'),
    method: 'PATCH',
    params,
  }, {
    isShowErrorMessage: true, // 是否显示错误提示信息
    successMessageText: '修改成功'
  });
}


/**
 * 新建账号
 * @param params
 */
export function postAdminAccount(params) {
  return http.request({
    url: Api.adminAccount,
    method: 'POST',
    params,
  }, {
    isShowErrorMessage: true, // 是否显示错误提示信息
    successMessageText: '新建成功'
  });
}
