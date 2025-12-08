import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Radio,
    Space,
    Typography,
    Tag,
    Button,
    message,
    Descriptions,
} from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { getTypeColor } from '../../lib/colorMappings';

const { Title, Text } = Typography;

const IndentModal = ({ drug, visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    if (!drug) return null;

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

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

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            title="Add to Indent Cart"
            footer={null}
            width={500}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Drug Info */}
                <div>
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

                {/* Stock Info */}
                {(drug.min_qty !== null || drug.max_qty !== null) && (
                    <Descriptions size="small" column={2} bordered>
                        {drug.min_qty !== null && (
                            <Descriptions.Item label="Min Qty">{drug.min_qty}</Descriptions.Item>
                        )}
                        {drug.max_qty !== null && (
                            <Descriptions.Item label="Max Qty">{drug.max_qty}</Descriptions.Item>
                        )}
                    </Descriptions>
                )}

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
                            style={{ width: '100%' }}
                            placeholder="e.g., 10, 5x30's, 2 boxes"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Add to Cart
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Space>
        </Modal>
    );
};

export default IndentModal;
