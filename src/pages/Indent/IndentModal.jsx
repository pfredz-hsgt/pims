import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Radio,
    Space,
    Typography,
    Tag,
    Button,
    message,
    Descriptions,
} from 'antd';
import { EnvironmentOutlined, EditOutlined, FormOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { getTypeColor } from '../../lib/colorMappings';

const { Title, Text } = Typography;
const { TextArea } = Input;

const IndentModal = ({ drug, visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [minQty, setMinQty] = useState(null);
    const [maxQty, setMaxQty] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const quantityInputRef = useRef(null);

    // Initialize min/max qty when drug changes
    useEffect(() => {
        if (drug) {
            setMinQty(drug.min_qty);
            setMaxQty(drug.max_qty);
            setHasChanges(false);
        }
    }, [drug]);

    // Auto-focus quantity input when modal opens
    useEffect(() => {
        if (visible) {
            // Delay to ensure modal animation completes
            setTimeout(() => {
                if (quantityInputRef.current) {
                    quantityInputRef.current.focus();
                }
            }, 400);
        }
    }, [visible]);

    if (!drug) return null;

    const handleMinQtyChange = (value) => {
        setMinQty(value);
        setHasChanges(true);
    };

    const handleMaxQtyChange = (value) => {
        setMaxQty(value);
        setHasChanges(true);
    };

    const saveMinMaxQty = async () => {
        if (!hasChanges) return;

        try {
            const { error } = await supabase
                .from('inventory_items')
                .update({
                    min_qty: minQty,
                    max_qty: maxQty,
                })
                .eq('id', drug.id);

            if (error) throw error;

            message.success('Min/Max quantities updated');
            setHasChanges(false);
        } catch (error) {
            console.error('Error updating min/max qty:', error);
            message.error('Failed to update min/max quantities');
        }
    };

    const handleClose = async () => {
        await saveMinMaxQty();
        onClose();
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Save min/max qty changes first
            await saveMinMaxQty();

            const { error } = await supabase
                .from('indent_requests')
                .insert({
                    item_id: drug.id,
                    requested_qty: values.quantity,
                    status: 'Pending',
                });

            if (error) throw error;
            form.resetFields();
            onSuccess();
        } catch (error) {
            console.error('Error adding to cart:', error);
            message.error('Failed to add item to cart');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = () => {
        editForm.setFieldsValue(drug);
        setEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            const { error } = await supabase
                .from('inventory_items')
                .update(values)
                .eq('id', drug.id);

            if (error) throw error;

            message.success('Drug updated successfully');
            setEditModalVisible(false);
            editForm.resetFields();
        } catch (error) {
            console.error('Error updating drug:', error);
            message.error('Failed to update drug');
        }
    };

    return (
        <>
            <Modal
                open={visible}
                onCancel={handleClose}
                destroyOnHidden
                zIndex={1000}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                        <span>Add to Indent Cart</span>
                        <Button
                            type="text"
                            icon={<FormOutlined />}
                            onClick={handleOpenEditModal}
                            size="small"
                        >
                            Edit
                        </Button>
                    </div>
                }
                footer={null}
                width={500}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Drug Info */}
                    <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ marginBottom: 8 }}>
                            {drug.name}
                        </Title>
                        <Space>
                            <Tag color={getTypeColor(drug.type)}>{drug.type}</Tag>
                            <Space size="small">
                                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary">{drug.location_code}</Text>
                            </Space>
                        </Space>
                        {drug.remarks && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {drug.remarks}
                                </Text>
                            </div>
                        )}
                    </div>

                    {/* Editable Stock Info */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Text strong>Stock Levels</Text>
                            <EditOutlined style={{ fontSize: 12, color: '#1890ff' }} />
                            {hasChanges && (
                                <Text type="warning" style={{ fontSize: 12 }}>
                                    (unsaved changes)
                                </Text>
                            )}
                        </div>
                        <Space size="large">
                            <div>
                                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                    Min Qty
                                </Text>
                                <InputNumber
                                    value={minQty}
                                    onChange={handleMinQtyChange}
                                    min={0}
                                    placeholder="Min"
                                    style={{ width: 100 }}
                                />
                            </div>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                                    Max Qty
                                </Text>
                                <InputNumber
                                    value={maxQty}
                                    onChange={handleMaxQtyChange}
                                    min={0}
                                    placeholder="Max"
                                    style={{ width: 100 }}
                                />
                            </div>
                        </Space>
                    </div>

                    {/* Form */}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            quantity: '',
                        }}
                    >
                        <Form.Item
                            name="quantity"
                            label="Quantity"
                            rules={[
                                { required: true, message: 'Please enter quantity' },
                            ]}
                        >
                            <Input
                                ref={quantityInputRef}
                                autoFocus
                                style={{ width: '100%' }}
                                placeholder="e.g., 10, 5x30's, 2 boxes"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Add to Cart
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Space>
            </Modal>

            {/* Edit Drug Modal */}
            <Modal
                title="Edit Drug Details"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={() => editForm.submit()}
                width={600}
                zIndex={2000}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
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
                            <Select.Option value="OPD">OPD</Select.Option>
                            <Select.Option value="Eye/Ear/Nose/Inh">Eye/Ear/Nose/Inh</Select.Option>
                            <Select.Option value="DDA">DDA</Select.Option>
                            <Select.Option value="External">External</Select.Option>
                            <Select.Option value="Injection">Injection</Select.Option>
                            <Select.Option value="Syrup">Syrup</Select.Option>
                            <Select.Option value="Others">Others</Select.Option>
                            <Select.Option value="UOD">UOD</Select.Option>
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
                            <Select.Option value="OPD Counter">OPD Counter</Select.Option>
                            <Select.Option value="OPD Substore">OPD Substore</Select.Option>
                            <Select.Option value="IPD Counter">IPD Counter</Select.Option>
                            <Select.Option value="MNF Substor">MNF Substor</Select.Option>
                            <Select.Option value="Manufact">Manufact</Select.Option>
                            <Select.Option value="Prepacking">Prepacking</Select.Option>
                            <Select.Option value="IPD Substore">IPD Substore</Select.Option>
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
        </>
    );
};

export default IndentModal;
