<script setup lang="ts">
import { Button, DatePicker, Form, Modal, Radio, Space } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { reactive, ref, watch } from 'vue';

import { exportActivationCode } from '@/service/api';

interface Emits {
  (e: 'update:visible', visible: boolean): void;
}

interface Props {
  visible: boolean;
}

defineOptions({
  name: 'ExportModal',
});

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 表单数据
const formData = reactive({
  exportType: 'all', // 'all' 全部数据, 'timeRange' 时间段
  timeRange: undefined as [Dayjs, Dayjs] | undefined,
  quickSelect: '', // 快捷选择：'yesterday'
});

// 导出状态
const loading = ref(false);

// 监听弹窗显示状态，重置表单
watch(() => props.visible, (visible) => {
  if (visible) {
    formData.exportType = 'all';
    formData.timeRange = undefined;
    formData.quickSelect = '';
  }
});

// 昨天快捷选择
const selectYesterday = () => {
  const yesterday = dayjs().subtract(1, 'day');
  formData.timeRange = [yesterday.startOf('day'), yesterday.endOf('day')];
  formData.exportType = 'timeRange';
  formData.quickSelect = 'yesterday';
};

// 时间范围变化处理
const handleTimeRangeChange = (value: any) => {
  if (value && Array.isArray(value) && value.length === 2) {
    formData.timeRange = [dayjs(value[0]), dayjs(value[1])];
    formData.exportType = 'timeRange';
  } else {
    formData.timeRange = undefined;
  }
  formData.quickSelect = '';
};

// 导出类型变化处理
const handleExportTypeChange = (e: any) => {
  const value = e.target?.value || e;
  if (value === 'all') {
    formData.timeRange = undefined;
    formData.quickSelect = '';
  }
};

// 时间范围限制（最多30天）
const disabledDate = (current: Dayjs) => {
  if (!formData.timeRange || !formData.timeRange[0]) {
    return current && current > dayjs().endOf('day');
  }

  const start = formData.timeRange[0];
  const maxEnd = start.add(29, 'day');
  const minStart = start.subtract(29, 'day');

  return current && (current < minStart || current > maxEnd || current > dayjs().endOf('day'));
};

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
};

// 确认导出
const handleExport = async () => {
  loading.value = true;

  try {
    let params: Api.ActivationCode.ExportActivationCodeParams = {};

    // 如果选择了时间范围，设置参数
    if (formData.exportType === 'timeRange' && formData.timeRange) {
      params = {
        startDate: formData.timeRange[0].format('YYYY-MM-DD'),
        endDate: formData.timeRange[1].format('YYYY-MM-DD'),
      };
    }

        const { data: exportResult, error } = await exportActivationCode(params);

    if (!error && exportResult) {
      // 将base64数据转换为ArrayBuffer
      const binaryString = window.atob(exportResult.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 创建Excel下载链接
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 使用后端返回的文件名，或生成自定义文件名
      let fileName = exportResult.filename;
      if (formData.exportType === 'timeRange' && formData.timeRange) {
        const start = formData.timeRange[0].format('YYYY-MM-DD');
        const end = formData.timeRange[1].format('YYYY-MM-DD');
        fileName = `激活码数据_${start}_到_${end}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
      } else {
        fileName = `激活码数据_全部数据_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      window.$message?.success(`导出成功，共 ${exportResult.count} 条数据`);
      handleClose();
    }
  } catch (error) {
    window.$message?.error('导出失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取时间范围显示文本
const getTimeRangeText = () => {
  if (!formData.timeRange) return '';
  const [start, end] = formData.timeRange;
  const days = end.diff(start, 'day') + 1;
  return `${start.format('YYYY-MM-DD')} 至 ${end.format('YYYY-MM-DD')} (${days}天)`;
};
</script>

<template>
  <Modal
    :open="visible"
    title="导出数据"
    width="600"
    @cancel="handleClose"
  >
    <template #footer>
      <div class="flex gap-12px justify-end">
        <Button @click="handleClose">
          取消
        </Button>
        <Button
          type="primary"
          :loading="loading"
          @click="handleExport"
        >
          导出
        </Button>
      </div>
    </template>

    <div class="flex flex-col gap-24px py-16px">
      <!-- 导出范围选择 -->
      <Form label-width="100px">
        <Form.Item label="导出范围">
          <Radio.Group
            v-model:value="formData.exportType"
            @change="handleExportTypeChange"
          >
            <Space direction="vertical" size="large">
              <Radio value="all">
                <div class="flex flex-col">
                  <span class="font-semibold">全部数据</span>
                  <span class="text-gray-500 text-sm">（数据不用分类 导出后我们自己EXCEL筛选即可）</span>
                </div>
              </Radio>
              <Radio value="timeRange">
                <span class="font-semibold">选择时间段</span>
                <span class="text-gray-500 text-sm ml-8px">最多30天</span>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <!-- 时间段选择 -->
        <Form.Item v-if="formData.exportType === 'timeRange'" label="时间范围">
          <div class="flex flex-col gap-12px">
            <DatePicker.RangePicker
              :value="formData.timeRange"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD"
              :placeholder="['开始日期', '结束日期']"
              class="w-full"
              @change="handleTimeRangeChange"
            />

            <!-- 快捷选择 -->
            <div class="flex gap-8px">
              <Button
                size="small"
                :type="formData.quickSelect === 'yesterday' ? 'primary' : 'default'"
                @click="selectYesterday"
              >
                昨天
              </Button>
            </div>

            <!-- 时间范围提示 -->
            <div v-if="formData.timeRange" class="text-sm text-blue-600">
              {{ getTimeRangeText() }}
            </div>
          </div>
        </Form.Item>
      </Form>

      <!-- 说明信息 -->
      <div class="bg-blue-50 p-16px rounded border-l-4 border-blue-400">
        <div class="text-sm text-gray-700">
          <div class="font-semibold mb-8px">📋 导出说明：</div>
          <div>• <strong>全部数据</strong>：导出所有激活码记录，包含完整的状态信息</div>
          <div>• <strong>时间段数据</strong>：按数据日期范围导出，最多支持30天跨度</div>
          <div>• 导出格式为Excel文件，包含激活码、类型、状态、时间等完整信息</div>
          <div>• 导出后可在Excel中根据需要进行筛选和分析</div>
        </div>
      </div>
    </div>
  </Modal>
</template>
