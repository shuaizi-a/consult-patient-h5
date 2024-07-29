import CpNavBar from '@/components/CpNavBar.vue';
import CpIcon from '@/components/CpIcon.vue';
import CpRadioBtn from '@/components/CpRadioBtn.vue';
import CpPaySheet from '@/components/CpPaySheet.vue';
import { RouterLink, RouterView } from 'vue-router';

declare module 'vue' {
  interface GlobalComponents {
    CpNavBar: typeof CpNavBar;
    CpIcon: typeof CpIcon;
    CpRadioBtn: typeof CpRadioBtn;
    CpPaySheet: typeof CpPaySheet;
  }
}
