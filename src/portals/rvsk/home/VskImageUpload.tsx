import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  LinearProgress,
  Avatar,
  Tooltip,
} from "@mui/material";
import { useSelector } from "react-redux";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Chip from "@mui/material/Chip";
import { GalleryImage } from "./types";
import {
  fetchStateGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
  setGalleryProfileImage,
} from "./homeApi";
import { RootState } from "../../../store";
import { getApiErrorMessage } from "../../../services/apiError";

export default function VskImageUpload() {
  const user = useSelector((state: RootState) => state.auth.user);
  const stateCode = user?.stateCode;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = (filePath?: string): string => {
    if (!filePath) {
      return "";
    }

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    const fileName = filePath.split(/[\\/]/).pop();

    if (!fileName) {
      return "";
    }

    const baseUrl = import.meta.env.VITE_PORTAL_API_URL;

    return `${baseUrl.replace(/\/+$/, "")}/gallery/files/${encodeURIComponent(
      fileName,
    )}`;
  };

  useEffect(() => {
    if (stateCode) {
      loadImages(stateCode);
    }
  }, [stateCode]);

  async function loadImages(stateCode: string) {
    try {
      const data = await fetchStateGalleryImages(stateCode);
      setImages(data);
    } catch (err) {
      setImages([]);
      setSnackbar({
        open: true,
        message: getApiErrorMessage(err, "Failed to load gallery images"),
        severity: "error",
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(selected.type)) {
      setSnackbar({
        open: true,
        message: "Only JPEG, PNG, and WebP images are allowed",
        severity: "error",
      });

      e.target.value = "";
      return;
    }

    // Validate file size - maximum 10 MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (selected.size > MAX_FILE_SIZE) {
      setSnackbar({
        open: true,
        message: "Image size must not exceed 10 MB",
        severity: "error",
      });

      e.target.value = "";
      return;
    }

    setFile(selected);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await uploadGalleryImage(file, caption);
      setSnackbar({
        open: true,
        message: "Image uploaded successfully",
        severity: "success",
      });
      setFile(null);
      setPreview(null);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (stateCode) {
        await loadImages(stateCode);
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to upload image. Please try again.",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryImage(id);
      setSnackbar({
        open: true,
        message: "Image deleted successfully",
        severity: "success",
      });
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete image",
        severity: "error",
      });
    }
  };

  const handleSetProfile = async (id: string) => {
    try {
      await setGalleryProfileImage(id);
      // Exactly one profile image per state: flip locally.
      setImages((prev) =>
        prev.map((img) => ({ ...img, isProfileImage: img.id === id })),
      );
      setSnackbar({
        open: true,
        message:
          "Profile image updated. It will show in the State Profile slider on the portal.",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: getApiErrorMessage(err, "Failed to set profile image"),
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 3 }}>
        Upload VSK Gallery Image
      </Typography>

      {/* Upload Form */}
      <Card sx={{ borderRadius: 2, border: "1px solid #F1F5F9", mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* File Input */}
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="gallery-image-input"
              />
              <label htmlFor="gallery-image-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Choose Image
                </Button>
              </label>
              {file && (
                <Typography variant="caption" sx={{ ml: 2, color: "#475569" }}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Typography>
              )}
            </Box>

            {/* Image Preview */}
            {preview && (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #E2E8F0",
                }}
              >
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            )}

            {/* Caption */}
            <TextField
              label="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              size="small"
              fullWidth
              sx={{ maxWidth: 400 }}
              placeholder="e.g., VSK Rajasthan Inauguration Ceremony"
            />

            {/* Upload Button */}
            <Box>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!file || uploading}
                startIcon={<CloudUploadIcon />}
                sx={{
                  bgcolor: "#7C3AED",
                  "&:hover": { bgcolor: "#6D28D9" },
                  textTransform: "none",
                }}
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            </Box>

            {/* Progress */}
            {uploading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
          </Box>
        </CardContent>
      </Card>

      {/* Uploaded Images Grid */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Your Uploaded Images
      </Typography>

      {images.length > 0 ? (
        <Grid container spacing={2}>
          {images.map((img) => (
            <Grid item xs={6} sm={4} md={3} key={img.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  position: "relative",
                  border: img.isProfileImage
                    ? "2px solid #7C3AED"
                    : "1px solid #F1F5F9",
                }}
              >
                {img.isProfileImage && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 14 }} />}
                    label="Profile"
                    size="small"
                    color="secondary"
                    sx={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      zIndex: 1,
                      bgcolor: "#7C3AED",
                      color: "#fff",
                      fontSize: "0.65rem",
                      height: 20,
                    }}
                  />
                )}
                <Box
                  sx={{
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar
                    src={getImageUrl(img.filePath)}
                    alt={img.caption || "Gallery Image"}
                    variant="rounded"
                    sx={{ width: 150, height: 80 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                    noWrap
                  >
                    {img.caption || img.stateName}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip
                      title={
                        img.isProfileImage
                          ? "This is your profile image"
                          : "Set as Profile Image"
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleSetProfile(img.id)}
                          disabled={img.isProfileImage}
                          sx={{
                            color: img.isProfileImage ? "#7C3AED" : "#94A3B8",
                            "&:hover": { bgcolor: "#F5F3FF" },
                          }}
                        >
                          {img.isProfileImage ? (
                            <StarIcon fontSize="small" />
                          ) : (
                            <StarBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete image">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(img.id)}
                        sx={{
                          color: "#EF4444",
                          "&:hover": { bgcolor: "#FEF2F2" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <ImageIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No images uploaded yet
          </Typography>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
