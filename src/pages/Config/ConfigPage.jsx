import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, InputNumber, Row, Col, Switch } from 'antd';
import { supabase } from '../../lib/supabase';
import { PlusOutlined, SyncOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const ConfigPage = () => {
    const [configs, setConfigs] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    // Shelf Templates state
    const [shelfTemplates, setShelfTemplates] = useState([]);
    const [isShelfModalVisible, setIsShelfModalVisible] = useState(false);
    const [isShelfFormVisible, setIsShelfFormVisible] = useState(false);
    const [editingShelfId, setEditingShelfId] = useState(null);
    const [shelfForm] = Form.useForm();

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        section: null,
        row: null,
        bin_size: null,
        bin_loc: null,
        showEmpty: false,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch configs
            const { data: configData, error: configError } = await supabase
                .from('inventory_config')
                .select('*')
                .order('section', { ascending: true })
                .order('row', { ascending: true })
                .order('bin_loc', { ascending: true });

            if (configError) throw configError;

            // Fetch items to check occupancy
            const { data: itemsData, error: itemsError } = await supabase
                .from('inventory_items')
                .select('id, name, location_code');

            if (itemsError) throw itemsError;

            // Fetch shelf templates
            const { data: shelfData } = await supabase
                .from('shelf_templates')
                .select('*')
                .order('section', { ascending: true })
                .order('row', { ascending: true });

            setConfigs(configData || []);
            setItems(itemsData || []);
            setShelfTemplates(shelfData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to load configuration data');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({ status: 'Active', bin_size: 'M' });
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Configuration',
            content: 'Are you sure you want to delete this configuration?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const { error } = await supabase
                        .from('inventory_config')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    message.success('Configuration deleted successfully');
                    setIsModalVisible(false);
                    fetchData();
                } catch (error) {
                    console.error('Error deleting:', error);
                    message.error('Failed to delete configuration');
                }
            }
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingId) {
                const { error } = await supabase
                    .from('inventory_config')
                    .update(values)
                    .eq('id', editingId);

                if (error) throw error;
                message.success('Configuration updated successfully');
            } else {
                const { error } = await supabase
                    .from('inventory_config')
                    .insert([values]);

                if (error) throw error;
                message.success('Configuration added successfully');
            }

            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            if (error.errorFields) return; // Validation error
            console.error('Error saving:', error);
            message.error(error.message || 'Failed to save configuration');
        }
    };

    // Shelf Templates Handlers
    const handleAddShelf = () => {
        setEditingShelfId(null);
        shelfForm.resetFields();
        setIsShelfFormVisible(true);
    };

    const handleEditShelf = (record) => {
        setEditingShelfId(record.id);
        shelfForm.setFieldsValue(record);
        setIsShelfFormVisible(true);
    };

    const handleDeleteShelf = (id) => {
        Modal.confirm({
            title: 'Delete Mapping',
            content: 'Are you sure you want to delete this template mapping?',
            okText: 'Yes',
            okType: 'danger',
            onOk: async () => {
                try {
                    const { error } = await supabase.from('shelf_templates').delete().eq('id', id);
                    if (error) throw error;
                    message.success('Mapping deleted successfully');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete mapping');
                }
            }
        });
    };

    const handleShelfFormOk = async () => {
        try {
            const values = await shelfForm.validateFields();
            if (editingShelfId) {
                const { error } = await supabase.from('shelf_templates').update(values).eq('id', editingShelfId);
                if (error) throw error;
                message.success('Mapping updated');
            } else {
                const { error } = await supabase.from('shelf_templates').insert([values]);
                if (error) throw error;
                message.success('Mapping added');
            }
            setIsShelfFormVisible(false);
            fetchData();
        } catch (error) {
            if (error.errorFields) return;
            message.error(error.message || 'Failed to save mapping');
        }
    };

    const handleSync = () => {
        Modal.confirm({
            title: 'Sync Configurations from Inventory',
            content: 'This will scan all existing inventory items and create bin configurations for any that are missing. Do you want to proceed?',
            onOk: async () => {
                setLoading(true);
                try {
                    const { data: allItems, error } = await supabase.from('inventory_items').select('section, row, bin');
                    if (error) throw error;

                    const uniqueConfigs = [];
                    const seen = new Set();

                    allItems.forEach(item => {
                        if (!item.section || !item.row || !item.bin) return;

                        const key = `${item.section}-${item.row}-${item.bin}`;
                        if (!seen.has(key)) {
                            seen.add(key);

                            const firstChar = item.bin.charAt(0).toUpperCase();
                            const restStr = item.bin.substring(1);
                            const restNum = parseInt(restStr, 10);

                            if (['S', 'M', 'L'].includes(firstChar) && !isNaN(restNum)) {
                                uniqueConfigs.push({
                                    section: item.section,
                                    row: parseInt(item.row, 10),
                                    bin_size: firstChar,
                                    bin_loc: restNum,
                                    status: 'Active'
                                });
                            }
                        }
                    });

                    const existingLocationCodes = new Set(configs.map(c => c.location_code));

                    const toInsert = uniqueConfigs.filter(c => {
                        const locCode = `${c.section}-${c.row}-${c.bin_size}${c.bin_loc}`;
                        return !existingLocationCodes.has(locCode);
                    });

                    if (toInsert.length > 0) {
                        const { error: insertError } = await supabase.from('inventory_config').insert(toInsert);
                        if (insertError) throw insertError;
                        message.success(`Successfully synced ${toInsert.length} new locations!`);
                        fetchData();
                    } else {
                        message.info('No new locations to sync. Everything is up to date.');
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error syncing:', error);
                    message.error('Failed to sync locations from inventory.');
                    setLoading(false);
                }
            }
        });
    };

    // Derived data
    const tableData = useMemo(() => {
        return configs.map(config => {
            const occupyingItems = items.filter(item => item.location_code === config.location_code);
            return {
                ...config,
                occupyingItems
            };
        });
    }, [configs, items]);

    const filteredData = useMemo(() => {
        return tableData.filter(item => {
            if (filters.search) {
                const term = filters.search.toLowerCase();
                const matchesLoc = item.location_code?.toLowerCase().includes(term);
                const matchesName = item.occupyingItems.some(i => i.name.toLowerCase().includes(term));
                if (!matchesLoc && !matchesName) return false;
            }
            if (filters.section && item.section !== filters.section) return false;
            if (filters.row && item.row !== filters.row) return false;
            if (filters.bin_size && item.bin_size !== filters.bin_size) return false;
            if (filters.bin_loc && item.bin_loc !== filters.bin_loc) return false;
            if (filters.showEmpty && item.occupyingItems.length > 0) return false;
            return true;
        });
    }, [tableData, filters]);

    // Unique options for filters
    const uniqueSections = [...new Set(configs.map(c => c.section))].sort();
    const uniqueRows = [...new Set(configs.map(c => c.row))].sort((a, b) => a - b);
    const uniqueBinSizes = [...new Set(configs.map(c => c.bin_size))].sort();

    const columns = [
        {
            title: 'Location Code',
            dataIndex: 'location_code',
            key: 'location_code',
        },
        {
            title: 'Items',
            key: 'occupancy',
            render: (_, record) => {
                if (record.occupyingItems && record.occupyingItems.length > 0) {
                    return (
                        <Space direction="vertical" size="small">
                            {record.occupyingItems.map(item => (
                                <Tag color="purple" key={item.id}>{item.name}</Tag>
                            ))}
                        </Space>
                    );
                }
                return <Tag color="green">Empty</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'success' : 'error'}>{status}</Tag>
            )
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
        }
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Inventory Configuration</h2>
                <Space>
                    <Button onClick={() => setIsShelfModalVisible(true)}>
                        Manage Shelf Templates
                    </Button>
                    <Button icon={<SyncOutlined />} onClick={handleSync}>
                        Sync from Inventory
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Configuration
                    </Button>
                </Space>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: 16, padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            placeholder="Search Location or Drug Name"
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Select
                            placeholder="Section"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.section}
                            onChange={(val) => handleFilterChange('section', val)}
                        >
                            {uniqueSections.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Select
                            placeholder="Row"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.row}
                            onChange={(val) => handleFilterChange('row', val)}
                        >
                            {uniqueRows.map(r => <Option key={r} value={r}>{r}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                        <Select
                            placeholder="Bin Size"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.bin_size}
                            onChange={(val) => handleFilterChange('bin_size', val)}
                        >
                            {uniqueBinSizes.map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <InputNumber
                            placeholder="Bin Loc (e.g. 6)"
                            style={{ width: '100%' }}
                            value={filters.bin_loc}
                            onChange={(val) => handleFilterChange('bin_loc', val)}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={5}>
                        <Space>
                            <span>Show Empty Only:</span>
                            <Switch
                                checked={filters.showEmpty}
                                onChange={(val) => handleFilterChange('showEmpty', val)}
                            />
                        </Space>
                    </Col>
                </Row>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{ 
                    defaultPageSize: 20, 
                    showSizeChanger: true, 
                    pageSizeOptions: ['10', '20', '50', '100'] 
                }}
                onRow={(record) => ({
                    onClick: () => handleEdit(record),
                    style: { cursor: 'pointer' }
                })}
            />

            <Modal
                title={editingId ? "Edit Configuration" : "Add Configuration"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
                footer={[
                    editingId && (
                        <Button key="delete" danger onClick={() => handleDelete(editingId)} style={{ float: 'left' }}>
                            Delete
                        </Button>
                    ),
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleModalOk}>
                        Save
                    </Button>
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="section"
                        label="Section"
                        rules={[{ required: true, message: 'Please input section!' }]}
                    >
                        <Input placeholder="e.g., F" maxLength={2} />
                    </Form.Item>

                    <Form.Item
                        name="row"
                        label="Row"
                        rules={[{ required: true, message: 'Please input row!' }]}
                    >
                        <InputNumber placeholder="e.g., 2" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="bin_size"
                        label="Bin Size"
                        rules={[{ required: true, message: 'Please select bin size!' }]}
                    >
                        <Select placeholder="Select size">
                            <Option value="S">Small (S)</Option>
                            <Option value="M">Medium (M)</Option>
                            <Option value="L">Large (L)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="bin_loc"
                        label="Bin Location (Numerical)"
                        rules={[{ required: true, message: 'Please input bin location!' }]}
                    >
                        <InputNumber placeholder="e.g., 6" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                    >
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                            <Option value="Maintenance">Maintenance</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="remarks"
                        label="Remarks"
                    >
                        <Input.TextArea rows={3} placeholder="Any specific notes about this location..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Shelf Templates Modals */}
            <Modal
                title="Manage Shelf Templates"
                open={isShelfModalVisible}
                onCancel={() => setIsShelfModalVisible(false)}
                footer={null}
                width={700}
            >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddShelf} style={{ marginBottom: 16 }}>
                    Add Mapping
                </Button>
                <Table
                    dataSource={shelfTemplates}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    columns={[
                        { title: 'Section', dataIndex: 'section', key: 'section' },
                        { title: 'Row', dataIndex: 'row', key: 'row' },
                        { title: 'Template ID', dataIndex: 'template_id', key: 'template_id', render: t => <Tag color="blue">{t}</Tag> },
                        { 
                            title: 'Actions', 
                            key: 'actions', 
                            render: (_, record) => (
                                <Space>
                                    <Button size="small" onClick={() => handleEditShelf(record)}>Edit</Button>
                                    <Button size="small" danger onClick={() => handleDeleteShelf(record.id)}>Delete</Button>
                                </Space>
                            ) 
                        }
                    ]}
                />
            </Modal>

            <Modal
                title={editingShelfId ? "Edit Shelf Mapping" : "Add Shelf Mapping"}
                open={isShelfFormVisible}
                onCancel={() => setIsShelfFormVisible(false)}
                onOk={handleShelfFormOk}
                destroyOnClose
            >
                <Form form={shelfForm} layout="vertical">
                    <Form.Item name="section" label="Section (e.g. D)" rules={[{ required: true, message: 'Required' }]}>
                        <Input maxLength={2} />
                    </Form.Item>
                    <Form.Item name="row" label="Row (e.g. 3)" rules={[{ required: true, message: 'Required' }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="template_id" label="Template ID" rules={[{ required: true, message: 'Required' }]}>
                        <Select placeholder="Select Template">
                            <Option value="M15S8">M15S8</Option>
                            <Option value="L8S4">L8S4</Option>
                            <Option value="L8">L8</Option>
                            <Option value="M9">M9</Option>
                            <Option value="M18">M18</Option>
                            <Option value="S36">S36</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ConfigPage;
