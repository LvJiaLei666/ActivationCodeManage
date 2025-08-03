<script setup lang="ts">
import { Button, Form, Modal, Textarea } from 'ant-design-vue';
import { reactive, ref, watch } from 'vue';

interface Emits {
  (e: 'confirm', refundNote: string): void;
  (e: 'update:visible', visible: boolean): void;
}

interface Props {
  visible: boolean;
  record: Api.ActivationCode.ActivationCode | null;
}

defineOptions({
  name: 'RefundModal',
});

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  refundNote: '',
});

// 提交状态
const loading = ref(false);

// 监听弹窗显示状态，重置表单
watch(() => props.visible, (visible) => {
  if (visible) {
    formData.refundNote = '';
  }
});

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
};

// 确认退款/取消退款
const handleConfirm = () => {
  // 如果是取消退款，不需要输入原因
  if (props.record?.refunded) {
    emit('confirm', '');
    return;
  }

  // 如果是退款，需要输入原因
  if (!formData.refundNote.trim()) {
    window.$message?.error('请输入退款原因');
    return;
  }

  emit('confirm', formData.refundNote);
};
</script>

<template>
  <Modal
    :open="visible"
    :title="record?.refunded ? '取消退款' : '激活码退款'"
    width="500"
    @cancel="handleClose"
    @ok="handleConfirm"
  >
    <template #footer>
      <div class="flex gap-12px justify-end">
        <Button @click="handleClose">
          取消
        </Button>
        <Button
          type="primary"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ record?.refunded ? '确认取消退款' : '确认退款' }}
        </Button>
      </div>
    </template>

    <div class="flex flex-col gap-16px">
      <div v-if="record" class="p-16px bg-gray-50 rounded">
        <div class="text-sm text-gray-600 mb-8px">激活码信息：</div>
        <div class="text-base font-mono">{{ record.code }}</div>
        <div class="text-sm text-gray-500 mt-4px">类型：{{ record.type }}天</div>
        <div v-if="record.refunded" class="text-sm text-red-500 mt-4px">
          当前状态：已退款 ({{ record.refundNote }})
        </div>
      </div>

      <Form v-if="!record?.refunded" label-width="80px">
        <Form.Item label="退款原因" required>
          <Textarea
            v-model:value="formData.refundNote"
            placeholder="请输入退款原因"
            :rows="4"
          />
        </Form.Item>
      </Form>

      <div v-else class="text-center text-gray-600">
        确认要取消此激活码的退款状态吗？
      </div>
    </div>
  </Modal>
</template>
