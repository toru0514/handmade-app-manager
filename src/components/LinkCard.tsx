"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  TextField,
  Box,
  Tooltip,
  Link,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  OpenInNew as OpenInNewIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";
import { LinkItem } from "@/types/link";

interface LinkCardProps {
  link: LinkItem;
  onUpdate: (
    id: string,
    updates: Partial<Omit<LinkItem, "id" | "created_at">>
  ) => void;
  onDelete: (id: string) => void;
}

export default function LinkCard({ link, onUpdate, onDelete }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editDescription, setEditDescription] = useState(
    link.description || ""
  );

  const handleSave = () => {
    if (!editTitle.trim() || !editUrl.trim()) return;
    onUpdate(link.id, {
      title: editTitle.trim(),
      url: editUrl.trim(),
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditDescription(link.description || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card
        sx={{
          transition: "all 0.2s",
          border: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="タイトル"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="URL"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="説明（任意）"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
          <Tooltip title="キャンセル">
            <IconButton onClick={handleCancel} size="small">
              <CancelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="保存">
            <IconButton
              onClick={handleSave}
              size="small"
              color="primary"
              disabled={!editTitle.trim() || !editUrl.trim()}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        transition: "all 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <DragIndicatorIcon
            sx={{ color: "text.disabled", mt: 0.5, cursor: "grab" }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
              {link.title}
            </Typography>
            <Link
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.85rem",
                wordBreak: "break-all",
              }}
            >
              {link.url}
              <OpenInNewIcon sx={{ fontSize: "0.85rem" }} />
            </Link>
            {link.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {link.description}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", pt: 0, px: 2, pb: 1 }}>
        <Tooltip title="編集">
          <IconButton
            onClick={() => setIsEditing(true)}
            size="small"
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="削除">
          <IconButton
            onClick={() => onDelete(link.id)}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
