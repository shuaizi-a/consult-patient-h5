import type {
  KnowledgePage,
  KnowledgeParams,
  DoctorPage,
  PageParams,
  FollowType,
  TopDep,
  Image,
  ConsultOrderPreData,
  ConsultOrderPreParams,
  PartialConsult,
  ConsultOrderItem
} from '@/types/consult';
import { request } from '@/utils/request';

// 推荐列表
export const getKnowledgePage = (params: KnowledgeParams) => {
  return request<KnowledgePage>('/patient/home/knowledge', 'GET', params);
};

// 获取推荐关注医生
export const getDoctorPage = (params: PageParams) => {
  return request<DoctorPage>('/home/page/doc', 'GET', params);
};

// 定义关注与取消关注API;
export const followOrUnfollow = (id: string, type: FollowType = 'doc') => {
  return request('/like', 'POST', { id, type });
};

// 获取一二级科室
export const getAllDep = () => request<TopDep[]>('/dep/all');

// 上传图片
export const uploadImage = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return request<Image>('/upload', 'POST', fd);
};

// 拉取预支付订单信息
export const getConsultOrderPre = (params: ConsultOrderPreParams) => {
  return request<ConsultOrderPreData>('/patient/consult/order/pre', 'GET', params);
};

// 生成订单
export const createConsultOrder = (data: PartialConsult) => {
  return request<{ id: string }>('/patient/consult/order', 'POST', data);
};

// 获取支付地址  0 是微信  1 支付宝
export const getConsultOrderPayUrl = (params: { paymentMethod: 0 | 1; orderId: string; payCallback: string }) => {
  return request<{ payUrl: string }>('/patient/consult/pay', 'POST', params);
};

export const getConsultOrderDetail = (orderId: string) => {
  return request<ConsultOrderItem>('/patient/consult/order/detail', 'GET', { orderId });
};
