<template>
  <div class="patient-page">
    <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'" />
    <!-- 头部提示 -->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <!-- 患者列表 -->
    <div class="patient-list">
      <div
        class="patient-item"
        v-for="item in list"
        :key="item.id"
        @click="selectedPatient(item)"
        :class="{ selected: patientId === item.id }"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{ item.idCard.replace(/^(.{6}).+(.{4})$/, '\$1********\$2') }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div class="icon" @click="showPopup(item)"><cp-icon name="user-edit" /></div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" @click="showPopup()">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip" v-if="list.length > 6">最多可添加 6 人</div>
    </div>
    <!-- 底部按钮 -->
    <div class="patient-next" v-if="isChange">
      <van-button type="primary" round block @click="next">下一步</van-button>
    </div>

    <!-- 侧边栏 -->
    <van-popup :show="show" @update:show="show = $event" position="right">
      <cp-nav-bar
        :back="() => (show = false)"
        :title="patient.id ? '编辑患者' : '添加患者'"
        right-text="保存"
        @click-right="onSubmit"
      ></cp-nav-bar>
      <van-form autocomplete="off" ref="form">
        <van-field v-model="patient.name" label="真实姓名" placeholder="请输入真实姓名" :rules="nameRules" />
        <van-field v-model="patient.idCard" label="身份证号" placeholder="请输入身份证号" :rules="idCardRules" />

        <van-field label="性别" class="pb4">
          <!-- 单选按钮组件 -->
          <template #input>
            <cp-radio-btn v-model="patient.gender" :options="options"></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="defaultFlag" :icon-size="18" round />
          </template>
        </van-field>

        <van-action-bar v-if="patient.id">
          <van-action-bar-button @click="remove">删除</van-action-bar-button>
        </van-action-bar>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
  import { addPatient, getPatientList, editPatient, delPatient } from '@/services/user';
  import type { PatientList, Patient } from '@/types/user';
  import { onMounted, ref, computed } from 'vue';
  import { nameRules, idCardRules } from '@/utils/rules';
  import { showConfirmDialog, showSuccessToast, type FormInstance, showToast } from 'vant';
  import { useRoute } from 'vue-router';
  import { useConsultStore } from '@/stores';
  import router from '@/router';

  const route = useRoute();
  const store = useConsultStore(); // 获取到store

  // 页面渲染后加载数据
  onMounted(() => {
    loadList();
  });

  // 是否是选择患者
  const isChange = computed(() => route.query.isChange === '1');

  // 点击选中效果
  const patientId = ref<string>();
  const selectedPatient = (item: Patient) => {
    if (isChange.value) {
      patientId.value = item.id;
    }
  };

  // 1. 页面初始化加载数据
  const list = ref<PatientList>([]);

  const loadList = async () => {
    const res = await getPatientList();
    list.value = res.data;

    // 设置默认选中的ID，当你是选择患者的时候，且有患者信息的时候
    if (isChange.value && list.value.length) {
      const defPatient = list.value.find(item => item.defaultFlag === 1);
      if (defPatient) patientId.value = defPatient.id;
      else patientId.value = list.value[0].id;
    }
  };

  // 2. 打开侧滑栏
  const show = ref(false);
  const showPopup = (item?: Patient) => {
    if (item) {
      // 如果点的是编辑，解构出后台需要的数据
      const { id, gender, name, idCard, defaultFlag } = item;
      patient.value = { id, gender, name, idCard, defaultFlag };
    } else {
      patient.value = { ...initPatient };
    }

    show.value = true;
  };

  // 单选参数
  const options = [
    { label: '男', value: 1 },
    { label: '女', value: 0 }
  ];
  // 表单ref
  const form = ref<FormInstance>();
  // 初始值
  const initPatient: Patient = {
    name: '',
    idCard: '',
    gender: 1,
    defaultFlag: 0
  };
  // 表单数据结构
  const patient = ref<Patient>({ ...initPatient });

  // 默认值需要转换
  const defaultFlag = computed({
    get() {
      return patient.value.defaultFlag === 1 ? true : false;
    },
    set(value) {
      patient.value.defaultFlag = value ? 1 : 0;
    }
  });

  // 提交表单
  const onSubmit = async () => {
    await form.value?.validate();
    // 身份证倒数第二位，单数是男，双数是女
    const gender = +patient.value.idCard.slice(-2, -1) % 2;
    if (gender !== patient.value.gender) {
      await showConfirmDialog({
        title: '温馨提示',
        message: '填写的性别和身份证号中的不一致\n您确认提交吗？'
      });
    }

    // 添加 & 修改
    patient.value.id ? await editPatient(patient.value) : await addPatient(patient.value);
    show.value = false;
    loadList();
    showSuccessToast(patient.value.id ? '编辑成功' : '添加成功');
  };

  // 删除患者信息
  const remove = async () => {
    if (patient.value.id) {
      await showConfirmDialog({
        title: '温馨提示',
        message: `您确认要删除患者 ${patient.value.name} 的信息吗 ？`
      });
      await delPatient(patient.value.id);
      show.value = false;
      loadList();
      showSuccessToast('删除成功');
    }
  };

  const next = async () => {
    if (!patientId.value) return showToast('请选就诊择患者');
    store.setPatient(patientId.value);
    router.push('/consult/pay');
  };
</script>

<style lang="scss" scoped>
  .patient-page {
    padding: 46px 0 80px;

    :deep() {
      .van-popup {
        width: 100%;
        height: 100%;
        padding-top: 46px;
        box-sizing: border-box;
      }

      // 底部操作栏
      .van-action-bar {
        padding: 0 10px;
        margin-bottom: 10px;
        .van-button {
          color: var(--cp-price);
          background-color: var(--cp-bg);
        }
      }
    }
  }
  .patient-list {
    padding: 15px;
  }
  .patient-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: var(--cp-bg);
    border-radius: 8px;
    margin-bottom: 15px;
    position: relative;
    border: 1px solid var(--cp-bg);
    transition: all 0.3s;
    overflow: hidden;
    .info {
      display: flex;
      flex-wrap: wrap;
      flex: 1;
      span {
        color: var(--cp-tip);
        margin-right: 20px;
        line-height: 30px;
        &.name {
          font-size: 16px;
          color: var(--cp-text1);
          width: 80px;
          margin-right: 0;
        }
        &.id {
          color: var(--cp-text2);
          width: 180px;
        }
      }
    }
    .icon {
      color: var(--cp-tag);
      width: 20px;
      text-align: center;
    }
    .tag {
      position: absolute;
      right: 60px;
      top: 21px;
      width: 30px;
      height: 16px;
      font-size: 10px;
      color: #fff;
      background-color: var(--cp-primary);
      border-radius: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    &.selected {
      border-color: var(--cp-primary);
      background-color: var(--cp-plain);
      .icon {
        color: var(--cp-primary);
      }
    }
  }
  .patient-add {
    background-color: var(--cp-bg);
    color: var(--cp-primary);
    text-align: center;
    padding: 15px 0;
    border-radius: 8px;
    .cp-icon {
      font-size: 24px;
    }
  }
  .patient-tip {
    color: var(--cp-tag);
    padding: 12px 0;
  }
  .pb4 {
    padding-bottom: 4px;
  }

  .patient-change {
    padding: 15px;
    > h3 {
      font-weight: normal;
      margin-bottom: 5px;
    }
    > p {
      color: var(--cp-text3);
    }
  }
  .patient-next {
    padding: 15px;
    background-color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
  }
</style>
