import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Row,
    Col,
    Skeleton,
    Empty,
    Space,
    Button,
    Typography,
    message,
    Pagination,
} from 'antd';
import { supabase } from '../../lib/supabase';
import DrugCard from '../../components/DrugCard';
import IndentModal from './IndentModal';

const { Title, Text } = Typography;

const IndentPage = () => {
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState('ALL');
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [sections, setSections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(24);

    useEffect(() => {
        fetchDrugs();
        setupRealtimeSubscription();
    }, []);

    // Reset to first page when section changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSection]);

    const fetchDrugs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('section', { ascending: true })
                .order('row', { ascending: true })
                .order('bin', { ascending: true });

            if (error) throw error;

            setDrugs(data || []);

            // Extract unique sections
            const uniqueSections = [...new Set(data.map(d => d.section))].sort();
            setSections(uniqueSections);
        } catch (error) {
            console.error('Error fetching drugs:', error);
            message.error('Failed to load inventory items');
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        const subscription = supabase
            .channel('inventory_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory_items',
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchDrugs(); // Refresh data on any change
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    // Memoize filtered drugs to prevent unnecessary recalculations
    const filteredDrugs = useMemo(() => {
        if (selectedSection === 'ALL') {
            return drugs;
        }
        return drugs.filter(drug => drug.section === selectedSection);
    }, [selectedSection, drugs]);

    // Memoize paginated drugs
    const paginatedDrugs = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredDrugs.slice(startIndex, endIndex);
    }, [filteredDrugs, currentPage, pageSize]);

    // Use useCallback to prevent unnecessary re-renders
    const handleDrugClick = useCallback((drug) => {
        setSelectedDrug(drug);
        setModalVisible(true);
    }, []);

    const handlePageChange = useCallback((page, newPageSize) => {
        setCurrentPage(page);
        if (newPageSize !== pageSize) {
            setPageSize(newPageSize);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pageSize]);

    const handleIndentSuccess = useCallback(() => {
        setModalVisible(false);
        message.success('Item added to cart successfully!');
    }, []);

    return (
        <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div>
                    <Title level={3}>Indent Management</Title>
                    <Text type="secondary">
                        Select items to add to your indent cart
                    </Text>
                </div>

                {/* Section Filter */}
                <Space wrap>
                    <Button
                        type={selectedSection === 'ALL' ? 'primary' : 'default'}
                        onClick={() => setSelectedSection('ALL')}
                    >
                        All Sections
                    </Button>
                    {sections.map(section => (
                        <Button
                            key={section}
                            type={selectedSection === section ? 'primary' : 'default'}
                            onClick={() => setSelectedSection(section)}
                        >
                            Section {section}
                        </Button>
                    ))}
                </Space>

                {/* Results Count */}
                {!loading && (
                    <Text type="secondary">
                        {filteredDrugs.length} {filteredDrugs.length === 1 ? 'item' : 'items'}
                        {selectedSection !== 'ALL' && ` in Section ${selectedSection}`}
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
                    <Empty description="No drugs in this section" />
                )}

                {/* Drug Grid */}
                {!loading && filteredDrugs.length > 0 && (
                    <>
                        <Row gutter={[16, 16]}>
                            {paginatedDrugs.map((drug) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={drug.id}>
                                    <DrugCard drug={drug} onClick={() => handleDrugClick(drug)} />
                                </Col>
                            ))}
                        </Row>
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                current={currentPage}
                                total={filteredDrugs.length}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageChange}
                                showSizeChanger
                                showTotal={(total) => `Total ${total} items`}
                                pageSizeOptions={['12', '24', '48', '96']}
                            />
                        </div>
                    </>
                )}
            </Space>

            {/* Indent Modal */}
            <IndentModal
                drug={selectedDrug}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleIndentSuccess}
            />
        </div>
    );
};

export default IndentPage;
