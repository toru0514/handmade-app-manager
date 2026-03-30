"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Fab,
  Container,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLinks } from "@/hooks/useLinks";
import LinkCard from "./LinkCard";
import AddLinkDialog from "./AddLinkDialog";

export default function LinkList() {
  const router = useRouter();
  const { links, isLoaded, error, addLink, updateLink, deleteLink } = useLinks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleAdd = async (title: string, url: string, description?: string) => {
    await addLink(title, url, description);
    setSnackbar("リンクを追加しました");
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteLink(deleteTarget);
      setDeleteTarget(null);
      setSnackbar("リンクを削除しました");
    }
  };

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            App Manager
          </Typography>
          <Button
            color="inherit"
            component={Link}
            href="/sales"
            startIcon={<BarChartIcon />}
          >
            売上集計
          </Button>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
          >
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          アプリやツールのリンクを一元管理できます
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {links.length === 0 && !error ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            リンクがまだありません。右下の「+」ボタンから追加してください。
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onUpdate={updateLink}
                onDelete={handleDelete}
              />
            ))}
          </Box>
        )}
      </Container>

      <Fab
        color="primary"
        aria-label="リンクを追加"
        onClick={() => setDialogOpen(true)}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>

      <AddLinkDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>リンクの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このリンクを削除しますか？この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            キャンセル
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
