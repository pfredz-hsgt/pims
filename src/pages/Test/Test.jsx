import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Table, Modal, Tooltip, Tag, Space, Card, Select, Button, Form, Input, message } from 'antd';
import { WarningOutlined, EditOutlined } from '@ant-design/icons';
import BinL from './BinL';
import BinM from './BinM';
import BinS from './BinS';
import './DynamicCabinet.css';

const templates = {
  M15S8: {
    id: 'M15S8',
    name: 'Template M15S8',
    getColumns: () => {
      const mBins = Array.from({ length: 15 }, (_, i) => `M${i + 1}`);
      const sBins = Array.from({ length: 8 }, (_, i) => `S${i + 1}`);
      return [
        { type: 'M', items: [mBins[0], mBins[5], mBins[10]], width: 14 },
        { type: 'M', items: [mBins[1], mBins[6], mBins[11]], width: 14 },
        { type: 'M', items: [mBins[2], mBins[7], mBins[12]], width: 14 },
        { type: 'M', items: [mBins[3], mBins[8], mBins[13]], width: 14 },
        { type: 'M', items: [mBins[4], mBins[9], mBins[14]], width: 14 },
        { type: 'S', items: [sBins[0], sBins[2], sBins[4], sBins[6]], width: 9 },
        { type: 'S', items: [sBins[1], sBins[3], sBins[5], sBins[7]], width: 9 }
      ];
    }
  },
  L8S4: {
    id: 'L8S4',
    name: 'Template L8S4',
    getColumns: () => {
      const lBins = Array.from({ length: 8 }, (_, i) => `L${i + 1}`);
      const sBins = Array.from({ length: 4 }, (_, i) => `S${i + 1}`);
      return [
        { type: 'L', items: [lBins[0], lBins[4]], width: 23.1 },
        { type: 'L', items: [lBins[1], lBins[5]], width: 23.1 },
        { type: 'L', items: [lBins[2], lBins[6]], width: 23.1 },
        { type: 'L', items: [lBins[3], lBins[7]], width: 23.1 },
        { type: 'S', items: [sBins[0], sBins[1], sBins[2], sBins[3]], width: 9 }
      ];
    }
  },
  L8: {
    id: 'L8',
    name: 'Template L8',
    getColumns: () => {
      const lBins = Array.from({ length: 8 }, (_, i) => `L${i + 1}`);
      return [
        { type: 'L', items: [lBins[0], lBins[4]], width: 1 },
        { type: 'L', items: [lBins[1], lBins[5]], width: 1 },
        { type: 'L', items: [lBins[2], lBins[6]], width: 1 },
        { type: 'L', items: [lBins[3], lBins[7]], width: 1 }
      ];
    }
  },
  M9: {
    id: 'M9',
    name: 'Template M9',
    getColumns: () => {
      const mBins = Array.from({ length: 9 }, (_, i) => `M${i + 1}`);
      return [
        { type: 'M', items: [mBins[0], mBins[3], mBins[6]], width: 1 },
        { type: 'M', items: [mBins[1], mBins[4], mBins[7]], width: 1 },
        { type: 'M', items: [mBins[2], mBins[5], mBins[8]], width: 1 }
      ];
    }
  },
  M18: {
    id: 'M18',
    name: 'Template M18',
    getColumns: () => {
      const mBins = Array.from({ length: 18 }, (_, i) => `M${i + 1}`);
      return [
        { type: 'M', items: [mBins[0], mBins[6], mBins[12]], width: 1 },
        { type: 'M', items: [mBins[1], mBins[7], mBins[13]], width: 1 },
        { type: 'M', items: [mBins[2], mBins[8], mBins[14]], width: 1 },
        { type: 'M', items: [mBins[3], mBins[9], mBins[15]], width: 1 },
        { type: 'M', items: [mBins[4], mBins[10], mBins[16]], width: 1 },
        { type: 'M', items: [mBins[5], mBins[11], mBins[17]], width: 1 }
      ];
    }
  },
  S36: {
    id: 'S36',
    name: 'Template S36',
    getColumns: () => {
      const sBins = Array.from({ length: 36 }, (_, i) => `S${i + 1}`);
      return [
        { type: 'S', items: [sBins[0], sBins[9], sBins[18], sBins[27]], width: 1 },
        { type: 'S', items: [sBins[1], sBins[10], sBins[19], sBins[28]], width: 1 },
        { type: 'S', items: [sBins[2], sBins[11], sBins[20], sBins[29]], width: 1 },
        { type: 'S', items: [sBins[3], sBins[12], sBins[21], sBins[30]], width: 1 },
        { type: 'S', items: [sBins[4], sBins[13], sBins[22], sBins[31]], width: 1 },
        { type: 'S', items: [sBins[5], sBins[14], sBins[23], sBins[32]], width: 1 },
        { type: 'S', items: [sBins[6], sBins[15], sBins[24], sBins[33]], width: 1 },
        { type: 'S', items: [sBins[7], sBins[16], sBins[25], sBins[34]], width: 1 },
        { type: 'S', items: [sBins[8], sBins[17], sBins[26], sBins[35]], width: 1 }
      ];
    }
  }
};

const DynamicCabinet = () => {
  const [activeTemplate, setActiveTemplate] = useState('M15S8');
  const [selectedBin, setSelectedBin] = useState('null');

  const [mappedShelves, setMappedShelves] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState('');

  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [shelfItems, setShelfItems] = useState([]);
  const [occupiedBins, setOccupiedBins] = useState({});

  const [isBinModalVisible, setIsBinModalVisible] = useState(false);
  const [clickedBinId, setClickedBinId] = useState(null);

  const [editingItem, setEditingItem] = useState(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    const fetchMappedShelves = async () => {
      const { data, error } = await supabase
        .from('shelf_templates')
        .select('*')
        .order('section')
        .order('row');

      if (!error && data) {
        setMappedShelves(data);
        if (data.length > 0) {
          const firstShelf = data[0];
          setSelectedSection(firstShelf.section);
          setSelectedRow(firstShelf.row);
        }
      }
    };
    fetchMappedShelves();
  }, []);

  useEffect(() => {
    if (selectedSection && selectedRow) {
      const shelf = mappedShelves.find(s => s.section === selectedSection && s.row === selectedRow);
      if (shelf) {
        setSelectedShelf(shelf.id);
        if (templates[shelf.template_id]) {
          setActiveTemplate(shelf.template_id);
        }
      } else {
        setSelectedShelf('manual');
      }
    } else {
      setSelectedShelf('');
    }
  }, [selectedSection, selectedRow, mappedShelves]);

  useEffect(() => {
    const fetchShelfData = async () => {
      if (!selectedShelf || selectedShelf === 'manual') {
        setShelfItems([]);
        setOccupiedBins({});
        return;
      }

      const shelf = mappedShelves.find(s => s.id === selectedShelf);
      if (!shelf) return;

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('section', shelf.section)
        .eq('row', shelf.row);

      if (!error && data) {
        // Sort data by bin character then number
        const sortedData = data.sort((a, b) => {
          const aMatch = a.bin.match(/([A-Z]+)(\d+)/);
          const bMatch = b.bin.match(/([A-Z]+)(\d+)/);
          if (aMatch && bMatch) {
            if (aMatch[1] === bMatch[1]) {
              return parseInt(aMatch[2], 10) - parseInt(bMatch[2], 10);
            }
            return aMatch[1].localeCompare(bMatch[1]);
          }
          return a.bin.localeCompare(b.bin);
        });

        setShelfItems(sortedData);

        // Optimize occupancy check (O(N) mapping)
        const occ = {};
        data.forEach(item => {
          if (!occ[item.bin]) {
            occ[item.bin] = [];
          }
          occ[item.bin].push(item);
        });
        setOccupiedBins(occ);
      }
    };
    fetchShelfData();
  }, [selectedShelf, mappedShelves]);

  const uniqueSections = [...new Set(mappedShelves.map(s => s.section))].sort();
  const availableRows = mappedShelves
    .filter(s => s.section === selectedSection)
    .map(s => s.row)
    .sort((a, b) => a - b);

  const handleTemplateChange = (val) => {
    setSelectedSection(null);
    setSelectedRow(null);
    setSelectedShelf('manual');
    setActiveTemplate(val);
    setSelectedBin('null');
  };

  const handleBinClick = (binId) => {
    setSelectedBin(binId);
    setClickedBinId(binId);
    setIsBinModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      section: item.section,
      row: item.row,
      bin: item.bin
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          section: values.section,
          row: values.row,
          bin: values.bin
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      message.success('Item location updated!');
      setEditingItem(null);
      
      // Trigger a re-fetch by temporarily resetting
      const currentShelf = selectedShelf;
      setSelectedShelf('');
      setTimeout(() => setSelectedShelf(currentShelf), 50);
    } catch (err) {
      message.error('Failed to update item location');
    }
  };

  const currentColumns = templates[activeTemplate]?.getColumns() || [];

  // Identify all valid bins in current template
  const validTemplateBins = new Set();
  currentColumns.forEach(col => {
    col.items.forEach(bin => validTemplateBins.add(bin));
  });

  const tableColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const isBinMissing = !validTemplateBins.has(record.bin);
        return (
          <Space>
            {text}
            {isBinMissing && (
              <Tooltip title={`Bin ${record.bin} does not exist in the current layout template!`}>
                <WarningOutlined style={{ color: '#faad14' }} />
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Bin',
      dataIndex: 'bin',
      key: 'bin',
      render: bin => <Tag color="blue">{bin}</Tag>
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Space>
            <span style={{ fontWeight: 500 }}>Rak (Section):</span>
            <Select
              value={selectedSection}
              onChange={(val) => {
                setSelectedSection(val);
                setSelectedRow(null);
                setSelectedBin('null');
              }}
              style={{ width: 120 }}
              placeholder="Select Rak"
            >
              {uniqueSections.map(sec => (
                <Select.Option key={sec} value={sec}>{sec}</Select.Option>
              ))}
            </Select>
          </Space>

          <Space>
            <span style={{ fontWeight: 500 }}>Tingkat (Row):</span>
            <Select
              value={selectedRow}
              onChange={(val) => {
                setSelectedRow(val);
                setSelectedBin('null');
              }}
              style={{ width: 120 }}
              placeholder="Select Tingkat"
              disabled={!selectedSection}
            >
              {availableRows.map(r => (
                <Select.Option key={r} value={r}>{r}</Select.Option>
              ))}
            </Select>
          </Space>

          <div style={{ borderLeft: '1px solid #d9d9d9', height: '30px', margin: '0 10px' }} />

          <Space>
            <span style={{ fontWeight: 500 }}>Or Force Template:</span>
            <Select
              value={activeTemplate}
              onChange={handleTemplateChange}
              style={{ width: 150 }}
            >
              {Object.values(templates).map(t => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Space>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Cabinet Layout */}
        <Card style={{ flex: 2, minWidth: '600px' }} title="Shelf Visualizer" bodyStyle={{ padding: 16 }}>
          {(!selectedSection || !selectedRow) && selectedShelf !== 'manual' ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <h3 style={{ color: '#666', marginTop: 0 }}>Please select a Rak and Tingkat</h3>
              <p style={{ marginBottom: 0 }}>Choose a location from the dropdowns above to visualize the shelf, or use "Force Template" to preview layouts.</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'stretch'
            }}>
              {currentColumns.map((col, colIndex) => (
              <div
                key={colIndex}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flex: col.width,
                }}
              >
                {col.items.map((binId) => {
                  const itemsInBin = occupiedBins[binId] || [];
                  const isOccupied = itemsInBin.length > 0;
                  const binClass = isOccupied ? 'occupied-bin' : 'empty-bin';
                  const targetClass = selectedBin === binId ? 'target-bin' : '';

                  const tooltipTitle = isOccupied
                    ? itemsInBin.map(i => i.name).join(', ')
                    : 'Empty Bin';

                  return (
                    <Tooltip key={binId} title={tooltipTitle} placement="top">
                      <div
                        className={`bin-wrapper ${targetClass} ${binClass}`}
                        style={{
                          position: 'relative',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          flex: 1,
                          cursor: 'pointer'
                        }}
                      >
                        {col.type === 'L' && (
                          <BinL id={binId} isTarget={selectedBin === binId} onClick={handleBinClick} />
                        )}
                        {col.type === 'M' && (
                          <BinM id={binId} isTarget={selectedBin === binId} onClick={handleBinClick} />
                        )}
                        {col.type === 'S' && (
                          <BinS id={binId} isTarget={selectedBin === binId} onClick={handleBinClick} />
                        )}
                        <span style={{
                          position: 'absolute',
                          bottom: '10%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          color: '#333',
                          fontSize: '0.8rem',
                          fontFamily: 'sans-serif',
                          pointerEvents: 'none',
                          fontWeight: 'bold'
                        }}>
                          {binId}
                        </span>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
          )}
        </Card>

        {/* Data Table Layout */}
        {selectedShelf !== 'manual' && selectedShelf !== '' && (
          <Card style={{ flex: 1, overflowX: 'auto' }} title={`Items in Rak ${mappedShelves.find(s => s.id === selectedShelf)?.section}, Tingkat ${mappedShelves.find(s => s.id === selectedShelf)?.row}`} bodyStyle={{ padding: 16 }}>
            <Table
              dataSource={shelfItems}
              columns={tableColumns}
              rowKey="id"
              pagination={{ pageSize: 50 }}
              size="small"
              onRow={(record) => ({
                onClick: () => {
                  setSelectedBin(record.bin);
                },
                style: { cursor: 'pointer', backgroundColor: selectedBin === record.bin ? '#e6f7ff' : 'transparent' }
              })}
            />
          </Card>
        )}
      </div>

      <Modal
        title={`Bin ${clickedBinId} Details`}
        open={isBinModalVisible}
        onCancel={() => {
          setIsBinModalVisible(false);
          setEditingItem(null);
        }}
        footer={null}
      >
        {(() => {
          const itemsInBin = occupiedBins[clickedBinId];
          if (itemsInBin && itemsInBin.length > 0) {
            return (
              <div style={{ marginTop: 16 }}>
                {itemsInBin.map(item => (
                  <Card key={item.id} size="small" style={{ marginBottom: 8, background: '#fafafa' }}>
                    {editingItem && editingItem.id === item.id ? (
                      <Form form={editForm} layout="inline" onFinish={handleEditSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                          <strong style={{ fontSize: '15px', marginBottom: '8px' }}>Editing: {item.name}</strong>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Form.Item name="section" style={{ margin: 0, flex: 1 }} rules={[{ required: true }]}>
                              <Input placeholder="Rak" />
                            </Form.Item>
                            <Form.Item name="row" style={{ margin: 0, flex: 1 }} rules={[{ required: true }]}>
                              <Input placeholder="Tingkat" />
                            </Form.Item>
                            <Form.Item name="bin" style={{ margin: 0, flex: 1 }} rules={[{ required: true }]}>
                              <Input placeholder="Bin" />
                            </Form.Item>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                            <Button onClick={() => setEditingItem(null)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Save Location</Button>
                          </div>
                        </div>
                      </Form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '15px' }}>{item.name}</strong><br />
                          <span style={{ color: '#666' }}>Location: {item.location_code}</span>
                        </div>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => openEditModal(item)}>
                          Edit Location
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            );
          } else {
            return <p style={{ marginTop: 16, color: '#666' }}>This bin is currently empty. No items to manage.</p>;
          }
        })()}
      </Modal>
    </div>
  );
};

export default DynamicCabinet;
