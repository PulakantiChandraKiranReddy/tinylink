import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import BarChartIcon from "@mui/icons-material/BarChart";
import RefreshIcon from "@mui/icons-material/Refresh";

import snackbarStyles from "../styles/Snackbar.module.css";

type LinkRow = {
  id: number;
  code: string;
  target: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
};

type AlertState = {
  type: "" | "error" | "success" | "info";
  message: string;
};

const URL_REGEX = /^https?:\/\/.+/i;
const CODE_REGEX = /^[a-zA-Z0-9]{6,8}$/;

export default function Dashboard() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [target, setTarget] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingLinks, setFetchingLinks] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState<AlertState>({ type: "", message: "" });

  // Show alert with auto-dismiss for success messages
  const showAlert = useCallback((type: AlertState["type"], message: string) => {
    setAlert({ type, message });
  }, []);

  // Clear alert
  const clearAlert = useCallback(() => {
    setAlert({ type: "", message: "" });
  }, []);

  // Fetch all links
  const fetchLinks = useCallback(async () => {
    try {
      setFetchingLinks(true);
      const res = await fetch("/api/links");

      if (!res.ok) {
        throw new Error("Failed to fetch links");
      }

      const data = await res.json();
      setLinks(data);
    } catch (error) {
      showAlert("error", "Failed to load links. Please try again.");
      console.error("Error fetching links:", error);
    } finally {
      setFetchingLinks(false);
    }
  }, [showAlert]);

  // Initial load
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Auto-dismiss success alerts
  useEffect(() => {
    if (alert.type === "success") {
      const timer = setTimeout(clearAlert, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.type, clearAlert]);

  // Memoized filtered links
  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;

    const term = search.toLowerCase();
    return links.filter(
      (link) =>
        link.code.toLowerCase().includes(term) ||
        link.target.toLowerCase().includes(term)
    );
  }, [search, links]);

  // Validate URL
  const validateUrl = (url: string): boolean => {
    return URL_REGEX.test(url);
  };

  // Validate custom code
  const validateCode = (code: string): boolean => {
    return !code || CODE_REGEX.test(code);
  };

  // Create a new link
  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlert();

    // Validation
    if (!validateUrl(target)) {
      showAlert("error", "URL must start with http:// or https://");
      return;
    }

    if (customCode && !validateCode(customCode)) {
      showAlert("error", "Custom code must be 6–8 alphanumeric characters");
      return;
    }

    setLoading(true);

    try {
      const body: { target: string; code?: string } = { target };
      if (customCode.trim()) {
        body.code = customCode.trim();
      }

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create link");
      }

      // Reset form
      setTarget("");
      setCustomCode("");

      showAlert("success", "Short link created successfully!");
      await fetchLinks();
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Failed to create link"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete link
  const deleteLink = async (code: string) => {
    if (!confirm(`Are you sure you want to delete the link "${code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error("Failed to delete link");
      }

      showAlert("success", "Link deleted successfully!");
      await fetchLinks();
    } catch (error) {
      showAlert("error", "Failed to delete link. Please try again.");
      console.error("Error deleting link:", error);
    }
  };

  // Copy short URL to clipboard
  const copyURL = async (code: string) => {
    try {
      const url = `${window.location.origin}/${code}`;
      await navigator.clipboard.writeText(url);
      showAlert("success", "Link copied to clipboard!");
    } catch (error) {
      showAlert("error", "Failed to copy link");
      console.error("Error copying to clipboard:", error);
    }
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never";

    try {
      return new Date(dateString).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          TinyLink Dashboard
        </Typography>

        <Tooltip title="Refresh links">
          <IconButton
            onClick={fetchLinks}
            disabled={fetchingLinks}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Alert */}
      {alert.type && (
        <Alert
          severity={alert.type}
          className={snackbarStyles.alertBox}
          onClose={clearAlert}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Create Link Form */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create New Short Link
          </Typography>

          <form onSubmit={createLink}>
            <TextField
              fullWidth
              label="Target URL"
              variant="outlined"
              margin="normal"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                if (alert.type === "error") clearAlert();
              }}
              placeholder="https://example.com/your-long-url"
              error={target !== "" && !validateUrl(target)}
              helperText={
                target !== "" && !validateUrl(target)
                  ? "URL must start with http:// or https://"
                  : ""
              }
              required
            />

            <TextField
              fullWidth
              label="Custom Code"
              variant="outlined"
              margin="normal"
              value={customCode}
              onChange={(e) => {
                setCustomCode(e.target.value);
                if (alert.type === "error") clearAlert();
              }}
              placeholder="e.g., mylink1"
              inputProps={{ maxLength: 8 }}
              error={customCode !== "" && !validateCode(customCode)}
              required
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading || !target || !customCode}
              sx={{ mt: 2 }}
              size="large"
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating...
                </>
              ) : (
                "Create Link"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search */}
      <TextField
        fullWidth
        label="Search links"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by code or URL..."
        sx={{ mt: 3, mb: 3 }}
      />

      {/* Stats Chip */}
      <Box sx={{ mb: 2 }}>
        <Chip
          label={`${filteredLinks.length} link${
            filteredLinks.length !== 1 ? "s" : ""
          }`}
          color="primary"
          variant="outlined"
        />
        {search && (
          <Chip label={`Filtered from ${links.length} total`} sx={{ ml: 1 }} />
        )}
      </Box>

      {/* Links Table */}
      {fetchingLinks ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredLinks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {search ? "No links match your search" : "No links created yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {search
              ? "Try a different search term"
              : "Create your first short link above"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Short Code</strong>
                </TableCell>
                <TableCell>
                  <strong>Target URL</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Clicks</strong>
                </TableCell>
                <TableCell>
                  <strong>Last Clicked</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id} hover>
                  <TableCell>
                    <Tooltip title="Open in new tab">
                      <a
                        href={`/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={snackbarStyles.shortCode}
                      >
                        {link.code}
                      </a>
                    </Tooltip>
                  </TableCell>

                  <TableCell
                    sx={{
                      maxWidth: 300,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Tooltip title={link.target}>
                      <span>{link.target}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={link.clicks}
                      size="small"
                      color={link.clicks > 0 ? "success" : "default"}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(link.last_clicked)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Copy link">
                      <IconButton
                        onClick={() => copyURL(link.code)}
                        size="small"
                        color="primary"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="View analytics">
                      <Link href={`/code/${link.code}`}>
                        <IconButton size="small" color="info">
                          <BarChartIcon fontSize="small" />
                        </IconButton>
                      </Link>
                    </Tooltip>

                    <Tooltip title="Delete link">
                      <IconButton
                        color="error"
                        onClick={() => deleteLink(link.code)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
