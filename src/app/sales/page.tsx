"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import type { SalesSummaryDto } from "@/types/sales";
import { SalesFilterForm } from "@/components/sales/SalesFilterForm";
import { SalesSummaryCard } from "@/components/sales/SalesSummaryCard";
import { SalesMonthlyChart } from "@/components/sales/SalesMonthlyChart";
import { SalesPlatformBreakdown } from "@/components/sales/SalesPlatformBreakdown";
import { SalesProductBreakdown } from "@/components/sales/SalesProductBreakdown";
import { SalesTable } from "@/components/sales/SalesTable";

function getDefaultStartDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
}

function getDefaultEndDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SalesPage() {
  const [summary, setSummary] = useState<SalesSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultStartDate = useMemo(() => getDefaultStartDate(), []);
  const defaultEndDate = useMemo(() => getDefaultEndDate(), []);

  const fetchSummary = useCallback(
    async (params: {
      startDate: string;
      endDate: string;
      platform: "minne" | "creema" | "all";
    }) => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          startDate: params.startDate,
          endDate: params.endDate,
          platform: params.platform,
        });

        const response = await fetch(
          `/api/sales/summary?${searchParams.toString()}`,
        );
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error ?? "売上集計の取得に失敗しました");
        }

        const data = (await response.json()) as SalesSummaryDto;
        setSummary(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "予期しないエラーが発生しました",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchSummary({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      platform: "all",
    });
  }, [fetchSummary, defaultStartDate, defaultEndDate]);

  const handleFilter = useCallback(
    async (params: {
      startDate: string;
      endDate: string;
      platform: "minne" | "creema" | "all";
    }) => {
      await fetchSummary(params);
    },
    [fetchSummary],
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            component={Link}
            href="/"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <BarChartIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            売上集計
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <SalesFilterForm
            isLoading={loading}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
            onFilter={handleFilter}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && !summary && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        )}

        {summary && (
          <>
            <Box sx={{ mb: 3 }}>
              <SalesSummaryCard
                totalSales={summary.totalSales}
                totalOrders={summary.totalOrders}
                averageOrderValue={summary.averageOrderValue}
                ordersWithMissingPrice={summary.ordersWithMissingPrice}
              />
            </Box>

            <Box
              sx={{
                mb: 3,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 2,
              }}
            >
              <SalesMonthlyChart breakdown={summary.monthlyBreakdown} />
              <SalesPlatformBreakdown
                breakdown={summary.platformBreakdown}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                商品別売上
              </Typography>
              <SalesProductBreakdown breakdown={summary.productBreakdown} />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                注文一覧（発送済みのみ）
              </Typography>
              <SalesTable orders={summary.orders} isLoading={loading} />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
