import React, { useState, useEffect } from 'react';
import {
    Typography,
    Space,
    Collapse,
    List,
    Tag,
    Button,
    Empty,
    Spin,
    message,
    Modal,
    InputNumber,
    Popconfirm,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PrinterOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState({});
    const [editingItem, setEditingItem] = useState(null);
    const [editQuantity, setEditQuantity] = useState(1);

    useEffect(() => {
        fetchCartItems();
    }, []);

    useEffect(() => {
        groupItemsBySource();
    }, [cartItems]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('indent_requests')
                .select(`
          *,
          inventory_items (*)
        `)
                .eq('status', 'Pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setCartItems(data || []);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            message.error('Failed to load cart items');
        } finally {
            setLoading(false);
        }
    };

    const groupItemsBySource = () => {
        const grouped = {
            IPD: [],
            OPD: [],
            MFG: [],
        };

        cartItems.forEach(item => {
            const source = item.inventory_items?.indent_source || 'OPD';
            if (grouped[source]) {
                grouped[source].push(item);
            }
        });

        setGroupedItems(grouped);
    };

    const handleDelete = async (itemId) => {
        try {
            const { error } = await supabase
                .from('indent_requests')
                .delete()
                .eq('id', itemId);

            if (error) throw error;

            message.success('Item removed from cart');
            fetchCartItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            message.error('Failed to remove item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditQuantity(item.requested_qty);
    };

    const handleSaveEdit = async () => {
        try {
            const { error } = await supabase
                .from('indent_requests')
                .update({ requested_qty: editQuantity })
                .eq('id', editingItem.id);

            if (error) throw error;

            message.success('Quantity updated');
            setEditingItem(null);
            fetchCartItems();
        } catch (error) {
            console.error('Error updating quantity:', error);
            message.error('Failed to update quantity');
        }
    };

    const handleApproveIndent = async () => {
        try {
            const { error } = await supabase
                .from('indent_requests')
                .update({ status: 'Approved' })
                .eq('status', 'Pending');

            if (error) throw error;

            message.success('Indent approved successfully!');
            fetchCartItems();
        } catch (error) {
            console.error('Error approving indent:', error);
            message.error('Failed to approve indent');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getSourceColor = (source) => {
        const colors = {
            'IPD': 'blue',
            'OPD': 'green',
            'MFG': 'orange',
        };
        return colors[source] || 'default';
    };

    const getTypeColor = (type) => {
        const colors = {
            'Tablet': 'blue',
            'Injection': 'red',
            'Syrup': 'purple',
            'Eye Drops': 'cyan',
            'Ear Drops': 'green',
            'Others': 'default',
        };
        return colors[type] || 'default';
    };

    const renderItemActions = (item) => [
        <Button
            key="edit"
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(item)}
        >
            Edit
        </Button>,
        <Popconfirm
            key="delete"
            title="Remove this item from cart?"
            onConfirm={() => handleDelete(item.id)}
            okText="Yes"
            cancelText="No"
        >
            <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
            </Button>
        </Popconfirm>,
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    const totalItems = cartItems.length;

    return (
        <div className="cart-page">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>Indent Cart</Title>
                        <Text type="secondary">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'} pending
                        </Text>
                    </div>
                    <Space>
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={handlePrint}
                            disabled={totalItems === 0}
                        >
                            Print
                        </Button>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleApproveIndent}
                            disabled={totalItems === 0}
                        >
                            Approve Indent
                        </Button>
                    </Space>
                </div>

                {/* Empty State */}
                {totalItems === 0 && (
                    <Empty description="No pending items in cart" />
                )}

                {/* Grouped Items */}
                {totalItems > 0 && (
                    <Collapse defaultActiveKey={['IPD', 'OPD', 'MFG']}>
                        {Object.entries(groupedItems).map(([source, items]) => {
                            if (items.length === 0) return null;

                            return (
                                <Panel
                                    header={
                                        <Space>
                                            <Tag color={getSourceColor(source)}>{source}</Tag>
                                            <Text>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
                                        </Space>
                                    }
                                    key={source}
                                >
                                    <List
                                        dataSource={items}
                                        renderItem={(item) => (
                                            <List.Item actions={renderItemActions(item)}>
                                                <List.Item.Meta
                                                    title={
                                                        <Space>
                                                            <Text strong>{item.inventory_items?.name}</Text>
                                                            <Tag color={getTypeColor(item.inventory_items?.type)}>
                                                                {item.inventory_items?.type}
                                                            </Tag>
                                                        </Space>
                                                    }
                                                    description={
                                                        <Space direction="vertical" size="small">
                                                            <Space>
                                                                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                                                <Text type="secondary">
                                                                    {item.inventory_items?.location_code}
                                                                </Text>
                                                            </Space>
                                                            <Text>Quantity: <Text strong>{item.requested_qty}</Text></Text>
                                                            {item.inventory_items?.remarks && (
                                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                    {item.inventory_items.remarks}
                                                                </Text>
                                                            )}
                                                        </Space>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Panel>
                            );
                        })}
                    </Collapse>
                )}
            </Space>

            {/* Edit Quantity Modal */}
            <Modal
                title="Edit Quantity"
                open={editingItem !== null}
                onOk={handleSaveEdit}
                onCancel={() => setEditingItem(null)}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>Update quantity for: <Text strong>{editingItem?.inventory_items?.name}</Text></Text>
                    <InputNumber
                        min={1}
                        value={editQuantity}
                        onChange={setEditQuantity}
                        style={{ width: '100%' }}
                    />
                </Space>
            </Modal>

            {/* Print Styles */}
            <style>{`
        @media print {
          .ant-layout-header,
          .ant-layout-sider,
          .ant-btn,
          .cart-page .ant-space-item:first-child {
            display: none !important;
          }
          
          .cart-page {
            padding: 20px;
          }
          
          .ant-collapse-header {
            background: #f0f0f0 !important;
            font-weight: bold;
          }
        }
      `}</style>
        </div>
    );
};

export default CartPage;
