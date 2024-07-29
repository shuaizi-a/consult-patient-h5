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
  ConsultOrderItem,
  ConsultOrderListParams,
  ConsultOrderPage
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

// 获取订单详情
export const getConsultOrderDetail = (orderId: string) => {
  return request<ConsultOrderItem>('/patient/consult/order/detail', 'GET', { orderId });
};

// 查看处方图片
export const getPrescriptionPic = (id: string) => {
  return request<{ url: string }>(`/patient/consult/prescription/${id}`);
};

// 评价问诊
export const evaluateConsultOrder = (data: {
  docId: string;
  orderId: string;
  score: number;
  content: string;
  anonymousFlag: 0 | 1;
}) => {
  return request<{ id: string }>('/patient/order/evaluate', 'POST', data);
};

// 获取咨询订单列表
export const getConsultOrderList = (params: ConsultOrderListParams) => {
  return request<ConsultOrderPage>('/patient/consult/order/list', 'GET', params);
};

// 取消订单
export const cancelOrder = (id: string) => {
  return request(`/patient/order/cancel/${id}`, 'PUT');
};

// 删除订单
export const deleteOrder = (id: string) => {
  return request(`/patient/order/${id}`, 'DELETE');
};
