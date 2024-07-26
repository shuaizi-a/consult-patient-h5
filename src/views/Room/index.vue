<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <room-status :status="consult?.status" :countdown="consult?.countdown" />
    <room-message :list="list"></room-message>
    <room-action :disabled="consult?.status !== OrderType.ConsultChat"></room-action>
  </div>
</template>

<script setup lang="ts">
  import RoomStatus from './components/RoomStatus.vue';
  import RoomAction from './components/RoomAction.vue';
  import RoomMessage from './components/RoomMessage.vue';
  import type { Socket } from 'socket.io-client';
  import { io } from 'socket.io-client';
  import { onMounted, onUnmounted, ref } from 'vue';
  import { baseURL } from '@/utils/request';
  import { useUserStore } from '@/stores';
  import { useRoute } from 'vue-router';
  import { MsgType, OrderType } from '@/enums';
  import type { Message, TimeMessages } from '@/types/room';
  import type { ConsultOrderItem } from '@/types/consult';
  import { getConsultOrderDetail } from '@/services/consult';

  const consult = ref<ConsultOrderItem>();
  const store = useUserStore();
  const route = useRoute();
  const list = ref<Message[]>([]);
  let socket: Socket;

  onMounted(async () => {
    const res = await getConsultOrderDetail(route.query.orderId as string);
    consult.value = res.data;

    // 建立链接，创建 socket.io 实例
    socket = io(baseURL, {
      auth: {
        token: `Bearer ${store.user?.token}`
      },
      query: {
        orderId: route.query.orderId
      }
    });

    socket.on('connect', () => {
      // 建立连接成功
      console.log('connect');
    });

    socket.on('error', event => {
      // 错误异常消息
      console.log('error', event);
    });

    socket.on('disconnect', () => {
      // 已经断开连接
      console.log('disconnect');
    });

    // 聊天记录
    socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
      // 准备转换常规消息列表
      const arr: Message[] = [];
      data.forEach(item => {
        arr.push({
          msgType: MsgType.Notify,
          msg: { content: item.createTime },
          createTime: item.createTime,
          id: item.createTime
        });
        arr.push(...item.items);
      });
      // 追加到聊天消息列表
      list.value.unshift(...arr);
    });

    // 订单状态 在onMounted注册
    socket.on('statusChange', async () => {
      const res = await getConsultOrderDetail(route.query.orderId as string);
      consult.value = res.data;
    });
  });

  onUnmounted(() => {
    socket.close();
  });
</script>

<style lang="scss" scoped>
  .room-page {
    padding-top: 90px;
    padding-bottom: 60px;
    min-height: 100vh;
    box-sizing: border-box;
    background-color: var(--cp-bg);
    .van-pull-refresh {
      width: 100%;
      min-height: calc(100vh - 150px);
    }
  }
</style>
