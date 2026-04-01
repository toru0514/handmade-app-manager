"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const DRAWER_WIDTH_OPEN = 240;
const DRAWER_WIDTH_CLOSED = 64;

const navItems = [
  { label: "リンク管理", href: "/", icon: <DashboardIcon /> },
  { label: "売上集計", href: "/sales", icon: <BarChartIcon /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const drawerWidth = desktopOpen ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_CLOSED;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const drawerContent = (collapsed: boolean) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ justifyContent: collapsed ? "center" : "flex-start", px: collapsed ? 0 : 2 }}>
        {collapsed ? (
          <IconButton onClick={() => setDesktopOpen(true)} size="small">
            <MenuIcon />
          </IconButton>
        ) : (
          <>
            <DashboardIcon sx={{ mr: 1.5, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
              App Manager
            </Typography>
            <IconButton onClick={() => setDesktopOpen(false)} size="small">
              <ChevronLeftIcon />
            </IconButton>
          </>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <Tooltip title={collapsed ? item.label : ""} placement="right">
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  mx: collapsed ? 0.5 : 1,
                  borderRadius: 1,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1.5 : 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                    "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: "center" }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <Tooltip title={collapsed ? "ログアウト" : ""} placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                mx: collapsed ? 0.5 : 1,
                borderRadius: 1,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1.5 : 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: "center" }}>
                <LogoutIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="ログアウト" />}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{ zIndex: theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 1.5 }}
            >
              <MenuIcon />
            </IconButton>
            <DashboardIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              App Manager
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: "width 225ms" }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH_OPEN,
              },
            }}
          >
            {drawerContent(false)}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: "1px solid",
                borderColor: "divider",
                overflowX: "hidden",
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
            open
          >
            {drawerContent(!desktopOpen)}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: "width 225ms",
          ...(isMobile && { mt: "64px" }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
