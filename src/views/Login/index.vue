<template>
  <Login></Login>
</template>

<script setup lang="tsx">
  import { ref, onUnmounted } from 'vue';
  import qqImgUrl from '@/assets/qq.svg';
  import { mobileRules, passwordRules, codeRules } from '@/utils/rules';
  import { showSuccessToast, showToast, type FormInstance } from 'vant';
  import { loginByPassword, sendMobileCode, loginByMobile } from '@/services/user.ts';
  import { useUserStore } from '@/stores';
  import { useRoute, useRouter } from 'vue-router';

  const store = useUserStore();
  const router = useRouter();
  const route = useRoute();

  const isShow = ref(false); // 密码的可见与不可见
  const mobile = ref('13211112222'); // 手机号
  const password = ref('abc12345'); // 密码
  const code = ref(''); // 验证码
  const agree = ref(false); // 是否同意协议
  const isPass = ref(true); // 切换登录类型 true 密码登录 false 短信验证码登录
  const form = ref<FormInstance>(); // form的实例

  // 倒计时相关
  const time = ref(0);
  let timeId: number;

  const send = async () => {
    // 已经倒计时time的值大于0，此时不能发送验证码
    if (time.value > 0) return;
    // 验证不通过报错，阻止程序继续执行
    await form.value?.validate('mobile');
    // 发送验证码
    await sendMobileCode(mobile.value, 'login');
    showToast('发送成功');

    // 倒计时
    time.value = 60;
    // 开启倒计时
    if (timeId) clearInterval(timeId);
    timeId = window.setInterval(() => {
      time.value--;
      if (time.value <= 0) window.clearInterval(timeId);
    }, 1000);
  };

  const login = async () => {
    if (!agree.value) return showToast('请勾选我已同意');
    // 验证完毕，进行登录
    const res = isPass.value
      ? await loginByPassword(mobile.value, password.value)
      : await loginByMobile(mobile.value, code.value);
    // 登录成功后，将用户信息存入store
    store.setUser(res.data);
    // 如果有回跳地址就进行回跳，没有跳转到个人中心
    router.push((route.query.returnUrl as string) || '/user');
    showSuccessToast('登录成功');
  };

  // 组件卸载时掉生命钩子
  onUnmounted(() => {
    window.clearInterval(timeId);
  });

  const Login = () => {
    return (
      <div class="login-page">
        <cp-nav-bar title="注册"></cp-nav-bar>
        {/*  头部 */}
        <div class="login-head">
          <h3>{isPass.value ? '密码登录' : '短信验证码登录'}</h3>
          <a
            href="javascript:;"
            onClick={() => {
              isPass.value = !isPass.value;
            }}
          >
            <span>{!isPass.value ? '密码登录' : '短信验证码登录'}</span>
            <van-icon name="arrow"></van-icon>
          </a>
        </div>
        {/* 表单 */}
        <van-form autocomplete="off" onSubmit={login} ref={form.value}>
          <van-field
            v-model={mobile.value}
            rules={mobileRules}
            placeholder="请输入手机号"
            type="tel"
            name="mobile"
          ></van-field>
          {isPass.value ? (
            <van-field
              v-model={password.value}
              rules={passwordRules}
              placeholder="请输入密码"
              type={isShow.value ? 'text' : 'password'}
            >
              {{
                button: () => {
                  return (
                    <cp-icon
                      onClick={() => {
                        isShow.value = !isShow.value;
                      }}
                      name={`login-eye-${isShow.value ? 'on' : 'off'}`}
                    ></cp-icon>
                  );
                }
              }}
            </van-field>
          ) : (
            <van-field v-model={code.value} rules={codeRules} placeholder="短信验证码">
              {{
                button: () => {
                  return (
                    <span class={['btn-send', time.value > 0 ? 'active' : '']} onClick={send}>
                      {time.value > 0 ? `${time.value}s后再次发送` : '发送验证码'}
                    </span>
                  );
                }
              }}
            </van-field>
          )}
          <div class="cp-cell">
            <van-checkbox v-model={agree.value}>
              <span>我已同意</span>
              <a href="javascript:;">用户协议</a>
              <span>及</span>
              <a href="javascript:;">隐私条款</a>
            </van-checkbox>
          </div>
          <div class="cp-cell">
            <van-button block round type="primary" native-type="submit">
              登 录
            </van-button>
          </div>
          <div class="cp-cell">
            <a href="javascript:;">忘记密码？</a>
          </div>
        </van-form>
        {/* 底部 */}
        <div class="login-other">
          <van-divider>第三方登录</van-divider>
          <div class="icon">
            <img src={qqImgUrl} alt="" />
          </div>
        </div>
      </div>
    );
  };
</script>

<style lang="scss">
  .login {
    &-page {
      padding-top: 46px;
    }
    &-head {
      display: flex;
      padding: 30px 30px 50px;
      justify-content: space-between;
      align-items: flex-end;
      line-height: 1;
      h3 {
        font-weight: normal;
        font-size: 24px;
      }
      a {
        font-size: 15px;
      }
    }
    &-other {
      margin-top: 60px;
      padding: 0 30px;
      .icon {
        display: flex;
        justify-content: center;
        img {
          width: 36px;
          height: 36px;
          padding: 4px;
        }
      }
    }
  }
  .van-form {
    padding: 0 14px;
    .cp-cell {
      height: 52px;
      line-height: 24px;
      padding: 14px 16px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      .van-checkbox {
        a {
          color: var(--cp-primary);
          padding: 0 5px;
        }
      }
    }
    .btn-send {
      color: var(--cp-primary);
      &.active {
        color: rgba(22, 194, 163, 0.5);
      }
    }
  }
</style>
