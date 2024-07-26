<template>
  <template v-for="{ msgType, msg, id } in list" :key="id">
    <!-- 病情描述 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <div class="patient van-hairline--bottom" v-if="msg.consultRecord">
        <p>
          {{ msg.consultRecord.patientInfo.name }}
          {{ msg.consultRecord.patientInfo.genderValue }}
          {{ msg.consultRecord.patientInfo.age }}岁
        </p>
        <p>
          {{ getIllnessTimeText(msg.consultRecord.illnessTime) }} |
          {{ getConsultFlagText(msg.consultRecord.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <van-col span="18" @click="onPreviewImage(msg.consultRecord?.pictures)">点击查看</van-col>
      </van-row>
    </div>
    <!-- 温馨提示 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 通用通知 -->
    <div class="msg msg-tip" v-if="msgType === 31">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
  import { MsgType, IllnessTime } from '@/enums';
  import { flagOptions, timeOptions } from '@/services/constants';
  import type { Message } from '@/types/room';
  import { showImagePreview, showToast } from 'vant';
  import type { Image } from '@/types/consult';

  defineProps<{ list: Message[] }>();

  // 预览图片
  const onPreviewImage = (images?: Image[]) => {
    if (images && images.length) showImagePreview(images.map(item => item.url));
    else showToast('暂无图片');
  };

  const getIllnessTimeText = (time: IllnessTime) => timeOptions.find(item => item.value === time)?.label;

  const getConsultFlagText = (flag: 0 | 1) => flagOptions.find(item => item.value === flag)?.label;
</script>

<style lang="scss" scoped>
  @import '@/styles/room.scss';
</style>
