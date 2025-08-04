<script setup lang="tsx">
import { Button, Form, Input, Modal, Popconfirm } from 'ant-design-vue';
import dayjs from 'dayjs';
import { reactive, ref } from 'vue';

import SvgIcon from '@/components/custom/svg-icon.vue';
import { I18N_COMMON } from '@/enum/i18n';
import { useTable, useTableOperate, useTableScroll } from '@/hooks/common/table';
import { $t } from '@/locales';
import { addCodeType, delCodeType, getCodeTypeList, updateCodeType } from '@/service/api';

const { tableWrapperRef, scrollConfig } = useTableScroll(800);

// 添加/编辑弹窗显示状态
const modalVisible = ref(false);
const editingRecord = ref<Api.CodeType.CodeType | null>(null);

// 表单数据
const formData = reactive({
  name: '',
});

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams,
} = useTable({
  apiFn: getCodeTypeList,
  apiParams: {
    name: undefined,
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
      key: 'name',
      dataIndex: 'name',
      title: '类型名称',
      align: 'center',
      width: 200,
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: '创建时间',
      align: 'center',
      width: 180,
      customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      title: '更新时间',
      align: 'center',
      width: 180,
      customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      key: 'operate',
      title: $t(I18N_COMMON.OPERATE),
      align: 'center',
      width: 150,
      fixed: 'right',
      customRender: ({ record }) => (
        <div class="flex-center gap-8px">
          <Button size="small" onClick={() => handleEdit(record)}>
            {$t(I18N_COMMON.EDIT)}
          </Button>
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

const toastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  window.$message?.[type](message);
};

/** @description: 重置表单 */
const resetForm = () => {
  formData.name = '';
};

/** @description: 添加激活码类型 */
const handleAdd = () => {
  editingRecord.value = null;
  resetForm();
  modalVisible.value = true;
};

/** @description: 编辑激活码类型 */
const handleEdit = (record: Api.CodeType.CodeType) => {
  editingRecord.value = record;
  formData.name = record.name;
  modalVisible.value = true;
};

/** @description: 删除激活码类型 */
const handleDelete = async (id: string) => {
  await delCodeType({ id }).then(({ error }) => {
    if (!error) {
      onDeleted();
      toastMessage('删除成功');
    }
  });
};

/** @description: 保存激活码类型 */
const handleSave = async () => {
  if (!formData.name.trim()) {
    toastMessage('请输入类型名称', 'error');
    return;
  }

  const saveData = { name: formData.name.trim() };

  if (editingRecord.value) {
    // 更新
    await updateCodeType(editingRecord.value.id, saveData).then(({ error }) => {
      if (!error) {
        modalVisible.value = false;
        getData();
        toastMessage('更新成功');
      }
    });
  } else {
    // 新增
    await addCodeType(saveData).then(({ error }) => {
      if (!error) {
        modalVisible.value = false;
        getData();
        toastMessage('创建成功');
      }
    });
  }
};

/** @description: 取消操作 */
const handleCancel = () => {
  modalVisible.value = false;
  resetForm();
  editingRecord.value = null;
};

/** @description: 搜索 */
const handleSearch = () => {
  getDataByPage();
};

/** @description: 重置搜索 */
const handleReset = () => {
  resetSearchParams();
  getDataByPage();
};
</script>

<template>
  <PageContainer>
    <template #header>
      <!-- 顶部搜索 -->
      <ACard :bordered="false" size="small" class="card-wrapper">
        <AForm layout="inline" :model="searchParams">
          <AFormItem label="类型名称">
            <AInput
              v-model:value="searchParams.name"
              placeholder="请输入类型名称"
              allow-clear
              @press-enter="handleSearch"
            />
          </AFormItem>
          <AFormItem>
            <ASpace>
              <AButton class="flex flex-center" type="primary" @click="handleSearch">
                <template #icon>
                  <SvgIcon class="mr-4px" icon="ic:baseline-search" />
                </template>
                搜索
              </AButton>
              <AButton class="flex flex-center" @click="handleReset">
                <template #icon>
                  <SvgIcon class="mr-4px" icon="ic:baseline-refresh" />
                </template>
                重置
              </AButton>
            </ASpace>
          </AFormItem>
        </AForm>
      </ACard>
    </template>
    <template #extra>
      <div class="flex gap-12px">
        <Button type="primary" class="flex flex-center" @click="handleAdd">
          <template #icon>
            <SvgIcon icon="ic:baseline-add" class="mr-4px" />
          </template>
          新增类型
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
      :pagination="{
        ...mobilePagination,
        showTotal: total => `共 ${total} 条数据`,
      }"
      class="h-full"
    />

    <!-- 添加/编辑弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="editingRecord ? '编辑激活码类型' : '新增激活码类型'"
      @ok="handleSave"
      @cancel="handleCancel"
    >
      <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <Form.Item
          label="类型名称"
          :rules="[
            { required: true, message: '请输入类型名称' },
            { max: 50, message: '类型名称不能超过50个字符' },
          ]"
        >
          <Input v-model:value="formData.name" placeholder="请输入类型名称，如：30天KEY" />
        </Form.Item>
      </Form>
    </Modal>
  </PageContainer>
</template>

<style scoped></style>
