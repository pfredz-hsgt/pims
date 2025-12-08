import React, { useState, useEffect } from 'react';
import {
    Input,
    Row,
    Col,
    Skeleton,
    Empty,
    Space,
    Button,
    List,
    Typography,
    Tag,
    message,
} from 'antd';
import {
    SearchOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { getTypeColor, getSourceColor } from '../../lib/colorMappings';
import DrugCard from '../../components/DrugCard';
import DrugDetailModal from './DrugDetailModal';

const { Title, Text } = Typography;

const LocatorPage = () => {
    const [drugs, setDrugs] = useState([]);
    const [filteredDrugs, setFilteredDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchDrugs();
    }, []);

    useEffect(() => {
        filterDrugs();
    }, [searchQuery, drugs]);

    const fetchDrugs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setDrugs(data || []);
            setFilteredDrugs(data || []);
        } catch (error) {
            console.error('Error fetching drugs:', error);
            message.error('Failed to load inventory items');
        } finally {
            setLoading(false);
        }
    };

    const filterDrugs = () => {
        if (!searchQuery.trim()) {
            setFilteredDrugs(drugs);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = drugs.filter(
            (drug) =>
                drug.name.toLowerCase().includes(query) ||
                drug.type?.toLowerCase().includes(query) ||
                drug.location_code?.toLowerCase().includes(query) ||
                drug.remarks?.toLowerCase().includes(query)
        );
        setFilteredDrugs(filtered);
    };

    const handleDrugClick = (drug) => {
        setSelectedDrug(drug);
        setModalVisible(true);
    };

    return (
        <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div>
                    <Title level={3}>Drug Locator</Title>
                    <Text type="secondary">
                        Search and locate drugs in the pharmacy inventory
                    </Text>
                </div>

                {/* Search and View Toggle */}
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Input
                        placeholder="Search by name, type, location, or remarks..."
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 400, maxWidth: '100%' }}
                        allowClear
                    />
                    <Space>
                        <Button
                            type={viewMode === 'grid' ? 'primary' : 'default'}
                            icon={<AppstoreOutlined />}
                            onClick={() => setViewMode('grid')}
                        >
                            Grid
                        </Button>
                        <Button
                            type={viewMode === 'list' ? 'primary' : 'default'}
                            icon={<UnorderedListOutlined />}
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </Button>
                    </Space>
                </Space>

                {/* Results Count */}
                {!loading && (
                    <Text type="secondary">
                        {filteredDrugs.length} {filteredDrugs.length === 1 ? 'item' : 'items'} found
                    </Text>
                )}

                {/* Loading State */}
                {loading && (
                    <Row gutter={[16, 16]}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                <Skeleton active />
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Empty State */}
                {!loading && filteredDrugs.length === 0 && (
                    <Empty
                        description={
                            searchQuery
                                ? 'No drugs found matching your search'
                                : 'No drugs in inventory'
                        }
                    />
                )}

                {/* Grid View */}
                {!loading && filteredDrugs.length > 0 && viewMode === 'grid' && (
                    <Row gutter={[16, 16]}>
                        {filteredDrugs.map((drug) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={drug.id}>
                                <DrugCard drug={drug} onClick={() => handleDrugClick(drug)} />
                            </Col>
                        ))}
                    </Row>
                )}

                {/* List View */}
                {!loading && filteredDrugs.length > 0 && viewMode === 'list' && (
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 2,
                            xl: 3,
                            xxl: 3,
                        }}
                        dataSource={filteredDrugs}
                        renderItem={(drug) => (
                            <List.Item style={{ marginBottom: 0 }}>
                                <div
                                    style={{
                                        cursor: 'pointer',
                                        padding: '12px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    onClick={() => handleDrugClick(drug)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#1890ff';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#f0f0f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                                                {drug.name}
                                            </Text>
                                            <Space wrap size={[4, 4]} style={{ marginBottom: '8px' }}>
                                                <Tag color={getTypeColor(drug.type)} style={{ margin: 0, fontSize: '11px' }}>
                                                    {drug.type}
                                                </Tag>
                                                {drug.indent_source && (
                                                    <Tag color={getSourceColor(drug.indent_source)} style={{ margin: 0, fontSize: '11px' }}>
                                                        {drug.indent_source}
                                                    </Tag>
                                                )}
                                            </Space>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {drug.location_code}
                                                </Text>
                                            </div>
                                            {drug.remarks && (
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: '11px',
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    title={drug.remarks}
                                                >
                                                    {drug.remarks}
                                                </Text>
                                            )}
                                        </div>
                                        {drug.image_url && (
                                            <img
                                                width={60}
                                                height={60}
                                                alt={drug.name}
                                                src={drug.image_url}
                                                style={{
                                                    borderRadius: 4,
                                                    objectFit: 'cover',
                                                    flexShrink: 0
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </Space>

            {/* Drug Detail Modal */}
            <DrugDetailModal
                drug={selectedDrug}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </div>
    );
};

export default LocatorPage;
