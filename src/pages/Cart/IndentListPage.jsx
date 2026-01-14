import React, { useState, useEffect } from 'react';
import {
    Typography,
    Space,
    Collapse,
    List,
    Tag,
    Empty,
    Spin,
    message,
    DatePicker,
    Badge,
} from 'antd';
import {
    EnvironmentOutlined,
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { getTypeColor, getSourceColor } from '../../lib/colorMappings';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const IndentListPage = () => {
    const [loading, setLoading] = useState(true);
    const [indentItems, setIndentItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState({});
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [datesWithIndents, setDatesWithIndents] = useState([]);

    useEffect(() => {
        fetchDatesWithIndents();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchIndentItems();
        }
    }, [selectedDate]);

    useEffect(() => {
        groupItemsBySource();
    }, [indentItems]);

    const fetchDatesWithIndents = async () => {
        try {
            const { data, error } = await supabase
                .from('indent_requests')
                .select('created_at')
                .eq('status', 'Approved')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Extract unique dates
            const uniqueDates = [...new Set(
                data.map(item => dayjs(item.created_at).format('YYYY-MM-DD'))
            )];

            setDatesWithIndents(uniqueDates);
        } catch (error) {
            console.error('Error fetching dates:', error);
            message.error('Failed to load indent dates');
        }
    };

    const fetchIndentItems = async () => {
        try {
            setLoading(true);
            const startOfDay = selectedDate.startOf('day').toISOString();
            const endOfDay = selectedDate.endOf('day').toISOString();

            const { data, error } = await supabase
                .from('indent_requests')
                .select(`
          *,
          inventory_items (*)
        `)
                .eq('status', 'Approved')
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setIndentItems(data || []);
        } catch (error) {
            console.error('Error fetching indent items:', error);
            message.error('Failed to load indent items');
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

        indentItems.forEach(item => {
            const source = item.inventory_items?.indent_source || 'OPD';
            if (!grouped[source]) {
                grouped[source] = [];
            }
            grouped[source].push(item);
        });

        setGroupedItems(grouped);
    };

    const dateFullCellRender = (value) => {
        const dateStr = value.format('YYYY-MM-DD');
        const hasIndent = datesWithIndents.includes(dateStr);

        if (hasIndent) {
            return (
                <div className="ant-picker-cell-inner">
                    <Badge dot color="#1890ff">
                        {value.date()}
                    </Badge>
                </div>
            );
        }

        return (
            <div className="ant-picker-cell-inner">
                {value.date()}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    const totalItems = indentItems.length;

    return (
        <div className="indent-list-page">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div>
                    <Title level={3} style={{ margin: 0 }}>Previous Indents</Title>
                    <Text type="secondary">
                        View historical indent records by date
                    </Text>
                </div>

                {/* Date Selector */}
                <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Select Date:
                    </Text>
                    <DatePicker
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date || dayjs())}
                        format="DD/MM/YYYY"
                        size="large"
                        cellRender={dateFullCellRender}
                        style={{ width: '100%', maxWidth: 300 }}
                    />
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <Badge dot color="#1890ff" /> Dates with indent records
                        </Text>
                    </div>
                </div>

                {/* Results Count */}
                <Text type="secondary">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} on {selectedDate.format('DD/MM/YYYY')}
                </Text>

                {/* Empty State */}
                {totalItems === 0 && (
                    <Empty description="No indent records for this date" />
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
                                            <List.Item
                                                style={{ flexWrap: 'wrap' }}
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <Space>
                                                            <Text strong>{item.inventory_items?.name}</Text>
                                                        </Space>
                                                    }
                                                    description={
                                                        <Space direction="vertical" size="small">
                                                            <Space wrap>
                                                                <Tag color={getTypeColor(item.inventory_items?.type)}>
                                                                    {item.inventory_items?.type}
                                                                </Tag>
                                                                <Space size="small">
                                                                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                                                    <Text type="secondary">{item.inventory_items?.location_code}</Text>
                                                                </Space>
                                                            </Space>
                                                            <Text>Quantity: <Text strong>{item.requested_qty}</Text></Text>
                                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                                Requested: {dayjs(item.created_at).format('DD/MM/YYYY HH:mm')}
                                                            </Text>
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

            {/* Responsive Styles */}
            <style>{`
                /* Mobile: responsive adjustments */
                @media (max-width: 768px) {
                    .ant-collapse-header {
                        padding: 12px !important;
                    }
                    
                    .ant-space-horizontal {
                        gap: 8px !important;
                    }
                    
                    .ant-list-item {
                        padding: 12px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .indent-list-page .ant-typography h3 {
                        font-size: 18px !important;
                    }
                    
                    .ant-tag {
                        font-size: 11px !important;
                        padding: 0 4px !important;
                    }
                }

                /* Date picker badge styling */
                .ant-picker-cell-inner .ant-badge {
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default IndentListPage;
