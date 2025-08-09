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
  activationCodeTypeOptions: { label: string; value: string; id: string }[];
}

defineOptions({
  name: 'HeaderSearch',
});

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

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
        <div class="grid grid-cols-1 gap-16px lg:grid-cols-4 sm:grid-cols-2">
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
          <Form.Item label="类型" name="typeId">
            <Select
              :value="model.typeId"
              placeholder="请选择类型"
              allow-clear
              :options="props.activationCodeTypeOptions"
              @update:value="updateSearchParams({ typeId: $event as string })"
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
