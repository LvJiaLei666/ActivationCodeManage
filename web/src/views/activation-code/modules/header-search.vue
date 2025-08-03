<script setup lang="ts">
import { Button, Form, Input, Select } from 'ant-design-vue';

import { $t } from '@/locales';

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

interface Props {
  model: Api.ActivationCode.ActivationCodeSearchParams;
  updateSearchParams: (params: Partial<Api.ActivationCode.ActivationCodeSearchParams>) => void;
}

defineOptions({
  name: 'HeaderSearch',
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

const handleReset = () => {
  emit('reset');
};

const handleSearch = () => {
  emit('search');
};
</script>

<template>
  <div class="flex-col gap-16px overflow-hidden lt-sm:overflow-auto">
    <Form :model="model" label-width="80px">
      <div class="flex-col gap-16px lt-sm:flex-col">
        <div class="grid-cols-1 gap-16px sm:grid-cols-2 lg:grid-cols-4 grid">
          <!-- 激活码搜索 -->
          <Form.Item label="激活码" name="code">
            <Input
              :value="model.code"
              placeholder="请输入激活码"
              allow-clear
              @update:value="updateSearchParams({ code: $event })"
            />
          </Form.Item>

          <!-- 类型 -->
          <Form.Item label="类型" name="type">
            <Select
              :value="model.type"
              placeholder="请选择类型"
              allow-clear
              :options="activationCodeTypeOptions"
              @update:value="updateSearchParams({ type: $event as Api.ActivationCode.ActivationCodeType })"
            />
          </Form.Item>
        </div>
        <div class="flex gap-12px">
          <Button type="primary" ghost @click="handleSearch">
            {{ $t('common.search') }}
          </Button>
          <Button @click="handleReset">
            {{ $t('common.reset') }}
          </Button>
        </div>
      </div>
    </Form>
  </div>
</template>
