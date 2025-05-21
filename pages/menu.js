import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { PiPizzaDuotone } from "react-icons/pi";
import { LuDessert } from "react-icons/lu";
import { LiaCocktailSolid } from "react-icons/lia";
import PizzaMenu from '../components/Pizzas/PizzaMenu';
import DessertMenu from '../components/Desserts/DessertMenu';
import RefreshmentMenu from '../components/Refreshments/RefreshmentMenu';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
};

const a11yProps = (index) => {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
};

const Menu = () => {
    const [value, setValue] = useState(0);

    const tabs = [
        {
            label: 'Pizzas',
            icon: <PiPizzaDuotone style={{ fontSize: '22px' }}/>,
            content: <PizzaMenu />,
        },
        {
            label: 'Desserts',
            icon: <LuDessert style={{ fontSize: '22px' }}/>,
            content: <DessertMenu />,
        },
        {
            label: 'Refreshments',
            icon: <LiaCocktailSolid style={{ fontSize: '25px' }}/>,
            content: <RefreshmentMenu />,
        },
    ];

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                bgcolor: 'background.paper',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '12%',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        right: 0,
                        width: '1px',
                        bgcolor: 'divider',
                    }}
                />
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            icon={tab.icon}
                            label={tab.label}
                            {...a11yProps(index)}
                        />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, padding: '20px' }}>
                {tabs.map((tab, index) => (
                    <TabPanel key={index} value={value} index={index}>
                        {tab.content}
                    </TabPanel>
                ))}
            </Box>
        </Box>
    );
};

export default Menu;