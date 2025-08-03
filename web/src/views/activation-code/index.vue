<script setup lang="tsx">
import { Button, Popconfirm, Tag, Tooltip } from 'ant-design-vue';
import dayjs from 'dayjs';
import { ref } from 'vue';

import SvgIcon from '@/components/custom/svg-icon.vue';
import { UNIFORM_TEXT } from '@/enum';
import { I18N_COMMON } from '@/enum/i18n';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import {
  activateActivationCode,
  delActivationCode,
  getActivationCodeList,
  refundActivationCode,
  revokeActivationCode,
} from '@/service/api';

import ExportModal from './modules/export-modal.vue';
import HeaderSearch from './modules/header-search.vue';
import ImportDrawer from './modules/import-drawer.vue';
import RefundModal from './modules/refund-modal.vue';

// 激活码类型选项
const activationCodeTypeOptions = [
  { label: '1天KEY', value: 1 },
  { label: '15天KEY', value: 15 },
  { label: '30天KEY', value: 30 },
  { label: '182天KEY', value: 182 },
  { label: '365天KEY', value: 365 },
];

// 获取激活码类型标签颜色
const getTypeTagColor = (type: number) => {
  const colors: Record<number, string> = {
    1: 'volcano',
    15: 'orange',
    30: 'gold',
    182: 'lime',
    365: 'green',
  };
  return colors[type] || 'default';
};

// 获取激活码类型标签文本
const getTypeTagText = (type: number) => {
  const option = activationCodeTypeOptions.find(opt => opt.value === type);
  return option?.label || `${type}天`;
};

const { tableWrapperRef, scrollConfig } = useTableScroll(1400);

// 导入抽屉显示状态
const importDrawerVisible = ref(false);

// 导出弹窗显示状态
const exportModalVisible = ref(false);

// 退款弹窗显示状态
const refundModalVisible = ref(false);
const refundingRecord = ref<Api.ActivationCode.ActivationCode | null>(null);

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  updateSearchParams,
  resetSearchParams,
} = useTable({
  apiFn: getActivationCodeList,
  apiParams: {
    code: undefined,
    type: undefined,
    activated: undefined,
    refunded: undefined,
    revoked: undefined,
    startDate: undefined,
    endDate: undefined,
    current: 1,
    size: 10,
  },
  columns: () => [
    {
      key: 'index',
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => index + 1,
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: '类型',
      align: 'center',
      width: 100,
      customRender: ({ text }) => (
        <Tag bordered={false} color={getTypeTagColor(text)}>
          {getTypeTagText(text)}
        </Tag>
      ),
    },
    {
      key: 'code',
      dataIndex: 'code',
      title: '激活码',
      align: 'center',
      width: 200,
      ellipsis: true,
      customRender: ({ text }) =>
        text ? (
          <Tooltip title={text} placement="topLeft">
            <span class="font-mono">{text}</span>
          </Tooltip>
        ) : (
          UNIFORM_TEXT.NULL
        ),
    },
    // {
    //   key: 'dataDate',
    //   dataIndex: 'dataDate',
    //   title: '数据日期',
    //   align: 'center',
    //   width: 180,
    //   customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : UNIFORM_TEXT.NULL),
    // },
    {
      key: 'importedAt',
      dataIndex: 'importedAt',
      title: '导入时间',
      align: 'center',
      width: 180,
      customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      key: 'activated',
      dataIndex: 'activated',
      title: '激活状态',
      align: 'center',
      width: 120,
      customRender: ({ text, record }) => (
        <Button
          type={text ? 'primary' : 'default'}
          size="small"
          onClick={() => handleActivate(record)}
        >
          {text ? '取消激活' : '点击激活'}
        </Button>
      ),
    },
    {
      key: 'activatedAt',
      dataIndex: 'activatedAt',
      title: '激活时间',
      align: 'center',
      width: 180,
      customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : UNIFORM_TEXT.NULL),
    },
    {
      key: 'refunded',
      dataIndex: 'refunded',
      title: '退款状态',
      align: 'center',
      width: 120,
      customRender: ({ text, record }) => (
        <Button
          type={text ? 'primary' : 'default'}
          size="small"
          disabled={!record.activated}
          onClick={() => handleRefund(record)}
        >
          {text ? '取消退款' : '点击退款'}
        </Button>
      ),
    },
    {
      key: 'refundedAt',
      dataIndex: 'refundedAt',
      title: '退款时间',
      align: 'center',
      width: 180,
      customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : UNIFORM_TEXT.NULL),
    },
    {
      key: 'refundNote',
      dataIndex: 'refundNote',
      title: '原因备注',
      align: 'center',
      width: 150,
      ellipsis: true,
      customRender: ({ text }) =>
        text ? (
          <Tooltip title={text} placement="topLeft">
            {text}
          </Tooltip>
        ) : (
          UNIFORM_TEXT.NULL
        ),
    },
    {
      key: 'revoked',
      dataIndex: 'revoked',
      title: '收回状态',
      align: 'center',
      width: 120,
      customRender: ({ text, record }) => (
        <Button
          type={text ? 'primary' : 'default'}
          size="small"
          disabled={!record.activated}
          onClick={() => handleRevoke(record)}
        >
          {text ? '取消收回' : '点击收回'}
        </Button>
      ),
    },
    {
      key: 'revokedAt',
      dataIndex: 'revokedAt',
      title: '收回时间',
      align: 'center',
      width: 180,
      customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : UNIFORM_TEXT.NULL),
    },
    {
      key: 'operate',
      title: $t(I18N_COMMON.OPERATE),
      align: 'center',
      width: 100,
      fixed: 'right',
      customRender: ({ record }) => (
        <div class="flex-center gap-8px">
          <Popconfirm title={$t(I18N_COMMON.CONFIRM_DELETE)} onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small">
              {$t(I18N_COMMON.DELETE)}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ],
});

const { checkedRowKeys, onDeleted } = useTableOperate(data, getData);

/** @description: 删除激活码 */
const handleDelete = async (id: string) =>
  await delActivationCode({ id }).then(({ error }) => {
    if (!error) {
      onDeleted();
      window.$message?.success('删除成功');
    }
  });

/** @description: 激活码激活/取消激活 */
const handleActivate = async (record: Api.ActivationCode.ActivationCode) => {
  await activateActivationCode(record.id).then(({ error }) => {
    if (!error) {
      getData();
      window.$message?.success(record.activated ? '已取消激活' : '激活成功');
    }
  });
};

/** @description: 激活码退款/取消退款 */
const handleRefund = (record: Api.ActivationCode.ActivationCode) => {
  if (!record.activated) return;

  // 设置当前操作的记录
  refundingRecord.value = record;

  // 如果已退款，直接取消退款
  if (record.refunded) {
    confirmRefund('');
    return;
  }

  // 如果未退款，弹出退款原因输入框
  refundModalVisible.value = true;
};

/** @description: 确认退款/取消退款 */
const confirmRefund = async (refundNote: string) => {
  if (!refundingRecord.value) return;

  const isRefunded = refundingRecord.value.refunded;

  await refundActivationCode(refundingRecord.value.id, { refundNote }).then(({ error }) => {
    if (!error) {
      getData();
      refundModalVisible.value = false;
      refundingRecord.value = null;
      window.$message?.success(isRefunded ? '已取消退款' : '退款成功');
    }
  });
};

/** @description: 激活码收回/取消收回 */
const handleRevoke = async (record: Api.ActivationCode.ActivationCode) => {
  if (!record.activated) return;

  await revokeActivationCode(record.id).then(({ error }) => {
    if (!error) {
      getData();
      window.$message?.success(record.revoked ? '已取消收回' : '收回成功');
    }
  });
};

/** @description: 数据导入 */
const handleImport = () => {
  importDrawerVisible.value = true;
};

/** @description: 数据导出 */
const handleExport = () => {
  exportModalVisible.value = true;
};

/** @description: 导入成功回调 */
const onImportSuccess = () => {
  importDrawerVisible.value = false;
  getData();
};

/** @description: 获取表格行CSS类名 */
const getRowClassName = (record: Api.ActivationCode.ActivationCode, _index: number): string => {
  // 已退款，已回收 → 灰底色
  if (record.refunded && record.revoked) {
    return 'row-refunded-revoked';
  }
  // 已退款，未回收 → 橙底色
  if (record.refunded && !record.revoked) {
    return 'row-refunded-only';
  }
  // 默认样式
  return '';
};
</script>

<template>
  <PageContainer>
    <template #header>
      <!-- 顶部搜索 -->
      <HeaderSearch
        v-model:model="searchParams"
        :update-search-params="updateSearchParams"
        @reset="resetSearchParams"
        @search="getDataByPage"
      />
    </template>
    <template #extra>
      <div class="flex gap-12px">
        <Button type="primary" class="flex flex-center" @click="handleImport">
          <template #icon>
            <SvgIcon icon="carbon:cloud-upload" class="mr-4px" />
          </template>
          数据导入
        </Button>
        <Button class="flex flex-center" @click="handleExport">
          <template #icon>
            <SvgIcon icon="carbon:cloud-download" class="mr-4px" />
          </template>
          数据导出
        </Button>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :add-btn="false"
          @refresh="getData"
        />
      </div>
    </template>
    <!-- 表格 -->
    <ATable
      ref="tableWrapperRef"
      :columns="columns"
      :data-source="data"
      size="small"
      :scroll="scrollConfig"
      :loading="loading"
      row-key="id"
      :row-class-name="getRowClassName"
      :pagination="{
        ...mobilePagination,
        showTotal: total => `共 ${total} 条数据`,
      }"
      class="h-full"
    />

    <!-- 导入抽屉 -->
    <ImportDrawer v-model:visible="importDrawerVisible" @success="onImportSuccess" />

    <!-- 导出弹窗 -->
    <ExportModal v-model:visible="exportModalVisible" />

    <!-- 退款弹窗 -->
    <RefundModal v-model:visible="refundModalVisible" :record="refundingRecord" @confirm="confirmRefund" />
  </PageContainer>
</template>

<style scoped>
/* 已退款，未回收的行样式 - 橙底色 */
:deep(.row-refunded-only) {
  background-color: #fff7e6 !important;
}

:deep(.row-refunded-only:hover) {
  background-color: #ffe7ba !important;
}

/* 已退款，已回收的行样式 - 灰底色 */
:deep(.row-refunded-revoked) {
  background-color: #f5f5f5 !important;
}

:deep(.row-refunded-revoked:hover) {
  background-color: #e8e8e8 !important;
}
</style>
