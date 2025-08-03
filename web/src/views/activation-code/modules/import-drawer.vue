<script setup lang="ts">
import { Button, DatePicker, Drawer, Form, message, Select, Textarea } from 'ant-design-vue';
import dayjs from 'dayjs';
import { reactive, ref } from 'vue';

import { batchImportActivationCode } from '@/service/api';

interface Emits {
  (e: 'success'): void;
  (e: 'update:visible', visible: boolean): void;
}

interface Props {
  visible: boolean;
}

defineOptions({
  name: 'ImportDrawer',
});

defineProps<Props>();
const emit = defineEmits<Emits>();

// 激活码类型选项
const activationCodeTypeOptions = [
  { label: '1天KEY', value: 1 },
  { label: '15天KEY', value: 15 },
  { label: '30天KEY', value: 30 },
  { label: '182天KEY', value: 182 },
  { label: '365天KEY', value: 365 },
];

// 表单数据
const formData = reactive({
  type: undefined as Api.ActivationCode.ActivationCodeType | undefined,
  dataDate: dayjs().format('YYYY-MM-DD'),
  codes: '',
});

// 提交状态
const loading = ref(false);

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false);
};

// 重置表单
const resetForm = () => {
  formData.type = undefined;
  formData.dataDate = dayjs().format('YYYY-MM-DD');
  formData.codes = '';
};

// 提交导入
const handleSubmit = async () => {
  if (!formData.type) {
    message.error('请选择激活码类型');
    return;
  }

  if (!formData.codes.trim()) {
    message.error('请输入激活码');
    return;
  }

  // 解析激活码列表
  const codeLines = formData.codes
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (codeLines.length === 0) {
    message.error('请输入有效的激活码');
    return;
  }

  const batchData: Api.ActivationCode.BatchImportActivationCode = codeLines.map(code => ({
    code,
    type: formData.type!,
    dataDate: formData.dataDate,
  }));

  loading.value = true;

  try {
    const { error } = await batchImportActivationCode(batchData);
    if (!error) {
      message.success(`成功导入 ${codeLines.length} 个激活码`);
      resetForm();
      emit('success');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Drawer :open="visible" title="导入激活码" width="500" @close="handleClose">
    <div class="flex flex-col gap-16px">
      <Form label-width="100px">
        <!-- 选择类型 -->
        <Form.Item label="激活码类型" required>
          <Select v-model:value="formData.type" placeholder="请选择激活码类型" :options="activationCodeTypeOptions" />
        </Form.Item>

        <!-- 数据日期 -->
        <Form.Item label="数据日期" >
          <DatePicker v-model:value="formData.dataDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="w-full" />
        </Form.Item>

        <!-- 激活码输入 -->
        <Form.Item label="激活码列表" required>
          <Textarea v-model:value="formData.codes"
            placeholder="请输入激活码，每行一个&#10;例如：&#10;ACT-2024-0001-XXXX&#10;ACT-2024-0002-YYYY" :rows="10" />
        </Form.Item>
      </Form>

      <div class="text-gray-500 text-sm">
        <div class="mb-8px">说明：</div>
        <div>• 每行输入一个激活码</div>
        <div>• 空行将被自动忽略</div>
        <div>• 请确保激活码格式正确</div>
      </div>

      <div class="flex gap-12px justify-end">
        <Button @click="handleClose">
          取消
        </Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">
          导入
        </Button>
      </div>
    </div>
  </Drawer>
</template>
