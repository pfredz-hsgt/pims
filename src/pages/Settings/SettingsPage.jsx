import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import { DatabaseOutlined, CloudUploadOutlined } from '@ant-design/icons';
import InventoryTable from './InventoryTable';
import ImageUploader from './ImageUploader';

const { Title, Text } = Typography;

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('inventory');

    const items = [
        {
            key: 'inventory',
            label: (
                <span>
                    <DatabaseOutlined />
                    Inventory Management
                </span>
            ),
            children: <InventoryTable />,
        },
        {
            key: 'images',
            label: (
                <span>
                    <CloudUploadOutlined />
                    Image Upload
                </span>
            ),
            children: <ImageUploader />,
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>Settings</Title>
                <Text type="secondary">
                    Manage inventory items and upload drug images
                </Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
            />
        </div>
    );
};

export default SettingsPage;
