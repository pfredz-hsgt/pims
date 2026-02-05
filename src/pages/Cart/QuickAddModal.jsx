import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, List, Typography, Space, Tag, Empty, Spin, message } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import DebouncedSearchInput from '../../components/DebouncedSearchInput';
import IndentModal from '../Indent/IndentModal';
import { getTypeColor, getSourceColor } from '../../lib/colorMappings';

const { Text } = Typography;

const QuickAddModal = ({ visible, onClose, onSuccess }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [indentModalVisible, setIndentModalVisible] = useState(false);
    const searchInputRef = useRef(null);

    // useCallback ref to handle the actual API call stability
    const executeSearch = useCallback(async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .ilike('name', `%${query}%`)
                .order('name')
                .limit(20);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching drugs:', error);
            message.error('Failed to search drugs');
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to trigger search when visible opens if query exists
    useEffect(() => {
        if (!visible) {
            setSearchQuery('');
            setSearchResults([]);
        } else {
            // Autofocus when modal opens
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }
    }, [visible]);

    // Stable handler passed to DebouncedSearchInput
    const handleSearchInput = useCallback((val) => {
        setSearchQuery(val);
        executeSearch(val);
    }, [executeSearch]);

    const handleDrugClick = (drug) => {
        setSelectedDrug(drug);
        setIndentModalVisible(true);
    };

    const handleIndentSuccess = () => {
        setIndentModalVisible(false);
        if (onSuccess) onSuccess();
        message.success('Item added to cart');
        // Re-focus search input after adding item to allow consecutive adds
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 100);
    };

    return (
        <>
            <Modal
                title="Quick Add Item"
                open={visible}
                onCancel={onClose}
                footer={null}
                width={600}
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    <DebouncedSearchInput
                        ref={searchInputRef}
                        placeholder="Search for drugs..."
                        onSearch={handleSearchInput}
                        size="large"
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <List
                            dataSource={searchResults}
                            renderItem={(item) => (
                                <List.Item
                                    className="quick-add-item"
                                    onClick={() => handleDrugClick(item)}
                                    style={{ cursor: 'pointer', padding: '12px', transition: 'background-color 0.2s' }}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Text strong>{item.name}</Text>
                                                {item.type && <Tag color={getTypeColor(item.type)}>{item.type}</Tag>}
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Space size="small">
                                                    {item.indent_source && <Tag color={getSourceColor(item.indent_source)}>{item.indent_source}</Tag>}
                                                    <Space size={4}>
                                                        <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.location_code}</Text>
                                                    </Space>
                                                </Space>
                                                {item.remarks && <Text type="secondary" style={{ fontSize: '12px' }}>{item.remarks}</Text>}
                                            </Space>
                                        }
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Min: {item.min_qty || '-'}</Text>
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Max: {item.max_qty || '-'}</Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    ) : searchQuery ? (
                        <Empty description="No drugs found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                            Start typing to search...
                        </div>
                    )}
                </div>
            </Modal>

            <IndentModal
                drug={selectedDrug}
                visible={indentModalVisible}
                onClose={() => setIndentModalVisible(false)}
                onSuccess={handleIndentSuccess}
                width={500}
            />

            <style>{`
                .quick-add-item:hover {
                    background-color: #f5f5f5;
                }
            `}</style>
        </>
    );
};

export default QuickAddModal;
