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
    Input,
    Popconfirm,
} from 'antd';
import {
    DeleteOutlined,
    FilePdfOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { getTypeColor, getSourceColor } from '../../lib/colorMappings';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState({});
    const [editingItem, setEditingItem] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');

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
            if (!grouped[source]) {
                grouped[source] = [];
            }
            grouped[source].push(item);
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

            message.success('Indent cleared successfully!');
            fetchCartItems();
        } catch (error) {
            console.error('Error clearing indent:', error);
            message.error('Failed to clear indent');
        }
    };

    const handleExportToPDF = () => {
        try {
            let exportCount = 0;

            Object.entries(groupedItems).forEach(([source, items]) => {
                if (items.length === 0) return;

                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                let yPosition = 15;

                // Header - Form Reference
                doc.setFontSize(8);
                doc.setFont(undefined, 'italic');
                doc.text('Pekeliling Perbendaharaan Malaysia', 7, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text('AM 6.5 LAMPIRAN B', pageWidth / 2, yPosition, { align: 'center' });
                doc.text('KEW.PS-8', pageWidth - 7, yPosition, { align: 'right' });
                yPosition += 10;

                // Title
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                const title = `BORANG PERMOHONAN STOK UBAT (${source})`;
                doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
                yPosition += 5;

                // 1. Updated Table Data mapping (added 2 empty columns)
                const tableData = items.map((item, idx) => [
                    (idx + 1).toString(),
                    item.inventory_items?.name || '',
                    item.requested_qty || 0,
                    '', // Original Catatan (Empty for manual writing)
                    '', // Kuantiti Diluluskan (Empty for manual writing)
                    '', // New Catatan (Empty for manual writing)
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [[
                        { content: 'Bil', styles: { halign: 'center' } },
                        { content: 'Perihal stok', styles: { halign: 'center' } },
                        { content: 'Kuantiti', styles: { halign: 'center' } },
                        { content: 'Catatan', styles: { halign: 'center' } },
                        { content: 'Kuantiti Diluluskan', styles: { halign: 'center' } },
                        { content: 'Catatan', styles: { halign: 'center' } },
                    ]],
                    body: tableData,
                    theme: 'grid',
                    styles: {
                        fontSize: 10, // Slightly smaller font to accommodate more columns
                        cellPadding: 3,
                    },
                    headStyles: {
                        fillColor: [255, 255, 255],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold',
                        lineWidth: 0.2,
                        lineColor: [0, 0, 0],
                    },
                    bodyStyles: {
                        lineWidth: 0.2,
                        lineColor: [0, 0, 0],
                        minCellHeight: 9, // Added height for manual writing room
                    },
                    // 2. Adjusted widths: First 4 cols ~65%, Last 2 cols ~35%
                    columnStyles: {
                        0: { cellWidth: 11, halign: 'center' }, // Bil
                        1: { cellWidth: 78 },                  // Perihal
                        2: { cellWidth: 29, halign: 'center' }, // Kuantiti
                        3: { cellWidth: 25 },                  // Catatan (Req)
                        4: { cellWidth: 29, halign: 'center' }, // Kuantiti Diluluskan
                        5: { cellWidth: 25 },                  // Catatan (Appr)
                    },
                    margin: { bottom: 50, left: 7, right: 7 },

                    // 3. Hook to draw the Thick Border
                    didDrawCell: function (data) {
                        // Check if this is the 'Kuantiti Diluluskan' column (Index 4)
                        if (data.column.index === 4) {
                            doc.setLineWidth(0.8); // Set thick line
                            doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                            doc.setLineWidth(0.2); // Reset to default
                        }
                    },

                });

                // Signatures (Moved outside autoTable to show only on last page)
                const finalY = pageHeight - 50;
                doc.setFontSize(9);
                doc.setFont(undefined, 'normal');

                const leftX = 15;
                doc.text('Pemohon', leftX, finalY);
                doc.text('(Tandatangan)', leftX, finalY + 15);
                doc.text('Nama : Muhd Redzuan', leftX, finalY + 20);
                doc.text('Jawatan : Pegawai Farmasi UF48', leftX, finalY + 25);
                doc.text('Tarikh :', leftX, finalY + 30);

                const middleX = pageWidth / 2 - 20;
                doc.text('Pegawai Pelulus', middleX, finalY);
                doc.text('(Tandatangan)', middleX, finalY + 15);
                doc.text('Nama :', middleX, finalY + 20);
                doc.text('Jawatan :', middleX, finalY + 25);
                doc.text('Tarikh :', middleX, finalY + 30);

                const rightX = pageWidth - 60;
                doc.text('Penerima', rightX, finalY);
                doc.text('(Tandatangan)', rightX, finalY + 15);
                doc.text('Nama :  ', rightX, finalY + 20);
                doc.text('Jawatan :  ', rightX, finalY + 25);
                doc.text('Tarikh :', rightX, finalY + 30);

                // Save individual file per source
                const timestamp = new Date().toISOString().split('T')[0];
                doc.save(`Indent_ED_${source}_${timestamp}.pdf`);
                exportCount++;
            });

            if (exportCount > 0) {
                message.success(`Successfully exported ${exportCount} PDF file(s)!`);
            } else {
                message.warning('No items to export.');
            }
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            message.error('Failed to export to PDF');
        }
    };

    const handleExportToExcel = () => {
        try {
            // Create workbook
            const wb = XLSX.utils.book_new();

            // Prepare data for each source
            Object.entries(groupedItems).forEach(([source, items]) => {
                if (items.length === 0) return;

                // Create worksheet data
                const wsData = [
                    // Header row
                    ['Drug Name', 'Quantity'],
                    // Data rows
                    ...items.map(item => [
                        item.inventory_items?.name || '',
                        item.requested_qty || 0,
                    ])
                ];

                // Create worksheet
                const ws = XLSX.utils.aoa_to_sheet(wsData);

                // Set column widths
                ws['!cols'] = [
                    { wch: 30 }, // Drug Name
                    { wch: 15 }, // Quantity
                ];

                // Add worksheet to workbook
                XLSX.utils.book_append_sheet(wb, ws, source);
            });

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Indent_Cart_${timestamp}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);
            message.success('Excel file exported successfully!');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            message.error('Failed to export to Excel');
        }
    };

    const renderItemActions = (item) => [
        <Popconfirm
            key="delete"
            title="Remove this item from cart?"
            onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(item.id);
            }}
            okText="Yes"
            cancelText="No"
            onCancel={(e) => e?.stopPropagation()}
        >
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
            />
        </Popconfirm>,
    ];

    const renderMobileActions = (item) => (
        <Popconfirm
            title="Remove?"
            onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(item.id);
            }}
            okText="Yes"
            cancelText="No"
            onCancel={(e) => e?.stopPropagation()}
        >
            <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
            />
        </Popconfirm>
    );

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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Indent Cart</Title>
                        <Text type="secondary">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
                        </Text>
                    </div>
                    <Space wrap>
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={handleExportToExcel}
                            disabled={totalItems === 0}
                            style={{
                                backgroundColor: totalItems === 0 ? undefined : '#217346',
                                borderColor: '#217346',
                                color: totalItems === 0 ? undefined : '#fff'
                            }}
                        >
                            <span className="button-text">Export to Excel</span>
                        </Button>
                        <Button
                            icon={<FilePdfOutlined />}
                            onClick={handleExportToPDF}
                            disabled={totalItems === 0}
                            style={{
                                backgroundColor: totalItems === 0 ? undefined : '#DC3545',
                                borderColor: '#DC3545',
                                color: totalItems === 0 ? undefined : '#fff'
                            }}
                        >
                            <span className="button-text">Export to PDF</span>
                        </Button>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleApproveIndent}
                            disabled={totalItems === 0}
                        >
                            <span className="button-text">Clear All</span>
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
                                            <List.Item
                                                actions={window.innerWidth > 768 ? renderItemActions(item) : undefined}
                                                style={{ flexWrap: 'wrap', cursor: 'pointer' }}
                                                onClick={() => handleEdit(item)}
                                            >
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
                                                        </Space>
                                                    }
                                                />
                                                {/* Mobile actions */}
                                                <div className="mobile-actions">
                                                    {renderMobileActions(item)}
                                                </div>
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
                centered
                onCancel={() => setEditingItem(null)}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>Update quantity for: <Text strong>{editingItem?.inventory_items?.name}</Text></Text>
                    <Input
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        style={{ width: '100%' }}
                        placeholder="e.g., 10, 5x30's, 2 boxes"
                    />
                </Space>
            </Modal>

            {/* Responsive Styles */}
            <style>{`
                /* Excel button styling */
                .ant-btn:has(.anticon-file-excel) {
                    transition: all 0.3s ease;
                }
                
                .ant-btn:has(.anticon-file-excel):hover:not(:disabled) {
                    background-color: #1a5c37 !important;
                    border-color: #1a5c37 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(33, 115, 70, 0.3);
                }
                
                /* PDF button styling */
                .ant-btn:has(.anticon-file-pdf) {
                    transition: all 0.3s ease;
                }
                
                .ant-btn:has(.anticon-file-pdf):hover:not(:disabled) {
                    background-color: #c82333 !important;
                    border-color: #c82333 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
                }
                
                /* Desktop: show desktop actions, hide mobile actions */
                @media (min-width: 769px) {
                    .mobile-actions {
                        display: none;
                    }
                }
                
                /* Mobile: hide desktop actions, show mobile actions */
                @media (max-width: 768px) {
                    .button-text {
                        display: none;
                    }
                    
                    .action-text {
                        display: none;
                    }
                    
                    .ant-list-item-action {
                        display: none !important;
                    }
                    
                    .mobile-actions {
                        display: block;
                        width: 100%;
                        margin-top: 12px;
                        padding-top: 12px;
                        border-top: 1px solid #f0f0f0;
                    }
                    
                    .ant-list-item {
                        padding: 12px !important;
                        flex-direction: column;
                        align-items: flex-start !important;
                    }
                    
                    .ant-list-item-meta {
                        width: 100%;
                    }
                    
                    .ant-collapse-header {
                        padding: 12px !important;
                    }
                    
                    .ant-space-horizontal {
                        gap: 8px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .cart-page .ant-typography h3 {
                        font-size: 18px !important;
                    }
                    
                    .ant-btn {
                        padding: 4px 8px !important;
                    }
                    
                    .ant-tag {
                        font-size: 11px !important;
                        padding: 0 4px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CartPage;
