import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import LocatorPage from './pages/Locator/LocatorPage';
import IndentPage from './pages/Indent/IndentPage';
import ShortExpPage from './pages/Shortexp/ShortExpPage';
import CartPage from './pages/Cart/CartPage';
import SettingsPage from './pages/Settings/SettingsPage';
import FloorPlanApp from './pages/Floorplan/FloorPlanApp';

function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 6,
                },
                algorithm: theme.defaultAlgorithm,
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/locator" replace />} />
                        <Route path="locator" element={<LocatorPage />} />
                        <Route path="floorplan" element={<FloorPlanApp />} />
                        <Route path="indent" element={<IndentPage />} />
                        <Route path="shortexp" element={<ShortExpPage />} />
                        <Route path="cart" element={<CartPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
