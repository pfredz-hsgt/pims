import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Space,
    message,
    Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

const { TextArea } = Input;

const InventoryTable = () => {
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDrug, setEditingDrug] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchDrugs();
        setupRealtimeSubscription();
    }, []);

    const fetchDrugs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setDrugs(data || []);
        } catch (error) {
            console.error('Error fetching drugs:', error);
            message.error('Failed to load inventory items');
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        const subscription = supabase
            .channel('inventory_table_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory_items',
                },
                () => {
                    fetchDrugs();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    const handleAdd = () => {
        setEditingDrug(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (drug) => {
        setEditingDrug(drug);
        form.setFieldsValue(drug);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('inventory_items')
                .delete()
                .eq('id', id);

            if (error) throw error;

            message.success('Drug deleted successfully');
            fetchDrugs();
        } catch (error) {
            console.error('Error deleting drug:', error);
            message.error('Failed to delete drug');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingDrug) {
                // Update existing drug
                const { error } = await supabase
                    .from('inventory_items')
                    .update(values)
                    .eq('id', editingDrug.id);

                if (error) throw error;

                message.success('Drug updated successfully');
            } else {
                // Insert new drug
                const { error } = await supabase
                    .from('inventory_items')
                    .insert(values);

                if (error) throw error;

                message.success('Drug added successfully');
            }

            setModalVisible(false);
            form.resetFields();
            fetchDrugs();
        } catch (error) {
            console.error('Error saving drug:', error);
            message.error('Failed to save drug');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            width: 200,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            filters: [
                { text: 'Tablet', value: 'Tablet' },
                { text: 'Injection', value: 'Injection' },
                { text: 'Syrup', value: 'Syrup' },
                { text: 'Eye Drops', value: 'Eye Drops' },
                { text: 'Ear Drops', value: 'Ear Drops' },
                { text: 'Others', value: 'Others' },
            ],
            onFilter: (value, record) => record.type === value,
            width: 120,
        },
        {
            title: 'Location',
            dataIndex: 'location_code',
            key: 'location_code',
            sorter: (a, b) => a.location_code.localeCompare(b.location_code),
            width: 120,
        },
        {
            title: 'Min Qty',
            dataIndex: 'min_qty',
            key: 'min_qty',
            width: 80,
        },
        {
            title: 'Max Qty',
            dataIndex: 'max_qty',
            key: 'max_qty',
            width: 80,
        },
        {
            title: 'Source',
            dataIndex: 'indent_source',
            key: 'indent_source',
            filters: [
                { text: 'IPD', value: 'IPD' },
                { text: 'OPD', value: 'OPD' },
                { text: 'MFG', value: 'MFG' },
            ],
            onFilter: (value, record) => record.indent_source === value,
            width: 80,
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            ellipsis: true,
            width: 200,
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete this drug?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add New Drug
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={drugs}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
            />

            <Modal
                title={editingDrug ? 'Edit Drug' : 'Add New Drug'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Drug Name"
                        rules={[{ required: true, message: 'Please enter drug name' }]}
                    >
                        <Input placeholder="e.g., Paracetamol 500mg" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Type"
                        rules={[{ required: true, message: 'Please select type' }]}
                    >
                        <Select placeholder="Select drug type">
                            <Select.Option value="Tablet">Tablet</Select.Option>
                            <Select.Option value="Injection">Injection</Select.Option>
                            <Select.Option value="Syrup">Syrup</Select.Option>
                            <Select.Option value="Eye Drops">Eye Drops</Select.Option>
                            <Select.Option value="Ear Drops">Ear Drops</Select.Option>
                            <Select.Option value="Others">Others</Select.Option>
                        </Select>
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="section"
                            label="Section"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input placeholder="e.g., F" style={{ width: 100 }} />
                        </Form.Item>

                        <Form.Item
                            name="row"
                            label="Row"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input placeholder="e.g., 1" style={{ width: 100 }} />
                        </Form.Item>

                        <Form.Item
                            name="bin"
                            label="Bin"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input placeholder="e.g., 1" style={{ width: 100 }} />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item name="min_qty" label="Min Quantity">
                            <InputNumber min={0} placeholder="0" style={{ width: 120 }} />
                        </Form.Item>

                        <Form.Item name="max_qty" label="Max Quantity">
                            <InputNumber min={0} placeholder="0" style={{ width: 120 }} />
                        </Form.Item>
                    </Space>

                    <Form.Item name="indent_source" label="Indent Source">
                        <Select placeholder="Select source">
                            <Select.Option value="IPD">IPD</Select.Option>
                            <Select.Option value="OPD">OPD</Select.Option>
                            <Select.Option value="MFG">MFG</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="remarks" label="Remarks">
                        <TextArea
                            rows={3}
                            placeholder="Any special notes or instructions..."
                        />
                    </Form.Item>

                    <Form.Item name="image_url" label="Image URL">
                        <Input placeholder="https://..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default InventoryTable;
