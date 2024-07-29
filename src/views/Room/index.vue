<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <!-- 订单状态 -->
    <room-status :status="consult?.status" :countdown="consult?.countdown" />
    <!-- 消息列表 -->
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list" />
    </van-pull-refresh>
    <!-- 输入框 -->
    <room-action
      :disabled="consult?.status !== OrderType.ConsultChat"
      @send-text="sendText"
      @send-image="sendImage"
    ></room-action>
  </div>
</template>

<script setup lang="ts">
  import RoomStatus from './components/RoomStatus.vue';
  import RoomAction from './components/RoomAction.vue';
  import RoomMessage from './components/RoomMessage.vue';
  import type { Socket } from 'socket.io-client';
  import { io } from 'socket.io-client';
  import { onMounted, onUnmounted, ref, nextTick } from 'vue';
  import { baseURL } from '@/utils/request';
  import { useUserStore } from '@/stores';
  import { useRoute } from 'vue-router';
  import { MsgType, OrderType } from '@/enums';
  import type { Message, TimeMessages } from '@/types/room';
  import type { ConsultOrderItem, Image } from '@/types/consult';
  import { getConsultOrderDetail } from '@/services/consult';
  import dayjs from 'dayjs';
  import { showToast } from 'vant';
  import { provide } from 'vue';

  const store = useUserStore();
  const route = useRoute();
  let socket: Socket;

  // 问诊订单详情
  const consult = ref<ConsultOrderItem>();
  // 消息列表
  const list = ref<Message[]>([]);
  // 记录请求消息列表发送文本消息时间
  const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  // 下拉加载
  const loading = ref(false);
  // 是否第一次加载
  const initialMsg = ref(true);
  // 注入问诊订单详情
  provide('consult', consult);
  // 评价成功后修改数据
  const completeEva = (score: number) => {
    const item = list.value.find(item => item.msgType === MsgType.CardEvaForm);
    if (item) {
      item.msg.evaluateDoc = { score };
      item.msgType = MsgType.CardEva;
    }
  };
  provide('completeEva', completeEva);

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

    // 建立连接成功
    socket.on('connect', () => {
      list.value = [];
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
      data.forEach((item, i) => {
        if (i === 0) time.value = item.createTime; // 记录每段消息的开始时间，作为下一次请求的开始时间
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

      loading.value = false;
      if (!data.length) {
        return showToast('没有聊天记录了');
      }
      nextTick(() => {
        if (initialMsg.value) {
          // 更新消息状态
          socket.emit('updateMsgStatus', arr[arr.length - 1].id);
          // 滚动到底部
          window.scrollTo(0, document.body.scrollHeight);
          initialMsg.value = false;
        }
      });
    });

    // 订单状态 在onMounted注册
    socket.on('statusChange', async () => {
      const res = await getConsultOrderDetail(route.query.orderId as string);
      consult.value = res.data;
    });

    // 接收消息 在onMounted注册
    socket.on('receiveChatMsg', async event => {
      list.value.push(event);
      await nextTick();
      // 更新消息状态
      socket.emit('updateMsgStatus', event.id);
      // 滚动到底部
      window.scrollTo(0, document.body.scrollHeight);
    });
  });

  let onRefresh = () => {
    // 触发下拉
    socket.emit('getChatMsgList', 20, time.value, route.query.orderId);
  };

  // 发送文本消息
  const sendText = (text: string) => {
    // 发送信息需要  发送人  收消息人  消息类型  消息内容
    socket.emit('sendChatMsg', {
      from: store.user?.id,
      to: consult.value?.docInfo?.id,
      msgType: MsgType.MsgText,
      msg: { content: text }
    });
  };

  // 发送图片消息
  const sendImage = (img: Image) => {
    socket.emit('sendChatMsg', {
      from: store.user?.id,
      to: consult.value?.docInfo?.id,
      msgType: MsgType.MsgImage,
      msg: { picture: img }
    });
  };

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
